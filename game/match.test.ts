import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialPlayer } from "./engine.ts";
import {
  calculateMatchPerformance,
  resolveDraftStockDelta,
  resolveFameDelta,
  resolveMatch,
  resolveMatchScores,
  resolveStaminaDelta,
} from "./match.ts";
import type {
  Choice,
  GameEvent,
  MatchConfig,
  PlayerState,
} from "./types.ts";

function makeChoice(overrides: Partial<Choice> = {}): Choice {
  return {
    id: "test-choice",
    text: "测试选择",
    effects: {},
    ...overrides,
  };
}

function makeMatchEvent(
  matchConfig: MatchConfig,
  overrides: Partial<GameEvent> = {},
): GameEvent {
  const choice = makeChoice();
  return {
    id: "test-match",
    stage: "CUBA",
    title: "测试比赛",
    description: "desc",
    kanShanDialogue: "dialogue",
    visualType: "SHOOT",
    eventKind: "MATCH",
    matchConfig,
    choices: [choice, makeChoice({ id: "b" }), makeChoice({ id: "c" })],
    ...overrides,
  };
}

function strongPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  const base = createInitialPlayer();
  return {
    ...base,
    shooting: 90,
    finishing: 88,
    passing: 85,
    defense: 90,
    physical: 88,
    basketballIQ: 92,
    mental: 90,
    stamina: 90,
    overall: 90,
    role: "STAR",
    ...overrides,
  };
}

function weakPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  const base = createInitialPlayer();
  return {
    ...base,
    shooting: 20,
    finishing: 18,
    passing: 15,
    defense: 20,
    physical: 18,
    basketballIQ: 15,
    mental: 20,
    stamina: 20,
    overall: 18,
    role: "BENCH",
    ...overrides,
  };
}

