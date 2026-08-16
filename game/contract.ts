import {
  CBA_CONTRACT_BY_TIER,
  CONTRACT_FAME_BY_TIER,
  NBA_CONTRACT_BY_TIER,
} from "./constants.ts";
import type {
  Contract,
  ContractResult,
  DraftResult,
  DraftTier,
  LeagueId,
  PlayerState,
} from "./types.ts";

function clampPercent(value: number): number {
  return Math.max(0, value);
}

export function resolvePickSalaryBonusPercent(
  pick: number,
  tier: DraftTier,
): number {
  if (tier === "UNDRAFTED" || pick <= 0) {
    return 0;
  }
  if (pick <= 5) {
    return 0.1;
  }
  if (pick <= 14) {
    return 0.05;
  }
  return 0;
}

/** overall 加成只取最高档一次 */
export function resolveOverallSalaryBonusPercent(overall: number): number {
  if (overall >= 85) {
    return 0.1;
  }
  if (overall >= 75) {
    return 0.05;
  }
  return 0;
}

export function resolveFameSigningBonus(fame: number): number {
  return fame >= 70 ? 5 : 0;
}

export function buildContractId(
  league: LeagueId,
  signedAtEventId: string,
  pick: number,
): string {
  return `${league}-${signedAtEventId}-${pick}`;
}

export function resolveAnnualSalary(
  baseSalary: number,
  pick: number,
  tier: DraftTier,
  overall: number,
): number {
  const pickBonus = resolvePickSalaryBonusPercent(pick, tier);
  const overallBonus = resolveOverallSalaryBonusPercent(overall);
  const multiplier = 1 + pickBonus + overallBonus;
  return Math.round(baseSalary * clampPercent(multiplier));
}

export function buildContractSummary(
  draft: DraftResult,
  contract: Contract,
): string {
  if (draft.tier === "UNDRAFTED") {
    return `看山遗憾落选，但仍签下${contract.years}年职业合同。`;
  }
  return `看山以 ${draft.league} 第${draft.pick}顺位加入${contract.teamName}，并签下${contract.years}年新秀合同。`;
}

export function resolveContract(
  player: PlayerState,
  draftResult: DraftResult,
): ContractResult {
  const baseTable =
    draftResult.league === "CBA" ? CBA_CONTRACT_BY_TIER : NBA_CONTRACT_BY_TIER;
  const base = baseTable[draftResult.tier];

  const annualSalary = resolveAnnualSalary(
    base.annualSalary,
    draftResult.pick,
    draftResult.tier,
    player.overall,
  );
  const signingBonus =
    base.signingBonus + resolveFameSigningBonus(player.fame);

  const contract: Contract = {
    id: buildContractId(
      draftResult.league,
      draftResult.eventId,
      draftResult.pick,
    ),
    league: draftResult.league,
    teamName: draftResult.teamName,
    years: base.years,
    annualSalary,
    signingBonus,
    signedAtEventId: draftResult.eventId,
  };

  return {
    contract,
    summary: buildContractSummary(draftResult, contract),
    fameDelta: CONTRACT_FAME_BY_TIER[draftResult.tier],
  };
}
