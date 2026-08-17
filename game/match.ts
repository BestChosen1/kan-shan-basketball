import {
  INTENT_BONUS,
  MATCH_NBA_SEASON_OPPONENT_SCALE,
  MATCH_PERFORMANCE_WEIGHTS,
  MATCH_STAMINA_PENALTY_DIV,
  MATCH_WIN_MARGIN,
  PERFORMANCE_MAX,
  PERFORMANCE_MIN,
  ROLE_BONUS,
  STAKES_BONUS,
  STAMINA_COST_BY_STAKES,
} from "./constants.ts";
import type {
  Choice,
  EventVisualType,
  GameEvent,
  MatchResult,
  MatchStakes,
  PlayerState,
  TrophyId,
} from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateBasePerformance(player: PlayerState): number {
  const w = MATCH_PERFORMANCE_WEIGHTS;
  return (
    player.shooting * w.shooting +
    player.finishing * w.finishing +
    player.passing * w.passing +
    player.defense * w.defense +
    player.physical * w.physical +
    player.basketballIQ * w.basketballIQ +
    player.mental * w.mental +
    player.stamina * w.stamina +
    player.overall * w.overall
  );
}

export function getIntentBonus(choice: Choice): number {
  if (!choice.intent) {
    return 0;
  }
  return INTENT_BONUS[choice.intent];
}

export function calculateMatchPerformance(
  player: PlayerState,
  choice: Choice,
  stakes: MatchStakes,
): number {
  const raw =
    calculateBasePerformance(player) +
    getIntentBonus(choice) +
    ROLE_BONUS[player.role] +
    STAKES_BONUS[stakes];

  return clamp(Math.round(raw), PERFORMANCE_MIN, PERFORMANCE_MAX);
}

/** 体力 / 心态不足时的表现扣减（确定性） */
export function calculateFormPenalty(player: PlayerState): number {
  const staminaGap = Math.max(0, 100 - player.stamina);
  const mentalGap = Math.max(0, 65 - player.mental);
  return (
    Math.floor(staminaGap / MATCH_STAMINA_PENALTY_DIV) +
    Math.floor(mentalGap / 12)
  );
}

/**
 * 确定性比赛波动：约 -6 ~ +7，略偏中性，避免长期极端连败。
 * 同输入永远相同。
 */
