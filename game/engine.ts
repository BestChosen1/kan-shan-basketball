import {
  CAREER_STAGE_ORDER,
  DRAFT_STOCK_MAX,
  DRAFT_STOCK_MIN,
  INITIAL_PLAYER,
  MAX_NBA_SEASONS,
  METER_MAX,
  METER_MIN,
  MONEY_MIN,
  OVERALL_MAX,
  OVERALL_MIN,
  OVERALL_WEIGHTS,
  SKILL_GAIN_MULTIPLIER,
  SKILL_MAX,
  SKILL_MIN,
  STAGE_ADVANCE_SKILL_BONUS,
  STAGE_ENTRY_AGE,
  STAGE_TEAM,
} from "./constants.ts";
import { resolveAwards } from "./awards.ts";
import { calculateCareerScore, resolveCareerTier } from "./career.ts";
import { resolveContract } from "./contract.ts";
import { getEventById, getEventsByStage } from "./events.ts";
import { resolveDraft, resolveDraftRole } from "./draft.ts";
import { resolveMatch } from "./match.ts";
import {
  resolveNbaArcPhase,
  resolveNbaArcSentinel,
  roleFromNbaArcPhase,
} from "./nba-arc.ts";
import type {
  AwardResult,
  CareerFlag,
  CareerHistoryEntry,
  CareerStage,
  Choice,
  ChoiceEffects,
  ClampStat,
  ContractResult,
  DraftResult,
  GameEvent,
  MatchResult,
  PlayerState,
  SkillStat,
} from "./types.ts";

const SKILL_STATS: SkillStat[] = [
  "shooting",
  "finishing",
  "passing",
  "defense",
  "physical",
  "basketballIQ",
];

