import {
  CBA_DRAFT_TEAMS,
  CBA_DRAFT_WEIGHTS,
  DRAFT_INTENT_BONUS,
  DRAFT_PICK_RANGES,
  DRAFT_ROLE_BY_TIER,
  DRAFT_TIER_THRESHOLDS,
  DRAFT_VALUE_MAX,
  DRAFT_VALUE_MIN,
  NBA_DRAFT_TEAMS,
  NBA_DRAFT_WEIGHTS,
  UNDRAFTED_TEAM_NAME,
} from "./constants.ts";
import type {
  Choice,
  DraftResult,
  DraftTier,
  GameEvent,
  LeagueId,
  PlayerRole,
  PlayerState,
} from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getDraftIntentBonus(choice: Choice): number {
  if (!choice.intent) {
    return 0;
  }
  return DRAFT_INTENT_BONUS[choice.intent] ?? 0;
}

export function calculateDraftValue(
  player: PlayerState,
  league: LeagueId,
  choice: Choice,
): number {
  const weights = league === "CBA" ? CBA_DRAFT_WEIGHTS : NBA_DRAFT_WEIGHTS;
  const raw =
    player.overall * weights.overall +
    player.potential * weights.potential +
    player.draftStock * weights.draftStock +
    player.basketballIQ * weights.basketballIQ +
    player.mental * weights.mental +
    player.fame * weights.fame +
    getDraftIntentBonus(choice);

  return clamp(Math.round(raw), DRAFT_VALUE_MIN, DRAFT_VALUE_MAX);
}

export function resolveDraftTier(draftValue: number): DraftTier {
  if (draftValue >= DRAFT_TIER_THRESHOLDS.LOTTERY_MIN) {
    return "LOTTERY";
  }
  if (draftValue >= DRAFT_TIER_THRESHOLDS.FIRST_ROUND_MIN) {
    return "FIRST_ROUND";
  }
  if (draftValue >= DRAFT_TIER_THRESHOLDS.SECOND_ROUND_MIN) {
    return "SECOND_ROUND";
  }
  return "UNDRAFTED";
}

/**
 * 在 [valueMin, valueMax] 内线性映射到 [best, worst] 顺位。
 * 更高 draftValue → 更靠前（更小）的 pick。
 */
export function mapPickInRange(
  draftValue: number,
  valueMin: number,
  valueMax: number,
  bestPick: number,
  worstPick: number,
): number {
  const span = Math.max(1, valueMax - valueMin);
  const t = clamp((draftValue - valueMin) / span, 0, 1);
  const raw = worstPick - t * (worstPick - bestPick);
  return Math.round(clamp(raw, bestPick, worstPick));
}

export function resolveDraftPick(
  draftValue: number,
  tier: DraftTier,
): number {
  if (tier === "UNDRAFTED") {
    return 0;
  }
  const range = DRAFT_PICK_RANGES[tier];
  return mapPickInRange(
    draftValue,
    range.valueMin,
    range.valueMax,
    range.best,
    range.worst,
  );
}

export function resolveDraftTeamName(
  league: LeagueId,
  pick: number,
  tier: DraftTier,
): string {
  if (tier === "UNDRAFTED" || pick <= 0) {
    return UNDRAFTED_TEAM_NAME;
  }

  const table = league === "CBA" ? CBA_DRAFT_TEAMS : NBA_DRAFT_TEAMS;
  for (const entry of table) {
    if (pick <= entry.maxPick) {
      return entry.name;
    }
  }
  return UNDRAFTED_TEAM_NAME;
}

export function resolveDraftRole(tier: DraftTier): PlayerRole {
  return DRAFT_ROLE_BY_TIER[tier];
}

export function buildDraftMessage(
  league: LeagueId,
  tier: DraftTier,
  pick: number,
  teamName: string,
): string {
  if (tier === "UNDRAFTED") {
    return `${league} 选秀夜，看山最终未能被选中。`;
  }
  if (tier === "LOTTERY") {
    return `${league} 乐透区第 ${pick} 顺位，${teamName} 选中了看山。`;
  }
  if (tier === "FIRST_ROUND") {
    return `${league} 首轮第 ${pick} 顺位，${teamName} 选中了看山。`;
  }
  return `${league} 次轮第 ${pick} 顺位，${teamName} 选中了看山。`;
}

export function resolveDraft(
  player: PlayerState,
  event: GameEvent,
  choice: Choice,
): DraftResult {
  if (event.eventKind !== "DRAFT") {
    throw new Error(
      `resolveDraft requires eventKind DRAFT, got ${event.eventKind} (${event.id})`,
    );
  }
  if (!event.draftConfig) {
    throw new Error(`DRAFT event missing draftConfig: ${event.id}`);
  }

  const { league } = event.draftConfig;
  const draftValue = calculateDraftValue(player, league, choice);
  const tier = resolveDraftTier(draftValue);
  const pick = resolveDraftPick(draftValue, tier);
  const teamName = resolveDraftTeamName(league, pick, tier);

  return {
    eventId: event.id,
    league,
    pick,
    tier,
    teamName,
    draftValue,
    message: buildDraftMessage(league, tier, pick, teamName),
  };
}
