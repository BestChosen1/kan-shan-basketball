import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyChoice,
  calculateOverall,
  CAREER_EVENTS,
  CAREER_STAGE_ORDER,
  createInitialPlayer,
  getCurrentEvent,
  getEventsByStage,
  isCareerFinished,
  restartCareer,
  type PlayerState,
} from "./index.ts";

function playFullCareer(pickChoiceIndex = 0): PlayerState {
  let player = createInitialPlayer();
  let guard = 0;

  while (!isCareerFinished(player) && guard < 100) {
    const event = getCurrentEvent(player);
    assert.ok(event, `expected an active event at step ${guard}`);
    const choice = event.choices[pickChoiceIndex] ?? event.choices[0];
    player = applyChoice(player, choice.id);
    guard += 1;
  }

  return player;
}

describe("createInitialPlayer", () => {
  it("returns a valid starting state for 刘看山", () => {
    const player = createInitialPlayer();

    assert.equal(player.name, "刘看山");
    assert.equal(player.stage, "NORTH_POLE");
    assert.equal(player.team, "北极冰原篮球队");
    assert.equal(player.isGameOver, false);
    assert.equal(player.careerHistory.length, 0);
    assert.equal(player.currentEventId, "np-first-ball");
    assert.equal(player.overall, calculateOverall(player));
    assert.ok(player.overall >= 0 && player.overall <= 99);
  });
});

describe("calculateOverall", () => {
  it("uses weighted skills and rounds to an integer in 0-99", () => {
    const overall = calculateOverall({
      shooting: 50,
      finishing: 40,
      passing: 40,
      defense: 40,
      physical: 50,
      basketballIQ: 60,
    });

    // 50*0.2 + 40*0.15 + 40*0.15 + 40*0.15 + 50*0.1 + 60*0.25 = 48
    assert.equal(overall, 48);
  });

  it("clamps overall to 0-99", () => {
    assert.equal(
      calculateOverall({
        shooting: 99,
        finishing: 99,
        passing: 99,
        defense: 99,
        physical: 99,
        basketballIQ: 99,
      }),
      99,
    );
  });
});

describe("applyChoice", () => {
  it("modifies attributes through the engine", () => {
    const before = createInitialPlayer();
    const event = getCurrentEvent(before);
    assert.ok(event);
    const choice = event.choices[0];
    const after = applyChoice(before, choice.id);

    assert.notEqual(after.shooting, before.shooting);
    assert.equal(after.overall, calculateOverall(after));
  });

  it("records careerHistory", () => {
    const before = createInitialPlayer();
    const event = getCurrentEvent(before);
    assert.ok(event);
    const after = applyChoice(before, event.choices[0].id);

    assert.equal(after.careerHistory.length, 1);
    assert.equal(after.careerHistory[0]?.eventId, event.id);
    assert.equal(after.careerHistory[0]?.choiceId, event.choices[0].id);
    assert.equal(after.careerHistory[0]?.eventTitle, event.title);
    assert.ok(typeof after.careerHistory[0]?.timestamp === "number");
  });

  it("does not mutate the original player object", () => {
    const before = createInitialPlayer();
    const snapshot = structuredClone(before);
    const event = getCurrentEvent(before);
    assert.ok(event);
    applyChoice(before, event.choices[0].id);
    assert.deepEqual(before, snapshot);
  });
});

describe("clamping", () => {
  it("never exceeds attribute upper bounds", () => {
    let player = createInitialPlayer();
    player = {
      ...player,
      shooting: 98,
      fame: 99,
      stamina: 99,
      money: 10,
    };

    const boosted = applyChoice(
      {
        ...player,
        currentEventId: "np-first-ball",
      },
      "np-first-ball-shoot",
    );

    assert.ok(boosted.shooting <= 99);
    assert.ok(boosted.fame <= 100);
    assert.ok(boosted.stamina <= 100);
    assert.ok(boosted.stamina >= 0);
  });

  it("never goes below attribute lower bounds", () => {
    let player = createInitialPlayer();
    player = {
      ...player,
      shooting: 1,
      stamina: 1,
      money: 0,
      fame: 0,
    };

    // Apply a stamina-negative choice repeatedly via crafted path
    const after = applyChoice(player, "np-first-ball-shoot");
    assert.ok(after.stamina >= 0);
    assert.ok(after.shooting >= 0);
    assert.ok(after.money >= 0);
    assert.ok(after.fame >= 0);
  });
});

describe("event and stage progression", () => {
  it("advances to the next event after a choice", () => {
    const before = createInitialPlayer();
    assert.equal(before.currentEventId, "np-first-ball");
    const after = applyChoice(before, "np-first-ball-shoot");
    assert.equal(after.currentEventId, "np-arctic-training");
    assert.equal(after.stage, "NORTH_POLE");
  });

  it("advances stage after the last event of a stage", () => {
    let player = createInitialPlayer();
    player = applyChoice(player, "np-first-ball-shoot");
    assert.equal(player.stage, "NORTH_POLE");
    player = applyChoice(player, "np-arctic-physical");
    assert.equal(player.stage, "SCHOOL");
    assert.equal(player.team, "校园篮球队");
    assert.equal(player.currentEventId, "school-tryout");
  });

  it("enters RETIRED with isGameOver after NATIONAL_TEAM", () => {
    const finished = playFullCareer(0);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.equal(finished.team, "退役");
    assert.equal(finished.currentEventId, null);
    assert.ok(isCareerFinished(finished));
  });

  it("can run a full career from NORTH_POLE to RETIRED", () => {
    const finished = playFullCareer(1);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.equal(finished.careerHistory.length, CAREER_EVENTS.length);

    const stages = new Set(finished.careerHistory.map((entry) => entry.stage));
    for (const stage of CAREER_STAGE_ORDER.slice(0, -1)) {
      assert.ok(stages.has(stage), `missing history for ${stage}`);
      assert.ok(getEventsByStage(stage).length > 0);
    }
  });

  it("restartCareer resets to the beginning", () => {
    const finished = playFullCareer(2);
    const restarted = restartCareer();
    assert.equal(restarted.stage, "NORTH_POLE");
    assert.equal(restarted.isGameOver, false);
    assert.equal(restarted.careerHistory.length, 0);
    assert.notEqual(finished.stage, restarted.stage);
  });
});

describe("event catalog", () => {
  it("has about 20 fixed events with 3 choices each", () => {
    assert.equal(CAREER_EVENTS.length, 20);
    for (const event of CAREER_EVENTS) {
      assert.equal(event.choices.length, 3);
      assert.ok(event.title.length > 0);
      assert.ok(event.kanShanDialogue.length > 0);
    }
  });
});
