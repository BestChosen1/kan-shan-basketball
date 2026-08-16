import type {
  AwardId,
  CareerTier,
  PlayerState,
  TrophyId,
} from "./types.ts";

/** 奖杯权重：仅用于生涯评分，不写入 Trophy */
export const TROPHY_SCORE: Record<TrophyId, number> = {
  CUBA_CHAMPION: 60,
  CBA_CHAMPION: 100,
  NBA_CHAMPION: 180,
  ASIA_GOLD: 80,
  WORLD_MEDAL: 120,
};

/** 奖项权重：仅用于生涯评分，不写入 Award */
export const AWARD_SCORE: Record<AwardId, number> = {
  FMVP: 80,
  MVP_LIKE: 100,
  DPOY_LIKE: 60,
  ALL_STAR_LIKE: 50,
};

export const CAREER_SCORE_MIN = 0;
export const CAREER_SCORE_MAX = 1000;

export const CAREER_TIER_THRESHOLDS = {
  LEGEND: 850,
  SUPERSTAR: 700,
  STAR: 550,
  STARTER: 400,
  ROLE_PLAYER: 250,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveCareerTier(score: number): CareerTier {
  if (score >= CAREER_TIER_THRESHOLDS.LEGEND) {
    return "LEGEND";
  }
  if (score >= CAREER_TIER_THRESHOLDS.SUPERSTAR) {
    return "SUPERSTAR";
  }
  if (score >= CAREER_TIER_THRESHOLDS.STAR) {
    return "STAR";
  }
  if (score >= CAREER_TIER_THRESHOLDS.STARTER) {
    return "STARTER";
  }
  if (score >= CAREER_TIER_THRESHOLDS.ROLE_PLAYER) {
    return "ROLE_PLAYER";
  }
  return "JOURNEYMAN";
}

function hasNationalTeamMatch(player: PlayerState): boolean {
  return player.matchHistory.some((match) => match.stage === "NATIONAL_TEAM");
}

function hasCbaAndNbaContracts(player: PlayerState): boolean {
  const leagues = new Set(player.contracts.map((contract) => contract.league));
  return leagues.has("CBA") && leagues.has("NBA");
}

function hasCubaCbaNbaJourney(player: PlayerState): boolean {
  const stages = new Set(player.careerHistory.map((entry) => entry.stage));
  return stages.has("CUBA") && stages.has("CBA") && stages.has("NBA");
}

export function calculateCareerScore(player: PlayerState): number {
  const abilityScore = player.overall * 2;
  const matchScore = Math.min(player.wins * 3, 60);
  const fameScore = player.fame * 1.5;

  const trophyScore = player.trophies.reduce(
    (sum, trophy) => sum + TROPHY_SCORE[trophy.id],
    0,
  );
  const awardScore = player.awards.reduce(
    (sum, award) => sum + AWARD_SCORE[award.id],
    0,
  );

  const nationalTeamBonus = hasNationalTeamMatch(player) ? 20 : 0;

  let careerAchievementBonus = 0;
  if (hasCbaAndNbaContracts(player)) {
    careerAchievementBonus += 30;
  }
  if (hasCubaCbaNbaJourney(player)) {
    careerAchievementBonus += 30;
  }

  const raw =
    abilityScore +
    matchScore +
    fameScore +
    trophyScore +
    awardScore +
    nationalTeamBonus +
    careerAchievementBonus;

  return clamp(Math.round(raw), CAREER_SCORE_MIN, CAREER_SCORE_MAX);
}
