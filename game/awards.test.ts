import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAwards } from "./awards.ts";
import { createInitialPlayer } from "./engine.ts";
import type {
  Choice,
  GameEvent,
  MatchResult,
  PlayerState,
  Trophy,
} from "./types.ts";

function makeChoice(): Choice {
  return { id: "c", text: "t", effects: {} };
}

function makeEvent(overrides: Partial<GameEvent>): GameEvent {
  return {
    id: "test-match",
    stage: "CUBA",
    title: "测试",
    description: "d",
    kanShanDialogue: "k",
    visualType: "SHOOT",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 40, stakes: "FINAL" },
    choices: [makeChoice(), makeChoice(), makeChoice()],
    ...overrides,
  };
}

function makeMatch(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    eventId: "test-match",
    stage: "CUBA",
    won: true,
    playerScore: 100,
    opponentScore: 90,
    performance: 90,
    stakes: "FINAL",
    draftStockDelta: 5,
    fameDelta: 6,
    staminaDelta: -8,
    highlight: "h",
    ...overrides,
  };
}

function strongPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    ...createInitialPlayer(),
    overall: 88,
    defense: 90,
    fame: 50,
    ...overrides,
  };
}

describe("resolveAwards", () => {
  it("grants CUBA_CHAMPION on CUBA final win", () => {
    const result = resolveAwards(
      strongPlayer(),
      makeEvent({ id: "cuba-finals", stage: "CUBA" }),
      makeMatch({ stage: "CUBA", performance: 80 }),
    );
    assert.equal(result.trophies[0]?.id, "CUBA_CHAMPION");
    assert.equal(result.fameDelta, 5);
  });

  it("grants CBA_CHAMPION on CBA final win", () => {
    const result = resolveAwards(
      strongPlayer(),
      makeEvent({ id: "cba-final", stage: "CBA" }),
      makeMatch({ stage: "CBA", eventId: "cba-final", performance: 80 }),
    );
    assert.equal(result.trophies[0]?.id, "CBA_CHAMPION");
    assert.equal(result.fameDelta, 8);
  });

  it("grants NBA_CHAMPION on NBA final win", () => {
    const result = resolveAwards(
      strongPlayer(),
      makeEvent({ id: "nba-final", stage: "NBA" }),
      makeMatch({ stage: "NBA", eventId: "nba-final", performance: 80 }),
    );
    assert.equal(result.trophies[0]?.id, "NBA_CHAMPION");
    assert.equal(result.fameDelta, 12);
  });

  it("grants ASIA_GOLD on Asia win", () => {
    const result = resolveAwards(
      strongPlayer({ defense: 70 }),
      makeEvent({
        id: "nt-asia",
        stage: "NATIONAL_TEAM",
        visualType: "DEFENSE",
      }),
      makeMatch({
        stage: "NATIONAL_TEAM",
        eventId: "nt-asia",
        performance: 80,
        stakes: "FINAL",
      }),
    );
    assert.equal(result.trophies[0]?.id, "ASIA_GOLD");
    assert.equal(result.fameDelta, 6);
  });

  it("grants WORLD_MEDAL on world final win", () => {
    const result = resolveAwards(
      strongPlayer({ defense: 70 }),
      makeEvent({
        id: "nt-world-final",
        stage: "NATIONAL_TEAM",
        visualType: "CHAMPION",
      }),
      makeMatch({
        stage: "NATIONAL_TEAM",
        eventId: "nt-world-final",
        performance: 80,
        stakes: "FINAL",
      }),
    );
    assert.equal(result.trophies[0]?.id, "WORLD_MEDAL");
    assert.equal(result.fameDelta, 10);
  });

  it("grants FMVP when final win performance >= 85", () => {
    const result = resolveAwards(
      strongPlayer({ defense: 70 }),
      makeEvent({ stage: "CUBA" }),
      makeMatch({ performance: 85 }),
    );
    assert.ok(result.awards.some((award) => award.id === "FMVP"));
    assert.ok(result.fameDelta >= 5 + 5); // trophy + FMVP
  });

  it("grants MVP_LIKE when performance >= 92", () => {
    const result = resolveAwards(
      strongPlayer({ defense: 70 }),
      makeEvent({ stage: "CUBA" }),
      makeMatch({ performance: 92 }),
    );
    assert.ok(result.awards.some((award) => award.id === "FMVP"));
    assert.ok(result.awards.some((award) => award.id === "MVP_LIKE"));
  });

  it("grants DPOY_LIKE for elite defense showcase", () => {
    const result = resolveAwards(
      strongPlayer({ defense: 85 }),
      makeEvent({
        id: "nt-asia",
        stage: "NATIONAL_TEAM",
        visualType: "DEFENSE",
      }),
      makeMatch({
        stage: "NATIONAL_TEAM",
        eventId: "nt-asia",
        won: false,
        performance: 85,
        stakes: "REGULAR",
      }),
    );
    assert.ok(result.awards.some((award) => award.id === "DPOY_LIKE"));
    assert.equal(result.trophies.length, 0);
  });

  it("grants ALL_STAR_LIKE for NBA regular high performance", () => {
    const result = resolveAwards(
      strongPlayer({ overall: 82, defense: 70 }),
      makeEvent({
        id: "nba-regular-season",
        stage: "NBA",
        visualType: "SHOOT",
        matchConfig: { opponentStrength: 68, stakes: "REGULAR" },
      }),
      makeMatch({
        stage: "NBA",
        eventId: "nba-regular-season",
        won: true,
        performance: 85,
        stakes: "REGULAR",
      }),
    );
    assert.ok(result.awards.some((award) => award.id === "ALL_STAR_LIKE"));
  });

  it("prevents duplicate trophies", () => {
    const existing: Trophy = {
      id: "CUBA_CHAMPION",
      name: "CUBA 总冠军",
      stage: "CUBA",
      eventId: "old",
    };
    const result = resolveAwards(
      strongPlayer({ trophies: [existing], defense: 70 }),
      makeEvent({ id: "cuba-finals", stage: "CUBA" }),
      makeMatch({ performance: 80 }),
    );
    assert.equal(result.trophies.length, 0);
  });

  it("prevents duplicate awards", () => {
    const player = strongPlayer({
      defense: 70,
      awards: [
        {
          id: "FMVP",
          name: "总决赛 MVP",
          stage: "CUBA",
          eventId: "old",
        },
      ],
    });
    const result = resolveAwards(
      player,
      makeEvent({ stage: "CUBA" }),
      makeMatch({ performance: 95 }),
    );
    assert.ok(!result.awards.some((award) => award.id === "FMVP"));
    assert.ok(result.awards.some((award) => award.id === "MVP_LIKE"));
  });

  it("returns fameDelta that clamps when applied to near-max fame", () => {
    const player = strongPlayer({ fame: 98, defense: 70 });
    const result = resolveAwards(
      player,
      makeEvent({ stage: "NBA", id: "nba-final" }),
      makeMatch({ stage: "NBA", eventId: "nba-final", performance: 95 }),
    );
    // NBA trophy 12 + FMVP 5 + MVP 8 = 25; engine clamps to 100
    const nextFame = Math.min(100, player.fame + result.fameDelta);
    assert.equal(nextFame, 100);
    assert.ok(result.fameDelta > 0);
  });
});
