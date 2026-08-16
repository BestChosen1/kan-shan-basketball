import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AWARD_SCORE,
  calculateCareerScore,
  CAREER_SCORE_MAX,
  resolveCareerTier,
  TROPHY_SCORE,
} from "./career.ts";
import { createInitialPlayer } from "./engine.ts";
import type { Award, Contract, MatchResult, PlayerState, Trophy } from "./types.ts";

function basePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    ...createInitialPlayer(),
    overall: 50,
    fame: 0,
    wins: 0,
    trophies: [],
    awards: [],
    contracts: [],
    matchHistory: [],
    careerHistory: [],
    ...overrides,
  };
}

function trophy(id: Trophy["id"]): Trophy {
  return { id, name: id, stage: "CUBA", eventId: "e" };
}

function award(id: Award["id"]): Award {
  return { id, name: id, stage: "NBA", eventId: "e" };
}

function ntMatch(): MatchResult {
  return {
    eventId: "nt-asia",
    stage: "NATIONAL_TEAM",
    won: true,
    playerScore: 90,
    opponentScore: 80,
    performance: 80,
    stakes: "FINAL",
    draftStockDelta: 5,
    fameDelta: 6,
    staminaDelta: -8,
    highlight: "h",
  };
}

function contract(league: "CBA" | "NBA"): Contract {
  return {
    id: `${league}-x-1`,
    league,
    teamName: "t",
    years: 2,
    annualSalary: 100,
    signingBonus: 10,
    signedAtEventId: "e",
  };
}

describe("calculateCareerScore", () => {
  it("scores low without trophies", () => {
    const score = calculateCareerScore(basePlayer({ overall: 50, fame: 0 }));
    // ability 100 + 0 + 0
    assert.equal(score, 100);
  });

  it("increases score with CUBA trophy", () => {
    const without = calculateCareerScore(basePlayer());
    const withTrophy = calculateCareerScore(
      basePlayer({ trophies: [trophy("CUBA_CHAMPION")] }),
    );
    assert.equal(withTrophy - without, TROPHY_SCORE.CUBA_CHAMPION);
  });

  it("increases score with NBA trophy", () => {
    const without = calculateCareerScore(basePlayer());
    const withTrophy = calculateCareerScore(
      basePlayer({ trophies: [trophy("NBA_CHAMPION")] }),
    );
    assert.equal(withTrophy - without, TROPHY_SCORE.NBA_CHAMPION);
  });

  it("increases score with awards", () => {
    const without = calculateCareerScore(basePlayer());
    const withAward = calculateCareerScore(
      basePlayer({ awards: [award("MVP_LIKE")] }),
    );
    assert.equal(withAward - without, AWARD_SCORE.MVP_LIKE);
  });

  it("increases score with fame", () => {
    const without = calculateCareerScore(basePlayer({ fame: 0 }));
    const withFame = calculateCareerScore(basePlayer({ fame: 40 }));
    assert.equal(withFame - without, 60);
  });

  it("caps win contribution at 60", () => {
    const twenty = calculateCareerScore(basePlayer({ wins: 20 }));
    const thirty = calculateCareerScore(basePlayer({ wins: 30 }));
    assert.equal(twenty, thirty);
    assert.equal(twenty - calculateCareerScore(basePlayer({ wins: 0 })), 60);
  });

  it("adds national team bonus", () => {
    const without = calculateCareerScore(basePlayer());
    const withNt = calculateCareerScore(
      basePlayer({ matchHistory: [ntMatch()] }),
    );
    assert.equal(withNt - without, 20);
  });

  it("adds career achievement bonuses", () => {
    const without = calculateCareerScore(basePlayer());
    const withContracts = calculateCareerScore(
      basePlayer({
        contracts: [contract("CBA"), contract("NBA")],
      }),
    );
    assert.equal(withContracts - without, 30);

    const withJourney = calculateCareerScore(
      basePlayer({
        careerHistory: [
          {
            eventId: "a",
            stage: "CUBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
          {
            eventId: "b",
            stage: "CBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
          {
            eventId: "c",
            stage: "NBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
        ],
      }),
    );
    assert.equal(withJourney - without, 30);
  });

  it("clamps score to 0-1000", () => {
    const stacked = calculateCareerScore(
      basePlayer({
        overall: 99,
        fame: 100,
        wins: 99,
        trophies: [
          trophy("CUBA_CHAMPION"),
          trophy("CBA_CHAMPION"),
          trophy("NBA_CHAMPION"),
          trophy("ASIA_GOLD"),
          trophy("WORLD_MEDAL"),
        ],
        awards: [
          award("FMVP"),
          award("MVP_LIKE"),
          award("DPOY_LIKE"),
          award("ALL_STAR_LIKE"),
        ],
        contracts: [contract("CBA"), contract("NBA")],
        matchHistory: [ntMatch()],
        careerHistory: [
          {
            eventId: "a",
            stage: "CUBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
          {
            eventId: "b",
            stage: "CBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
          {
            eventId: "c",
            stage: "NBA",
            eventTitle: "t",
            choiceId: "c",
            choiceText: "x",
            timestamp: 1,
          },
        ],
      }),
    );
    assert.ok(stacked <= CAREER_SCORE_MAX);
    assert.equal(stacked, CAREER_SCORE_MAX);
  });
});

describe("resolveCareerTier", () => {
  it("maps score boundaries to tiers", () => {
    assert.equal(resolveCareerTier(850), "LEGEND");
    assert.equal(resolveCareerTier(849), "SUPERSTAR");
    assert.equal(resolveCareerTier(700), "SUPERSTAR");
    assert.equal(resolveCareerTier(699), "STAR");
    assert.equal(resolveCareerTier(550), "STAR");
    assert.equal(resolveCareerTier(549), "STARTER");
    assert.equal(resolveCareerTier(400), "STARTER");
    assert.equal(resolveCareerTier(399), "ROLE_PLAYER");
    assert.equal(resolveCareerTier(250), "ROLE_PLAYER");
    assert.equal(resolveCareerTier(249), "JOURNEYMAN");
    assert.equal(resolveCareerTier(0), "JOURNEYMAN");
  });
});
