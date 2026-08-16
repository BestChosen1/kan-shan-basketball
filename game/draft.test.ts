import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CBA_DRAFT_WEIGHTS,
  NBA_DRAFT_WEIGHTS,
  UNDRAFTED_TEAM_NAME,
} from "./constants.ts";
import { createInitialPlayer } from "./engine.ts";
import {
  buildDraftMessage,
  calculateDraftValue,
  resolveDraft,
  resolveDraftPick,
  resolveDraftTeamName,
  resolveDraftTier,
} from "./draft.ts";
import type { Choice, GameEvent, PlayerState } from "./types.ts";

function makeChoice(overrides: Partial<Choice> = {}): Choice {
  return {
    id: "draft-choice",
    text: "选秀选择",
    effects: {},
    ...overrides,
  };
}

function makeDraftEvent(
  league: "CBA" | "NBA",
  overrides: Partial<GameEvent> = {},
): GameEvent {
  return {
    id: league === "CBA" ? "cba-draft" : "nba-draft",
    stage: league,
    title: `${league} 选秀`,
    description: "desc",
    kanShanDialogue: "dialogue",
    visualType: "NONE",
    eventKind: "DRAFT",
    draftConfig: { league },
    choices: [makeChoice(), makeChoice({ id: "b" }), makeChoice({ id: "c" })],
    ...overrides,
  };
}

function playerWithDraftStats(
  overrides: Partial<PlayerState> = {},
): PlayerState {
  const base = createInitialPlayer();
  return {
    ...base,
    overall: 70,
    potential: 70,
    draftStock: 50,
    basketballIQ: 60,
    mental: 60,
    fame: 40,
    ...overrides,
  };
}