const METER_STATS: ClampStat[] = [
  "stamina",
  "potential",
  "mental",
  "fame",
  "zhihuReputation",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampSkill(value: number): number {
  return clamp(Math.round(value), SKILL_MIN, SKILL_MAX);
}

function clampMeter(value: number): number {
  return clamp(Math.round(value), METER_MIN, METER_MAX);
}

function clampMoney(value: number): number {
  return Math.max(MONEY_MIN, Math.round(value));
}

function clampDraftStock(value: number): number {
  return clamp(Math.round(value), DRAFT_STOCK_MIN, DRAFT_STOCK_MAX);
}

export function calculateOverall(
  player: Pick<PlayerState, SkillStat>,
): number {
  const raw =
    player.shooting * OVERALL_WEIGHTS.shooting +
    player.finishing * OVERALL_WEIGHTS.finishing +
    player.passing * OVERALL_WEIGHTS.passing +
    player.defense * OVERALL_WEIGHTS.defense +
    player.physical * OVERALL_WEIGHTS.physical +
    player.basketballIQ * OVERALL_WEIGHTS.basketballIQ;

  return clamp(Math.round(raw), OVERALL_MIN, OVERALL_MAX);
}

function withRecalculatedOverall(player: PlayerState): PlayerState {
  return {
    ...player,
    overall: calculateOverall(player),
  };
}

function scaleSkillDelta(delta: number): number {
  if (delta <= 0) {
    return delta;
  }
  return Math.round(delta * SKILL_GAIN_MULTIPLIER);
}

function applyEffects(
  player: PlayerState,
  effects: ChoiceEffects,
): PlayerState {
  const next: PlayerState = { ...player };

  for (const key of SKILL_STATS) {
    const delta = effects[key];
    if (delta !== undefined) {
      next[key] = clampSkill(player[key] + scaleSkillDelta(delta));
    }
  }

  for (const key of METER_STATS) {
    const delta = effects[key];
    if (delta !== undefined) {
      next[key] = clampMeter(player[key] + delta);
    }
  }

  if (effects.money !== undefined) {
    next.money = clampMoney(player.money + effects.money);
  }

  if (effects.draftStock !== undefined) {
    next.draftStock = clampDraftStock(player.draftStock + effects.draftStock);
  }

  return withRecalculatedOverall(next);
}

export function applyChoiceFlags(
  player: PlayerState,
  choice: Choice,
): PlayerState {
  let flags = [...player.flags];
  for (const flag of choice.clearFlags ?? []) {
    flags = flags.filter((item) => item !== flag);
  }
  for (const flag of choice.setFlags ?? []) {
    if (!flags.includes(flag)) {
      flags.push(flag);
    }
  }
  return { ...player, flags };
}

export function isEventEligible(
  event: GameEvent,
  flags: readonly CareerFlag[],
): boolean {
  if (event.requiresFlags?.some((flag) => !flags.includes(flag))) {
    return false;
  }
  if (event.excludesFlags?.some((flag) => flags.includes(flag))) {
    return false;
  }
  return true;
}

function applyStageAdvanceBonus(player: PlayerState): PlayerState {
  const next: PlayerState = { ...player };
  for (const key of SKILL_STATS) {
    next[key] = clampSkill(player[key] + STAGE_ADVANCE_SKILL_BONUS);
  }
  return withRecalculatedOverall(next);
}

function withStageIdentity(
  player: PlayerState,
  stage: CareerStage,
): PlayerState {
  const fromIndex = getStageIndex(player.stage);
  const toIndex = getStageIndex(stage);
  const advancing = toIndex > fromIndex;
  return {
    ...player,
    stage,
    team: STAGE_TEAM[stage],
    // 前进到新阶段时抬到入门年龄；回退（如国家队→NBA）保留当前年龄
    age: advancing
      ? Math.max(player.age, STAGE_ENTRY_AGE[stage])
      : player.age,
  };
}

function enterStageState(
  player: PlayerState,
  stage: CareerStage,
): PlayerState {
  const fromIndex = getStageIndex(player.stage);
  const toIndex = getStageIndex(stage);
  const advancing = toIndex > fromIndex;
  const withIdentity = withStageIdentity(player, stage);
  return advancing
    ? applyStageAdvanceBonus(withIdentity)
    : withIdentity;
}

function getStageIndex(stage: CareerStage): number {
  return CAREER_STAGE_ORDER.indexOf(stage);
}

export function getNextStage(stage: CareerStage): CareerStage | null {
  const index = getStageIndex(stage);
  if (index < 0 || index >= CAREER_STAGE_ORDER.length - 1) {
    return null;
  }
  return CAREER_STAGE_ORDER[index + 1] ?? null;
}

export function isStageComplete(player: PlayerState): boolean {
  if (player.stage === "RETIRED") {
    return true;
  }

  const stageEvents = getEventsByStage(player.stage).filter((event) =>
    isEventEligible(event, player.flags),
  );
  if (stageEvents.length === 0) {
    return true;
  }

  const completedIds = new Set(
    player.careerHistory.map((entry) => entry.eventId),
  );
  return stageEvents.every((event) => completedIds.has(event.id));
}

function firstEligibleEventOfStage(
  stage: CareerStage,
  flags: readonly CareerFlag[],
): GameEvent | undefined {
  return getEventsByStage(stage).find((event) =>
    isEventEligible(event, flags),
  );
}

function nextEligibleInStage(
  stage: CareerStage,
  currentEventId: string,
  flags: readonly CareerFlag[],
): GameEvent | undefined {
  const stageEvents = getEventsByStage(stage);
  const index = stageEvents.findIndex((event) => event.id === currentEventId);
  if (index < 0) {
    return undefined;
  }
  return stageEvents
    .slice(index + 1)
    .find((event) => isEventEligible(event, flags));
}

function goToEvent(player: PlayerState, eventId: string): PlayerState {
  const resolvedId = resolveNbaArcSentinel(eventId, player) ?? eventId;
  const target = getEventById(resolvedId);
  if (!target) {
    return retirePlayer(player);
  }

  if (target.stage === player.stage) {
    const sameStage: PlayerState = {
      ...player,
      currentEventId: target.id,
      isGameOver: false,
    };
    if (target.stage === "NBA" && sameStage.nbaSeason < 1) {
      return { ...sameStage, nbaSeason: 1 };
    }
    return sameStage;
  }

  const enteredBase = enterStageState(player, target.stage);
  const entered: PlayerState = {
    ...enteredBase,
    currentEventId: target.id,
    isGameOver: false,
    nbaSeason:
      target.stage === "NBA"
        ? Math.max(1, enteredBase.nbaSeason || 0)
        : enteredBase.nbaSeason,
  };
  return entered;
}

export function createInitialPlayer(): PlayerState {
  const base: PlayerState = {
    name: INITIAL_PLAYER.name,
    age: INITIAL_PLAYER.age,
    stage: INITIAL_PLAYER.stage,
    overall: 0,
    shooting: INITIAL_PLAYER.shooting,
    finishing: INITIAL_PLAYER.finishing,
    passing: INITIAL_PLAYER.passing,
    defense: INITIAL_PLAYER.defense,
    physical: INITIAL_PLAYER.physical,
    basketballIQ: INITIAL_PLAYER.basketballIQ,
    stamina: INITIAL_PLAYER.stamina,
    potential: INITIAL_PLAYER.potential,
    mental: INITIAL_PLAYER.mental,
    fame: INITIAL_PLAYER.fame,
    zhihuReputation: INITIAL_PLAYER.zhihuReputation,
    money: INITIAL_PLAYER.money,
    team: INITIAL_PLAYER.team,
    trophies: [],
    awards: [],
    careerHistory: [],
    currentEventId:
      firstEligibleEventOfStage("NORTH_POLE", [])?.id ?? null,
    isGameOver: false,
    wins: INITIAL_PLAYER.wins,
    losses: INITIAL_PLAYER.losses,
    matchHistory: [],
    draftHistory: [],
    contracts: [],
    draftStock: INITIAL_PLAYER.draftStock,
    role: INITIAL_PLAYER.role,
    lastOutcome: null,
    careerScore: INITIAL_PLAYER.careerScore,
    careerTier: null,
    flags: [],
    nbaSeason: INITIAL_PLAYER.nbaSeason,
  };

  return withRecalculatedOverall(base);
}

export function restartCareer(): PlayerState {
  return createInitialPlayer();
}

export function getCurrentEvent(player: PlayerState): GameEvent | null {
  if (
    player.isGameOver ||
    player.stage === "RETIRED" ||
    !player.currentEventId
  ) {
    return null;
  }
  const event = getEventById(player.currentEventId);
  if (!event) {
    return null;
  }
  return customizeEventForPlayer(player, event);
}

function customizeEventForPlayer(
  player: PlayerState,
  event: GameEvent,
): GameEvent {
  if (event.id !== "nba-offseason") {
    return event;
  }

  const [continueChoice, nationalChoice, retireChoice] = event.choices;
  const atCap = player.nbaSeason >= MAX_NBA_SEASONS;
  const ntDone = player.flags.includes("NT_DONE");

  if (atCap) {
    const capRetire: Choice = {
      id: "nba-off-cap-retire",
      text: "身体到极限，宣布退役",
      effects: { mental: 1, fame: 2 },
      nextStage: "RETIRED",
    };
    const second: Choice = ntDone
      ? {
          id: "nba-off-cap-reflect",
          text: "再想想（仍须做出退役决定）",
          effects: { mental: 1, stamina: 1 },
          nextEventId: "nba-offseason",
        }
      : nationalChoice;
    return {
      ...event,
      description:
        "漫长的 NBA 征途已触及长度上限。你可以接受国家队窗口，或正式退役——再战一季已不再现实。",
      choices: [capRetire, second, retireChoice],
    };
  }

  if (ntDone) {
    return {
      ...event,
      choices: [
        continueChoice,
        {
          id: "nba-off-nt-done",
          text: "本窗口已完成国家队征召",
          effects: { mental: 1 },
          nextEventId: "nba-offseason",
        },
        retireChoice,
      ],
    };
  }

  return event;
}

export function isCareerFinished(player: PlayerState): boolean {
  return player.isGameOver || player.stage === "RETIRED";
}

function retirePlayer(player: PlayerState): PlayerState {
  const retired = withRecalculatedOverall({
    ...withStageIdentity(player, "RETIRED"),
    currentEventId: null,
    isGameOver: true,
  });
  const careerScore = calculateCareerScore(retired);
  return {
    ...retired,
    careerScore,
    careerTier: resolveCareerTier(careerScore),
  };
}

function enterPlayableStage(
  player: PlayerState,
  stage: CareerStage,
): PlayerState {
  if (stage === "RETIRED") {
    return retirePlayer(player);
  }

  const withBonus = enterStageState(player, stage);
  const firstEvent = firstEligibleEventOfStage(stage, withBonus.flags);

  if (!firstEvent) {
    const further = getNextStage(stage);
    if (!further || further === "RETIRED") {
      return retirePlayer(withBonus);
    }
    return enterPlayableStage(withBonus, further);
  }

  return {
    ...withBonus,
    currentEventId: firstEvent.id,
    isGameOver: false,
    nbaSeason:
      stage === "NBA" ? Math.max(1, withBonus.nbaSeason || 0) : withBonus.nbaSeason,
  };
}

export function advanceStage(player: PlayerState): PlayerState {
  if (player.stage === "RETIRED" || player.isGameOver) {
    return retirePlayer(player);
  }

  const nextStage = getNextStage(player.stage);
  if (!nextStage || nextStage === "RETIRED") {
    return retirePlayer(player);
  }

  return enterPlayableStage(player, nextStage);
}

export function advanceFromChoice(
  player: PlayerState,
  event: GameEvent,
  choice: Choice,
): PlayerState {
  if (player.isGameOver || player.stage === "RETIRED") {
    return retirePlayer(player);
  }

  if (choice.nextEventId) {
    return goToEvent(player, choice.nextEventId);
  }

  if (choice.nextStage) {
    if (choice.nextStage === "RETIRED") {
      return retirePlayer(player);
    }
    return enterPlayableStage(player, choice.nextStage);
  }

  if (event.nextEventId) {
    const resolvedId =
      resolveNbaArcSentinel(event.nextEventId, player) ?? event.nextEventId;
    const routed = getEventById(resolvedId);
    if (routed && isEventEligible(routed, player.flags)) {
      return goToEvent(player, resolvedId);
    }
  }

  const upcoming = nextEligibleInStage(
    player.stage,
    event.id,
    player.flags,
  );
  if (upcoming) {
    return {
      ...player,
      currentEventId: upcoming.id,
    };
  }

  const targetStage =
    event.nextStageAfterComplete ?? getNextStage(player.stage);

  if (!targetStage || targetStage === "RETIRED") {
    return retirePlayer(player);
  }

  return enterPlayableStage(player, targetStage);
}

export function advanceEvent(player: PlayerState): PlayerState {
  if (player.isGameOver || player.stage === "RETIRED") {
    return retirePlayer(player);
  }

  if (!player.currentEventId) {
    return advanceStage(player);
  }

  const currentEvent = getEventById(player.currentEventId);
  if (!currentEvent) {
    return advanceStage(player);
  }

  return advanceFromChoice(player, currentEvent, {
    id: "__advance__",
    text: "",
    effects: {},
  });
}

function findChoice(event: GameEvent, choiceId: string): Choice | undefined {
  return event.choices.find((choice) => choice.id === choiceId);
}

function applyMatchOutcome(
  player: PlayerState,
  result: MatchResult,
  awardResult: AwardResult,
): PlayerState {
  return {
    ...player,
    wins: player.wins + (result.won ? 1 : 0),
    losses: player.losses + (result.won ? 0 : 1),
    matchHistory: [...player.matchHistory, result],
    draftStock: clamp(
      player.draftStock + result.draftStockDelta,
      DRAFT_STOCK_MIN,
      DRAFT_STOCK_MAX,
    ),
    fame: clampMeter(
      player.fame + result.fameDelta + awardResult.fameDelta,
    ),
    stamina: clampMeter(player.stamina + result.staminaDelta),
    trophies: [...player.trophies, ...awardResult.trophies],
    awards: [...player.awards, ...awardResult.awards],
    lastOutcome: { kind: "MATCH", result, awards: awardResult },
  };
}

function formatMatchHistoryChoiceText(
  choice: Choice,
  result: MatchResult,
): string {
  const verdict = result.won ? "胜" : "负";
  return `${choice.text}｜${verdict} ${result.playerScore}-${result.opponentScore}｜${result.highlight}`;
}

function applyDraftOutcome(
  player: PlayerState,
  draftResult: DraftResult,
  contractResult: ContractResult,
): PlayerState {
  const { contract, fameDelta } = contractResult;
  return {
    ...player,
    draftHistory: [...player.draftHistory, draftResult],
    contracts: [...player.contracts, contract],
    team: draftResult.teamName,
    role: resolveDraftRole(draftResult.tier),
    money: clampMoney(player.money + contract.signingBonus),
    fame: clampMeter(player.fame + fameDelta),
    lastOutcome: {
      kind: "DRAFT",
      result: draftResult,
      contract: contractResult,
    },
  };
}

function formatDraftHistoryChoiceText(
  choice: Choice,
  draftResult: DraftResult,
  contractResult: ContractResult,
): string {
  return `${choice.text}｜${draftResult.message}｜${contractResult.summary}`;
}

export function applyChoice(
  player: PlayerState,
  choiceId: string,
): PlayerState {
  if (player.isGameOver || player.stage === "RETIRED") {
    return retirePlayer(player);
  }

  const event = getCurrentEvent(player);
  if (!event) {
    return player;
  }

  const choice = findChoice(event, choiceId);
  if (!choice) {
    return player;
  }

  let next = applyEffects(player, choice.effects);
  next = applyChoiceFlags(next, choice);

  if (choice.advanceNbaSeason) {
    if (next.nbaSeason >= MAX_NBA_SEASONS) {
      // 赛季上限不再强制退役；停留在休赛期由玩家选择退役 / 国家队
      const historyEntry: CareerHistoryEntry = {
        eventId: event.id,
        stage: event.stage,
        eventTitle: event.title,
        choiceId: choice.id,
        choiceText: `${choice.text}｜已达赛季上限，请在休赛期做出决定`,
        timestamp: Date.now(),
      };
      return {
        ...next,
        careerHistory: [...next.careerHistory, historyEntry],
        currentEventId: "nba-offseason",
      };
    }
    next = {
      ...next,
      age: next.age + 1,
      nbaSeason: next.nbaSeason + 1,
      stamina: clampMeter(next.stamina + 12),
    };
    const phase = resolveNbaArcPhase(next);
    next = {
      ...next,
      role: roleFromNbaArcPhase(phase),
    };
  }

  let historyChoiceText = choice.text;

  if (event.eventKind === "MATCH") {
    const matchResult = resolveMatch(next, event, choice);
    const awardResult = resolveAwards(next, event, matchResult);
    next = applyMatchOutcome(next, matchResult, awardResult);
    historyChoiceText = formatMatchHistoryChoiceText(choice, matchResult);
  } else if (event.eventKind === "DRAFT") {
    const draftResult = resolveDraft(next, event, choice);
    const contractResult = resolveContract(next, draftResult);
    next = applyDraftOutcome(next, draftResult, contractResult);
    historyChoiceText = formatDraftHistoryChoiceText(
      choice,
      draftResult,
      contractResult,
    );
  }

  const historyEntry: CareerHistoryEntry = {
    eventId: event.id,
    stage: event.stage,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceText: historyChoiceText,
    timestamp: Date.now(),
  };

  const withHistory: PlayerState = {
    ...next,
    careerHistory: [...next.careerHistory, historyEntry],
  };

  return advanceFromChoice(withHistory, event, choice);
}
