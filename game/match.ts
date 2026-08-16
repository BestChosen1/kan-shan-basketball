import {
  INTENT_BONUS,
  MATCH_PERFORMANCE_WEIGHTS,
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

  const { opponentStrength, stakes } = event.matchConfig;
  const performance = calculateMatchPerformance(player, choice, stakes);
  const won = performance >= opponentStrength;
  const { playerScore, opponentScore } = resolveMatchScores(
    performance,
    opponentStrength,
    won,
  );

  return {
    eventId: event.id,
    stage: event.stage,
    won,
    playerScore,
    opponentScore,
    performance,
    stakes,
    draftStockDelta: resolveDraftStockDelta(won, performance),
    fameDelta: resolveFameDelta(won, performance, stakes),
    staminaDelta: resolveStaminaDelta(stakes),
    highlight: buildMatchHighlight(event.visualType, won, performance),
    trophyId: resolveMatchTrophyId(event, won, stakes),
  };
}
