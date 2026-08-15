import {
  CAREER_STAGE_ORDER,
  INITIAL_PLAYER,
  METER_MAX,
  METER_MIN,
  MONEY_MIN,
  OVERALL_MAX,
  OVERALL_MIN,
  OVERALL_WEIGHTS,
  SKILL_MAX,
  SKILL_MIN,
  STAGE_TEAM,
} from "./constants.ts";
import { getEventById, getEventsByStage } from "./events.ts";
import type {
  CareerHistoryEntry,
  CareerStage,
  Choice,
  ChoiceEffects,
  ClampStat,
  GameEvent,
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

function applyEffects(
  player: PlayerState,
  effects: ChoiceEffects,
): PlayerState {
  const next: PlayerState = { ...player };

  for (const key of SKILL_STATS) {
    const delta = effects[key];
    if (delta !== undefined) {
      next[key] = clampSkill(player[key] + delta);
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

  return withRecalculatedOverall(next);
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

  const stageEvents = getEventsByStage(player.stage);
  if (stageEvents.length === 0) {
    return true;
  }

  const completedIds = new Set(player.careerHistory.map((entry) => entry.eventId));
  return stageEvents.every((event) => completedIds.has(event.id));
}

function firstEventOfStage(stage: CareerStage): GameEvent | undefined {
  return getEventsByStage(stage)[0];
}

function nextEventInStage(
  stage: CareerStage,
  currentEventId: string,
): GameEvent | undefined {
  const stageEvents = getEventsByStage(stage);
  const index = stageEvents.findIndex((event) => event.id === currentEventId);
  if (index < 0) {
    return undefined;
  }
  return stageEvents[index + 1];
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
    trophies: [...INITIAL_PLAYER.trophies],
    careerHistory: [],
    currentEventId: firstEventOfStage("NORTH_POLE")?.id ?? null,
    isGameOver: false,
  };

  return withRecalculatedOverall(base);
}

export function restartCareer(): PlayerState {
  return createInitialPlayer();
}

export function getCurrentEvent(player: PlayerState): GameEvent | null {
  if (player.isGameOver || player.stage === "RETIRED" || !player.currentEventId) {
    return null;
  }
  return getEventById(player.currentEventId) ?? null;
}

export function isCareerFinished(player: PlayerState): boolean {
  return player.isGameOver || player.stage === "RETIRED";
}

export function advanceStage(player: PlayerState): PlayerState {
  if (player.stage === "RETIRED" || player.isGameOver) {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
    };
  }

  const nextStage = getNextStage(player.stage);
  if (!nextStage) {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
    };
  }

  if (nextStage === "RETIRED") {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
      overall: calculateOverall(player),
    };
  }

  const firstEvent = firstEventOfStage(nextStage);

  return withRecalculatedOverall({
    ...player,
    stage: nextStage,
    team: STAGE_TEAM[nextStage],
    currentEventId: firstEvent?.id ?? null,
    isGameOver: false,
  });
}

export function advanceEvent(player: PlayerState): PlayerState {
  if (player.isGameOver || player.stage === "RETIRED") {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
    };
  }

  if (!player.currentEventId) {
    return advanceStage(player);
  }

  const currentEvent = getEventById(player.currentEventId);
  if (!currentEvent) {
    return advanceStage(player);
  }

  const upcoming = nextEventInStage(player.stage, player.currentEventId);
  if (upcoming) {
    return {
      ...player,
      currentEventId: upcoming.id,
    };
  }

  const targetStage = currentEvent.nextStageAfterComplete ?? getNextStage(player.stage);
  if (!targetStage || targetStage === "RETIRED") {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
      overall: calculateOverall(player),
    };
  }

  const firstEvent = firstEventOfStage(targetStage);
  return withRecalculatedOverall({
    ...player,
    stage: targetStage,
    team: STAGE_TEAM[targetStage],
    currentEventId: firstEvent?.id ?? null,
    isGameOver: false,
  });
}

function findChoice(event: GameEvent, choiceId: string): Choice | undefined {
  return event.choices.find((choice) => choice.id === choiceId);
}

export function applyChoice(player: PlayerState, choiceId: string): PlayerState {
  if (player.isGameOver || player.stage === "RETIRED") {
    return {
      ...player,
      stage: "RETIRED",
      team: STAGE_TEAM.RETIRED,
      currentEventId: null,
      isGameOver: true,
    };
  }

  const event = getCurrentEvent(player);
  if (!event) {
    return player;
  }

  const choice = findChoice(event, choiceId);
  if (!choice) {
    return player;
  }

  const withEffects = applyEffects(player, choice.effects);

  const historyEntry: CareerHistoryEntry = {
    eventId: event.id,
    stage: event.stage,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceText: choice.text,
    timestamp: Date.now(),
  };

  const withHistory: PlayerState = {
    ...withEffects,
    careerHistory: [...withEffects.careerHistory, historyEntry],
  };

  return advanceEvent(withHistory);
}
