import { AWARD_NAMES, TROPHY_NAMES } from "./constants.ts";
import type {
  Award,
  AwardId,
  AwardResult,
  GameEvent,
  MatchResult,
  PlayerState,
  Trophy,
  TrophyId,
} from "./types.ts";

const TROPHY_FAME: Record<TrophyId, number> = {
  CUBA_CHAMPION: 5,
  CBA_CHAMPION: 8,
  NBA_CHAMPION: 12,
  ASIA_GOLD: 6,
  WORLD_MEDAL: 10,
};

const AWARD_FAME: Record<AwardId, number> = {
  FMVP: 5,
  MVP_LIKE: 8,
  DPOY_LIKE: 4,
  ALL_STAR_LIKE: 4,
};

function hasTrophy(player: PlayerState, id: TrophyId): boolean {
  return player.trophies.some((trophy) => trophy.id === id);
}

function hasAward(player: PlayerState, id: AwardId): boolean {
  return player.awards.some((award) => award.id === id);
}

function makeTrophy(
  id: TrophyId,
  event: GameEvent,
): Trophy {
  return {
    id,
    name: TROPHY_NAMES[id],
    stage: event.stage,
    eventId: event.id,
  };
}

function makeAward(id: AwardId, event: GameEvent): Award {
  return {
    id,
    name: AWARD_NAMES[id],
    stage: event.stage,
    eventId: event.id,
  };
}

export function resolveTrophyCandidate(
  event: GameEvent,
  matchResult: MatchResult,
): TrophyId | undefined {
  if (!matchResult.won) {
    return undefined;
  }

  if (event.stage === "NATIONAL_TEAM") {
    if (event.id === "nt-asia") {
      return "ASIA_GOLD";
    }
    if (event.id === "nt-world-final") {
      return "WORLD_MEDAL";
    }
    return undefined;
  }

  if (matchResult.stakes !== "FINAL") {
    return undefined;
  }

  if (event.stage === "CUBA") {
    return "CUBA_CHAMPION";
  }
  if (event.stage === "CBA") {
    return "CBA_CHAMPION";
  }
  if (event.stage === "NBA") {
    return "NBA_CHAMPION";
  }
  return undefined;
}

export function resolveAwardCandidates(
  player: PlayerState,
  event: GameEvent,
  matchResult: MatchResult,
): AwardId[] {
  const ids: AwardId[] = [];

  if (
    matchResult.stakes === "FINAL" &&
    matchResult.won &&
    matchResult.performance >= 85
  ) {
    ids.push("FMVP");
  }

  if (
    matchResult.stakes === "FINAL" &&
    matchResult.won &&
    matchResult.performance >= 92
  ) {
    ids.push("MVP_LIKE");
  }

  if (
    player.defense >= 85 &&
    matchResult.performance >= 85 &&
    event.visualType === "DEFENSE"
  ) {
    ids.push("DPOY_LIKE");
  }

  if (
    event.id === "nba-regular-season" &&
    player.overall >= 82 &&
    matchResult.performance >= 85
  ) {
    ids.push("ALL_STAR_LIKE");
  }

  return ids;
}

/**
 * 根据本场比赛结果结算奖杯与个人荣誉。
 * 不修改 player；不重复发放已有 Trophy / Award。
 */
export function resolveAwards(
  player: PlayerState,
  event: GameEvent,
  matchResult?: MatchResult,
): AwardResult {
  const trophies: Trophy[] = [];
  const awards: Award[] = [];
  let fameDelta = 0;

  if (!matchResult || event.eventKind !== "MATCH") {
    return { trophies, awards, fameDelta };
  }

  const trophyId = resolveTrophyCandidate(event, matchResult);
  if (trophyId && !hasTrophy(player, trophyId)) {
    trophies.push(makeTrophy(trophyId, event));
    fameDelta += TROPHY_FAME[trophyId];
  }

  const awardIds = resolveAwardCandidates(player, event, matchResult);
  const granted = new Set<AwardId>();
  for (const awardId of awardIds) {
    if (hasAward(player, awardId) || granted.has(awardId)) {
      continue;
    }
    awards.push(makeAward(awardId, event));
    granted.add(awardId);
    fameDelta += AWARD_FAME[awardId];
  }

  return { trophies, awards, fameDelta };
}