describe("resolveMatch", () => {
  it("wins when high ability faces a weak opponent", () => {
    const player = strongPlayer();
    const event = makeMatchEvent({ opponentStrength: 40, stakes: "REGULAR" });
    const result = resolveMatch(player, event, makeChoice({ intent: "SCORE" }));

    assert.equal(result.won, true);
    assert.ok(result.performance >= 40);
    assert.ok(result.playerScore > result.opponentScore);
  });

  it("loses when low ability faces a strong opponent", () => {
    const player = weakPlayer();
    const event = makeMatchEvent({ opponentStrength: 90, stakes: "REGULAR" });
    const result = resolveMatch(player, event, makeChoice());

    assert.equal(result.won, false);
    assert.ok(result.performance < 90);
    assert.ok(result.playerScore < result.opponentScore);
  });

  it("is fully deterministic for the same inputs", () => {
    const player = strongPlayer({ role: "STARTER" });
    const event = makeMatchEvent({ opponentStrength: 55, stakes: "PLAYOFF" });
    const choice = makeChoice({ intent: "DEFEND" });

    const a = resolveMatch(player, event, choice);
    const b = resolveMatch(player, event, choice);
    assert.deepEqual(a, b);
  });

  it("applies SCORE intent bonus", () => {
    const player = strongPlayer({ role: "ROTATION" });
    const without = calculateMatchPerformance(player, makeChoice(), "REGULAR");
    const withScore = calculateMatchPerformance(
      player,
      makeChoice({ intent: "SCORE" }),
      "REGULAR",
    );
    assert.equal(withScore - without, 8);
  });

  it("applies DEFEND intent bonus", () => {
    const player = strongPlayer({ role: "ROTATION" });
    const without = calculateMatchPerformance(player, makeChoice(), "REGULAR");
    const withDefend = calculateMatchPerformance(
      player,
      makeChoice({ intent: "DEFEND" }),
      "REGULAR",
    );
    assert.equal(withDefend - without, 8);
  });

  it("gives STAR a higher performance than BENCH", () => {
    const bench = calculateMatchPerformance(
      strongPlayer({ role: "BENCH" }),
      makeChoice(),
      "REGULAR",
    );
    const star = calculateMatchPerformance(
      strongPlayer({ role: "STAR" }),
      makeChoice(),
      "REGULAR",
    );
    assert.ok(star > bench);
    assert.equal(star - bench, 10);
  });

  it("ranks FINAL above PLAYOFF above REGULAR", () => {
    const player = strongPlayer({ role: "ROTATION" });
    const choice = makeChoice();
    const regular = calculateMatchPerformance(player, choice, "REGULAR");
    const playoff = calculateMatchPerformance(player, choice, "PLAYOFF");
    const final = calculateMatchPerformance(player, choice, "FINAL");

    assert.ok(final > playoff);
    assert.ok(playoff > regular);
    assert.equal(playoff - regular, 2);
    assert.equal(final - regular, 4);
  });

  it("returns correct draftStock deltas", () => {
    assert.equal(resolveDraftStockDelta(true, 90), 8);
    assert.equal(resolveDraftStockDelta(true, 70), 5);
    assert.equal(resolveDraftStockDelta(false, 90), 3);
    assert.equal(resolveDraftStockDelta(false, 50), -3);
  });

  it("returns correct fame deltas", () => {
    assert.equal(resolveFameDelta(true, 70, "REGULAR"), 3);
    assert.equal(resolveFameDelta(true, 70, "FINAL"), 6);
    assert.equal(resolveFameDelta(false, 90, "REGULAR"), 1);
    assert.equal(resolveFameDelta(false, 50, "REGULAR"), 0);
  });

  it("returns correct stamina deltas", () => {
    assert.equal(resolveStaminaDelta("REGULAR"), -4);
    assert.equal(resolveStaminaDelta("PLAYOFF"), -6);
    assert.equal(resolveStaminaDelta("FINAL"), -8);
  });

  it("returns CUBA_CHAMPION for CUBA FINAL win", () => {
    const player = strongPlayer();
    const event = makeMatchEvent(
      { opponentStrength: 40, stakes: "FINAL" },
      { stage: "CUBA", id: "cuba-finals" },
    );
    const result = resolveMatch(player, event, makeChoice({ intent: "SCORE" }));
    assert.equal(result.won, true);
    assert.equal(result.trophyId, "CUBA_CHAMPION");
  });

  it("does not return trophy for non-FINAL wins", () => {
    const player = strongPlayer();
    const event = makeMatchEvent(
      { opponentStrength: 40, stakes: "REGULAR" },
      { stage: "CUBA" },
    );
    const result = resolveMatch(player, event, makeChoice());
    assert.equal(result.won, true);
    assert.equal(result.trophyId, undefined);
  });

  it("keeps performance in 0-100", () => {
    const high = resolveMatch(
      strongPlayer({ role: "STAR" }),
      makeMatchEvent({ opponentStrength: 10, stakes: "FINAL" }),
      makeChoice({ intent: "SCORE" }),
    );
    const low = resolveMatch(
      weakPlayer({ role: "BENCH", shooting: 0, overall: 0, stamina: 0 }),
      makeMatchEvent({ opponentStrength: 99, stakes: "REGULAR" }),
      makeChoice(),
    );
    assert.ok(high.performance >= 0 && high.performance <= 100);
    assert.ok(low.performance >= 0 && low.performance <= 100);
  });

  it("keeps scores non-negative integers", () => {
    const winScores = resolveMatchScores(80, 50, true);
    const lossScores = resolveMatchScores(40, 80, false);
    assert.ok(Number.isInteger(winScores.playerScore));
    assert.ok(Number.isInteger(winScores.opponentScore));
    assert.ok(winScores.playerScore >= 0);
    assert.ok(winScores.opponentScore >= 0);
    assert.ok(lossScores.playerScore >= 0);
    assert.ok(lossScores.opponentScore >= 0);
  });

  it("throws when MATCH event is missing matchConfig", () => {
    const player = createInitialPlayer();
    const event = makeMatchEvent({ opponentStrength: 40, stakes: "REGULAR" });
    delete (event as { matchConfig?: MatchConfig }).matchConfig;

    assert.throws(
      () => resolveMatch(player, event, makeChoice()),
      /missing matchConfig/,
    );
  });
});
