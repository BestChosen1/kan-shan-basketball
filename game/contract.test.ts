import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CBA_CONTRACT_BY_TIER,
  NBA_CONTRACT_BY_TIER,
} from "./constants.ts";
import {
  buildContractId,
  resolveAnnualSalary,
  resolveContract,
  resolveFameSigningBonus,
  resolveOverallSalaryBonusPercent,
  resolvePickSalaryBonusPercent,
} from "./contract.ts";
import { createInitialPlayer } from "./engine.ts";
import type { DraftResult, DraftTier, PlayerState } from "./types.ts";

function makeDraft(
  overrides: Partial<DraftResult> &
    Pick<DraftResult, "league" | "tier" | "pick" | "teamName">,
): DraftResult {
  return {
    eventId: "test-draft",
    draftValue: 80,
    message: "draft message",
    ...overrides,
  };
}

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    ...createInitialPlayer(),
    overall: 70,
    fame: 40,
    ...overrides,
  };
}

function assertBasePackage(
  league: "CBA" | "NBA",
  tier: DraftTier,
  years: number,
  baseSalary: number,
  baseBonus: number,
) {
  const table = league === "CBA" ? CBA_CONTRACT_BY_TIER : NBA_CONTRACT_BY_TIER;
  assert.deepEqual(table[tier], {
    years,
    annualSalary: baseSalary,
    signingBonus: baseBonus,
  });

  const player = makePlayer({ overall: 70, fame: 40 });
  const draft = makeDraft({
    league,
    tier,
    pick: tier === "UNDRAFTED" ? 0 : tier === "LOTTERY" ? 10 : tier === "FIRST_ROUND" ? 20 : 40,
    teamName: league === "CBA" ? "极光篮球队" : "Northern Lights",
  });
  const { contract } = resolveContract(player, draft);
  assert.equal(contract.years, years);
  assert.equal(contract.league, league);
  assert.equal(contract.teamName, draft.teamName);
  assert.equal(contract.signedAtEventId, draft.eventId);
}

describe("resolveContract", () => {
  it("builds CBA lottery package", () => {
    assertBasePackage("CBA", "LOTTERY", 3, 800, 30);
  });

  it("builds CBA first round package", () => {
    assertBasePackage("CBA", "FIRST_ROUND", 3, 600, 20);
  });

  it("builds CBA second round package", () => {
    assertBasePackage("CBA", "SECOND_ROUND", 2, 350, 10);
  });

  it("builds CBA undrafted package", () => {
    assertBasePackage("CBA", "UNDRAFTED", 1, 100, 3);
  });

  it("builds NBA lottery package", () => {
    assertBasePackage("NBA", "LOTTERY", 4, 2400, 100);
  });

  it("builds NBA first round package", () => {
    assertBasePackage("NBA", "FIRST_ROUND", 3, 1600, 70);
  });

  it("builds NBA second round package", () => {
    assertBasePackage("NBA", "SECOND_ROUND", 2, 800, 30);
  });

  it("builds NBA undrafted package", () => {
    assertBasePackage("NBA", "UNDRAFTED", 1, 300, 10);
  });

  it("applies pick salary bonus", () => {
    assert.equal(resolvePickSalaryBonusPercent(3, "LOTTERY"), 0.1);
    assert.equal(resolvePickSalaryBonusPercent(10, "LOTTERY"), 0.05);
    assert.equal(resolvePickSalaryBonusPercent(20, "FIRST_ROUND"), 0);
    assert.equal(resolvePickSalaryBonusPercent(0, "UNDRAFTED"), 0);

    const player = makePlayer({ overall: 70 });
    const top = resolveContract(
      player,
      makeDraft({
        league: "CBA",
        tier: "LOTTERY",
        pick: 3,
        teamName: "北极星俱乐部",
      }),
    );
    // 800 * 1.10 = 880 (overall < 75)
    assert.equal(top.contract.annualSalary, 880);
  });

  it("applies overall salary bonus once at highest tier", () => {
    assert.equal(resolveOverallSalaryBonusPercent(90), 0.1);
    assert.equal(resolveOverallSalaryBonusPercent(80), 0.05);
    assert.equal(resolveOverallSalaryBonusPercent(70), 0);

    const high = resolveAnnualSalary(800, 20, "FIRST_ROUND", 90);
    // pick 20 -> 0%, overall -> 10% => 880
    assert.equal(high, 880);

    const mid = resolveAnnualSalary(800, 20, "FIRST_ROUND", 80);
    assert.equal(mid, 840);
  });

  it("applies fame signing bonus", () => {
    assert.equal(resolveFameSigningBonus(70), 5);
    assert.equal(resolveFameSigningBonus(69), 0);

    const result = resolveContract(
      makePlayer({ fame: 70, overall: 70 }),
      makeDraft({
        league: "CBA",
        tier: "FIRST_ROUND",
        pick: 20,
        teamName: "长城篮球队",
      }),
    );
    assert.equal(result.contract.signingBonus, 20 + 5);
  });

  it("is fully deterministic", () => {
    const player = makePlayer({ overall: 86, fame: 72 });
    const draft = makeDraft({
      league: "NBA",
      tier: "LOTTERY",
      pick: 4,
      teamName: "North Star",
      eventId: "nba-draft",
    });
    assert.deepEqual(
      resolveContract(player, draft),
      resolveContract(player, draft),
    );
  });

  it("does not mutate the player object", () => {
    const player = makePlayer({ overall: 88, fame: 80, money: 1000 });
    const snapshot = structuredClone(player);
    resolveContract(
      player,
      makeDraft({
        league: "NBA",
        tier: "LOTTERY",
        pick: 2,
        teamName: "North Star",
      }),
    );
    assert.deepEqual(player, snapshot);
  });

  it("builds deterministic contract ids", () => {
    assert.equal(
      buildContractId("CBA", "cba-draft", 7),
      "CBA-cba-draft-7",
    );
    assert.equal(
      buildContractId("NBA", "nba-draft", 0),
      "NBA-nba-draft-0",
    );
    const result = resolveContract(
      makePlayer(),
      makeDraft({
        league: "CBA",
        tier: "LOTTERY",
        pick: 7,
        teamName: "极光篮球队",
        eventId: "cba-draft",
      }),
    );
    assert.equal(result.contract.id, "CBA-cba-draft-7");
  });
});