describe("resolveDraft", () => {
  it("maps high draft value to LOTTERY", () => {
    const player = playerWithDraftStats({
      overall: 95,
      potential: 95,
      draftStock: 90,
      basketballIQ: 90,
      mental: 90,
      fame: 80,
    });
    const result = resolveDraft(
      player,
      makeDraftEvent("CBA"),
      makeChoice({ intent: "DECLARE" }),
    );
    assert.equal(result.tier, "LOTTERY");
    assert.ok(result.pick >= 1 && result.pick <= 14);
    assert.ok(result.draftValue >= 82);
  });

  it("maps mid-high value to FIRST_ROUND", () => {
    // Target ~76: overall 80 * 0.45 = 36, pot 80*0.2=16, stock 70*0.2=14, iq 60*0.05=3, mental 60*0.05=3, fame 40*0.05=2 = 74
    const player = playerWithDraftStats({
      overall: 80,
      potential: 80,
      draftStock: 70,
      basketballIQ: 60,
      mental: 60,
      fame: 40,
    });
    const value = calculateDraftValue(player, "CBA", makeChoice());
    assert.ok(value >= 72 && value <= 81, `got ${value}`);
    const result = resolveDraft(player, makeDraftEvent("CBA"), makeChoice());
    assert.equal(result.tier, "FIRST_ROUND");
    assert.ok(result.pick >= 15 && result.pick <= 30);
  });

  it("maps mid value to SECOND_ROUND", () => {
    // ~65: ovr 70*0.45=31.5, pot 70*0.2=14, stock 40*0.2=8, iq/mental/fame ~8 = ~61.5
    const player = playerWithDraftStats({
      overall: 72,
      potential: 70,
      draftStock: 45,
      basketballIQ: 50,
      mental: 50,
      fame: 30,
    });
    const value = calculateDraftValue(player, "CBA", makeChoice());
    assert.ok(value >= 60 && value <= 71, `got ${value}`);
    const result = resolveDraft(player, makeDraftEvent("CBA"), makeChoice());
    assert.equal(result.tier, "SECOND_ROUND");
    assert.ok(result.pick >= 31 && result.pick <= 60);
  });

  it("maps low value to UNDRAFTED", () => {
    const player = playerWithDraftStats({
      overall: 40,
      potential: 40,
      draftStock: 10,
      basketballIQ: 30,
      mental: 30,
      fame: 5,
    });
    const result = resolveDraft(player, makeDraftEvent("NBA"), makeChoice());
    assert.equal(result.tier, "UNDRAFTED");
    assert.equal(result.pick, 0);
    assert.equal(result.teamName, UNDRAFTED_TEAM_NAME);
  });

  it("applies DECLARE intent bonus +5", () => {
    const player = playerWithDraftStats();
    const base = calculateDraftValue(player, "CBA", makeChoice());
    const declared = calculateDraftValue(
      player,
      "CBA",
      makeChoice({ intent: "DECLARE" }),
    );
    assert.equal(declared - base, 5);
  });

  it("applies WAIT intent bonus +2", () => {
    const player = playerWithDraftStats();
    const base = calculateDraftValue(player, "CBA", makeChoice());
    const waited = calculateDraftValue(
      player,
      "CBA",
      makeChoice({ intent: "WAIT" }),
    );
    assert.equal(waited - base, 2);
  });

  it("uses CBA draft weights", () => {
    const player = playerWithDraftStats({
      overall: 100,
      potential: 0,
      draftStock: 0,
      basketballIQ: 0,
      mental: 0,
      fame: 0,
    });
    const value = calculateDraftValue(player, "CBA", makeChoice());
    assert.equal(value, Math.round(100 * CBA_DRAFT_WEIGHTS.overall));
  });

  it("uses NBA draft weights", () => {
    const player = playerWithDraftStats({
      overall: 100,
      potential: 0,
      draftStock: 0,
      basketballIQ: 0,
      mental: 0,
      fame: 0,
    });
    const value = calculateDraftValue(player, "NBA", makeChoice());
    assert.equal(value, Math.round(100 * NBA_DRAFT_WEIGHTS.overall));
  });

  it("is fully deterministic", () => {
    const player = playerWithDraftStats({
      overall: 85,
      potential: 88,
      draftStock: 70,
    });
    const event = makeDraftEvent("NBA");
    const choice = makeChoice({ intent: "DECLARE" });
    assert.deepEqual(
      resolveDraft(player, event, choice),
      resolveDraft(player, event, choice),
    );
  });

  it("keeps lottery pick in 1-14", () => {
    assert.equal(resolveDraftTier(100), "LOTTERY");
    assert.equal(resolveDraftPick(100, "LOTTERY"), 1);
    assert.equal(resolveDraftPick(82, "LOTTERY"), 14);
  });

  it("maps teams by pick for CBA and NBA", () => {
    assert.equal(resolveDraftTeamName("CBA", 3, "LOTTERY"), "北极星俱乐部");
    assert.equal(resolveDraftTeamName("CBA", 10, "LOTTERY"), "极光篮球队");
    assert.equal(resolveDraftTeamName("CBA", 20, "FIRST_ROUND"), "长城篮球队");
    assert.equal(resolveDraftTeamName("CBA", 45, "SECOND_ROUND"), "雪狐篮球队");
    assert.equal(resolveDraftTeamName("NBA", 2, "LOTTERY"), "North Star");
    assert.equal(resolveDraftTeamName("NBA", 8, "LOTTERY"), "Northern Lights");
    assert.equal(
      resolveDraftTeamName("NBA", 22, "FIRST_ROUND"),
      "Arctic Wolves",
    );
    assert.equal(
      resolveDraftTeamName("NBA", 50, "SECOND_ROUND"),
      "Polar Bears",
    );
  });

  it("uses undrafted team name", () => {
    assert.equal(
      resolveDraftTeamName("CBA", 0, "UNDRAFTED"),
      UNDRAFTED_TEAM_NAME,
    );
    assert.ok(
      buildDraftMessage("CBA", "UNDRAFTED", 0, UNDRAFTED_TEAM_NAME).includes(
        "未能被选中",
      ),
    );
  });

  it("does not mutate the player object", () => {
    const player = playerWithDraftStats({ overall: 88, draftStock: 80 });
    const snapshot = structuredClone(player);
    resolveDraft(player, makeDraftEvent("CBA"), makeChoice({ intent: "DECLARE" }));
    assert.deepEqual(player, snapshot);
  });
});