export function calculateMatchSwing(
  player: PlayerState,
  eventId: string,
  choiceId: string,
): number {
  const seed = `${eventId}|${choiceId}|${player.careerHistory.length}|${player.overall}|${player.stamina}|${player.nbaSeason}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unit = (hash >>> 0) % 13;
  return unit - 4;
}

export function calculateEffectiveOpponentStrength(
  player: PlayerState,
  baseOpponent: number,
  stakes: MatchStakes,
): number {
  let strength = baseOpponent;
  if (player.stage === "NBA") {
    strength += Math.floor(
      Math.max(0, player.nbaSeason) * MATCH_NBA_SEASON_OPPONENT_SCALE,
    );
  }
  if (stakes === "PLAYOFF") {
    strength += 3;
  }
  if (stakes === "FINAL") {
    strength += 5;
  }
  return clamp(Math.round(strength), 0, 99);
}

export function resolveDraftStockDelta(
  won: boolean,
  performance: number,
): number {
  if (won && performance >= 85) {
    return 8;
  }
  if (won) {
    return 5;
  }
  if (performance >= 85) {
    return 3;
  }
  return -3;
}

export function resolveFameDelta(
  won: boolean,
  performance: number,
  stakes: MatchStakes,
): number {
  if (won && stakes === "FINAL") {
    return 6;
  }
  if (won) {
    return 3;
  }
  if (performance >= 85) {
    return 1;
  }
  return 0;
}

export function resolveStaminaDelta(stakes: MatchStakes): number {
  return STAMINA_COST_BY_STAKES[stakes];
}

/**
 * 确定性比分：同样 performance / opponentStrength / won 永远相同。
 * 不模拟真实比赛，只生成合理的篮球分差。
 */
export function resolveMatchScores(
  performance: number,
  opponentStrength: number,
  won: boolean,
): { playerScore: number; opponentScore: number } {
  const margin = Math.max(
    1,
    Math.round(Math.abs(performance - opponentStrength) / 4) + 1,
  );
  const base = 78 + Math.floor((performance + opponentStrength) / 5);

  if (won) {
    const playerScore = base + Math.floor(performance / 10);
    const opponentScore = Math.max(0, playerScore - margin);
    return { playerScore, opponentScore };
  }

  const opponentScore = base + Math.floor(opponentStrength / 10);
  const playerScore = Math.max(0, opponentScore - margin);
  return { playerScore, opponentScore };
}

export function buildMatchHighlight(
  visualType: EventVisualType,
  won: boolean,
  performance: number,
): string {
  if (visualType === "SHOOT" && won) {
    return "看山在关键时刻命中投篮，帮助球队拿下比赛。";
  }
  if (visualType === "DEFENSE" && won) {
    return "看山完成关键防守，锁死了对手最后一次进攻。";
  }
  if (visualType === "DRIVE" && won) {
    return "看山强突内线得手，撕开了对手防线。";
  }
  if (visualType === "CHAMPION" && won) {
    return "看山在最高舞台举起了胜利，生涯高光就此定格。";
  }
  if (visualType === "CELEBRATE" && won) {
    return "看山与队友拥抱庆祝，这一夜将被记入历史。";
  }
  if (visualType === "SHOOT" && !won) {
    return "看山虽然命中关键投篮，但球队最终遗憾落败。";
  }
  if (visualType === "DEFENSE" && !won) {
    return "看山拼尽防守，却仍未能挡住对手的关键一击。";
  }
  if (visualType === "DRIVE" && !won) {
    return "看山突破造杀伤，但球队最终功亏一篑。";
  }
  if (performance >= 85) {
    return "看山个人表现亮眼，留下了令人印象深刻的一战。";
  }
  if (won) {
    return "看山完成了一场扎实的胜利表现。";
  }
  return "看山完成了一场令人印象深刻的比赛。";
}

export function resolveMatchTrophyId(
  event: GameEvent,
  won: boolean,
  stakes: MatchStakes,
): TrophyId | undefined {
  if (!won || stakes !== "FINAL") {
    return undefined;
  }
  if (event.stage === "CUBA") {
    return "CUBA_CHAMPION";
  }
  return undefined;
}

export function resolveMatch(
  player: PlayerState,
  event: GameEvent,
  choice: Choice,
): MatchResult {
  if (event.eventKind !== "MATCH") {
    throw new Error(
      `resolveMatch requires eventKind MATCH, got ${event.eventKind} (${event.id})`,
    );
  }
  if (!event.matchConfig) {
    throw new Error(`MATCH event missing matchConfig: ${event.id}`);
  }

  const { opponentStrength: baseOpponent, stakes } = event.matchConfig;
  const performance = calculateMatchPerformance(player, choice, stakes);
  const formPenalty = calculateFormPenalty(player);
  const swing = calculateMatchSwing(player, event.id, choice.id);
  const eliteStage =
    player.stage === "NBA" || player.stage === "NATIONAL_TEAM";
  const winMargin = eliteStage
    ? MATCH_WIN_MARGIN
    : Math.max(1, MATCH_WIN_MARGIN - 1);
  const swingScale = eliteStage ? 1 : 0.7;
  const scaledSwing = Math.round(swing * swingScale);
  const effectivePerformance = performance - formPenalty + scaledSwing;
  const effectiveOpponent = calculateEffectiveOpponentStrength(
    player,
    baseOpponent,
    stakes,
  );
  const won = effectivePerformance >= effectiveOpponent + winMargin;
  const { playerScore, opponentScore } = resolveMatchScores(
    clamp(effectivePerformance, PERFORMANCE_MIN, PERFORMANCE_MAX),
    effectiveOpponent,
    won,
  );

  return {
    eventId: event.id,
    stage: event.stage,
    won,
    playerScore,
    opponentScore,
    performance: clamp(Math.round(effectivePerformance), PERFORMANCE_MIN, PERFORMANCE_MAX),
    stakes,
    draftStockDelta: resolveDraftStockDelta(won, performance),
    fameDelta: resolveFameDelta(won, performance, stakes),
    staminaDelta: resolveStaminaDelta(stakes),
    highlight: buildMatchHighlight(event.visualType, won, performance),
    trophyId: resolveMatchTrophyId(event, won, stakes),
  };
}
