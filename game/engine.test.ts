import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyChoice,
  calculateOverall,
  CAREER_EVENTS,
  createInitialPlayer,
  EVENT_KINDS,
  getCurrentEvent,
  INITIAL_DRAFT_STOCK,
  isCareerFinished,
  restartCareer,
  type EventKind,
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
    assert.equal(player.age, 12);
    assert.equal(player.overall, calculateOverall(player));
    assert.ok(player.overall >= 45 && player.overall <= 99);
  });

  it("initializes Step 5A career fields with defaults", () => {
    const player = createInitialPlayer();

    assert.equal(player.wins, 0);
    assert.equal(player.losses, 0);
    assert.deepEqual(player.matchHistory, []);
    assert.deepEqual(player.draftHistory, []);
    assert.deepEqual(player.contracts, []);
    assert.deepEqual(player.trophies, []);
    assert.deepEqual(player.awards, []);
    assert.equal(player.draftStock, INITIAL_DRAFT_STOCK);
    assert.equal(player.draftStock, 20);
    assert.equal(player.role, "BENCH");
    assert.equal(player.lastOutcome, null);
    assert.equal(player.careerScore, 0);
    assert.equal(player.careerTier, null);
    assert.deepEqual(player.flags, []);
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
    assert.equal(player.currentEventId, "np-cold-doubt");
    player = applyChoice(player, "np-leave-brave");
    assert.equal(player.stage, "SCHOOL");
    assert.equal(player.age, 15);
    assert.equal(player.team, "校园篮球队");
    assert.equal(player.currentEventId, "school-tryout");
  });

  it("enters RETIRED with isGameOver after a full path", () => {
    const finished = playFullCareer(0);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.equal(finished.age, 33);
    assert.equal(finished.team, "退役");
    assert.equal(finished.currentEventId, null);
    assert.ok(isCareerFinished(finished));
    assert.ok(
      finished.overall >= 75,
      `expected strong endgame OVR, got ${finished.overall}`,
    );
  });

  it("can run a full career from NORTH_POLE to RETIRED", () => {
    const finished = playFullCareer(1);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.ok(finished.careerHistory.length >= 12);
    assert.ok(finished.careerHistory.length <= 45);

    const stages = new Set(finished.careerHistory.map((entry) => entry.stage));
    assert.ok(stages.has("NORTH_POLE"));
    assert.ok(stages.has("SCHOOL"));
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
  const VISUAL_TYPES = new Set([
    "NONE",
    "SHOOT",
    "DEFENSE",
    "DRIVE",
    "CELEBRATE",
    "CHAMPION",
  ]);

  it("has 45-60 events with 3 choices each", () => {
    assert.ok(CAREER_EVENTS.length >= 45);
    assert.ok(CAREER_EVENTS.length <= 60);
    for (const event of CAREER_EVENTS) {
      assert.equal(event.choices.length, 3);
      assert.ok(event.title.length > 0);
      assert.ok(event.kanShanDialogue.length > 0);
    }
  });

  it("requires a valid visualType on every event", () => {
    for (const event of CAREER_EVENTS) {
      assert.ok(
        typeof event.visualType === "string",
        `missing visualType on ${event.id}`,
      );
      assert.ok(
        VISUAL_TYPES.has(event.visualType),
        `invalid visualType ${event.visualType} on ${event.id}`,
      );
    }
  });

  it("keeps landmark visual bindings without changing choice effects", () => {
    const byId = Object.fromEntries(
      CAREER_EVENTS.map((event) => [event.id, event]),
    );
    assert.equal(byId["cuba-first-league"]?.visualType, "SHOOT");
    assert.equal(byId["cuba-finals"]?.visualType, "SHOOT");
    assert.equal(byId["cba-first-pro-camp"]?.visualType, "DEFENSE");
    assert.equal(byId["cba-starting-battle"]?.visualType, "DEFENSE");
    assert.equal(byId["nba-regular-season"]?.visualType, "SHOOT");
    assert.equal(byId["nt-asia"]?.visualType, "DEFENSE");
    assert.equal(byId["nt-world-final"]?.visualType, "CHAMPION");
    assert.equal(byId["np-first-ball"]?.visualType, "NONE");

    const before = createInitialPlayer();
    const after = applyChoice(before, "np-first-ball-shoot");
    assert.notEqual(after.shooting, before.shooting);
    assert.equal(after.careerHistory.length, 1);
  });

  it("requires a valid eventKind on every event", () => {
    const kindSet = new Set<string>(EVENT_KINDS);
    for (const event of CAREER_EVENTS) {
      assert.ok(
        typeof event.eventKind === "string",
        `missing eventKind on ${event.id}`,
      );
      assert.ok(
        kindSet.has(event.eventKind),
        `invalid eventKind ${event.eventKind} on ${event.id}`,
      );
    }
  });

  it("assigns expected eventKind for landmark events", () => {
    const byId = Object.fromEntries(
      CAREER_EVENTS.map((event) => [event.id, event]),
    );
    const expected: Record<string, EventKind> = {
      "np-first-ball": "STORY",
      "np-arctic-training": "STORY",
      "school-tryout": "STORY",
      "school-first-game": "MATCH",
      "school-focus": "STORY",
      "cuba-school-choice": "STORY",
      "cuba-first-league": "MATCH",
      "cuba-finals": "MATCH",
      "cuba-draft-decision": "STORY",
      "cba-draft": "DRAFT",
      "cba-first-pro-camp": "STORY",
      "cba-starting-battle": "STORY",
      "cba-big-decision": "STORY",
      "nba-draft": "DRAFT",
      "nba-summer-league": "MATCH",
      "nba-regular-season": "MATCH",
      "nba-playoff-game": "MATCH",
      "nt-camp": "STORY",
      "nt-asia": "MATCH",
      "nt-world-final": "MATCH",
    };

    for (const [id, kind] of Object.entries(expected)) {
      assert.equal(byId[id]?.eventKind, kind, id);
    }
  });

  it("validates matchConfig and draftConfig shapes when present", () => {
    const stakes = new Set(["REGULAR", "FINAL", "PLAYOFF"]);
    const leagues = new Set(["CBA", "NBA"]);

    for (const event of CAREER_EVENTS) {
      if (event.matchConfig) {
        assert.equal(typeof event.matchConfig.opponentStrength, "number");
        assert.ok(event.matchConfig.opponentStrength >= 0);
        assert.ok(event.matchConfig.opponentStrength <= 99);
        assert.ok(stakes.has(event.matchConfig.stakes));
      }
      if (event.draftConfig) {
        assert.ok(leagues.has(event.draftConfig.league));
      }
      if (event.eventKind === "MATCH") {
        assert.ok(
          event.matchConfig,
          `MATCH event ${event.id} should have matchConfig`,
        );
      }
      if (event.eventKind === "DRAFT") {
        assert.ok(
          event.draftConfig,
          `DRAFT event ${event.id} should have draftConfig`,
        );
      }
    }
  });
});

describe("MATCH engine integration", () => {
  it("updates wins, matchHistory, draftStock, fame, stamina, lastOutcome on MATCH win path", () => {
    let player = createInitialPlayer();
    player = applyChoice(player, "np-first-ball-shoot");
    player = applyChoice(player, "np-arctic-physical");
    player = applyChoice(player, "np-leave-brave");
    player = applyChoice(player, "school-tryout-score");

    assert.equal(player.currentEventId, "school-first-game");
    const before = {
      wins: player.wins,
      losses: player.losses,
      matchCount: player.matchHistory.length,
      draftStock: player.draftStock,
      fame: player.fame,
      stamina: player.stamina,
    };

    const after = applyChoice(player, "school-first-attack");

    assert.equal(after.matchHistory.length, before.matchCount + 1);
    assert.ok(after.lastOutcome?.kind === "MATCH");
    const result = after.lastOutcome.result;
    const awards = after.lastOutcome.awards;
    assert.equal(after.wins, before.wins + (result.won ? 1 : 0));
    assert.equal(after.losses, before.losses + (result.won ? 0 : 1));
    assert.equal(after.draftStock, before.draftStock + result.draftStockDelta);
    // choice effects: fame +2, stamina -3；再叠加 match + award fame deltas
    assert.equal(
      after.fame,
      before.fame + 2 + result.fameDelta + awards.fameDelta,
    );
    assert.equal(after.stamina, before.stamina - 3 + result.staminaDelta);
    assert.ok(
      after.careerHistory.at(-1)?.choiceText.includes(
        result.won ? "胜" : "负",
      ),
    );
  });

  it("increments losses when MATCH is lost", () => {
    let player = createInitialPlayer();
    // Craft a weak player mid-career at a hard MATCH
    player = {
      ...player,
      stage: "NBA",
      currentEventId: "nba-playoff-game",
      shooting: 10,
      finishing: 10,
      passing: 10,
      defense: 10,
      physical: 10,
      basketballIQ: 10,
      mental: 10,
      stamina: 10,
      overall: 10,
      role: "BENCH",
      fame: 20,
      draftStock: 30,
      wins: 0,
      losses: 0,
      matchHistory: [],
      flags: ["NBA_BOUND"],
    };

    const after = applyChoice(player, "nba-po-clutch-shot");
    assert.equal(after.losses, 1);
    assert.equal(after.wins, 0);
    assert.equal(after.matchHistory.length, 1);
    assert.equal(after.matchHistory[0]?.won, false);
    assert.equal(after.lastOutcome?.kind, "MATCH");
  });

  it("still completes a full career to RETIRED with MATCH system", () => {
    const finished = playFullCareer(0);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.ok(finished.careerHistory.length >= 12);
    assert.ok(finished.careerHistory.length <= 45);
    assert.ok(finished.matchHistory.length >= 1);
    assert.equal(
      finished.wins + finished.losses,
      finished.matchHistory.length,
    );
  });
});

describe("AWARDS and career scoring engine integration", () => {
  it("writes trophy and award on CUBA finals MATCH win", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "CUBA" as const,
      currentEventId: "cuba-finals",
      overall: 90,
      shooting: 90,
      finishing: 88,
      passing: 85,
      defense: 70,
      physical: 85,
      basketballIQ: 90,
      mental: 90,
      stamina: 90,
      role: "STAR" as const,
      fame: 40,
      trophies: [],
      awards: [],
    };

    const after = applyChoice(player, "cuba-finals-three");
    assert.ok(after.lastOutcome?.kind === "MATCH");
    assert.ok(after.lastOutcome.result.won);
    assert.ok(after.trophies.some((trophy) => trophy.id === "CUBA_CHAMPION"));
    assert.ok(after.lastOutcome.awards.trophies.length >= 1);
    assert.ok(after.fame > player.fame);
  });

  it("writes personal award when thresholds are met", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "NBA" as const,
      currentEventId: "nba-regular-season",
      overall: 88,
      shooting: 90,
      finishing: 88,
      passing: 85,
      defense: 70,
      physical: 85,
      basketballIQ: 90,
      mental: 90,
      stamina: 90,
      role: "STAR" as const,
      fame: 50,
      trophies: [],
      awards: [],
      flags: ["NBA_BOUND"],
    };

    const after = applyChoice(player, "nba-rs-specialist");
    assert.ok(after.lastOutcome?.kind === "MATCH");
    assert.ok(after.lastOutcome.result.performance >= 85);
    assert.ok(after.awards.some((item) => item.id === "ALL_STAR_LIKE"));
  });

  it("does not duplicate awards already owned", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "CUBA" as const,
      currentEventId: "cuba-finals",
      overall: 92,
      shooting: 92,
      finishing: 90,
      passing: 88,
      defense: 70,
      physical: 88,
      basketballIQ: 92,
      mental: 92,
      stamina: 92,
      role: "STAR" as const,
      fame: 50,
      trophies: [],
      awards: [
        {
          id: "FMVP" as const,
          name: "总决赛 MVP",
          stage: "CUBA" as const,
          eventId: "old",
        },
      ],
    };

    const after = applyChoice(player, "cuba-finals-three");
    const fmvpCount = after.awards.filter((award) => award.id === "FMVP").length;
    assert.equal(fmvpCount, 1);
  });

  it("calculates careerScore and careerTier on retirement", () => {
    const finished = playFullCareer(0);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.ok(finished.careerScore > 0);
    assert.ok(finished.careerTier !== null);
    assert.ok(
      [
        "LEGEND",
        "SUPERSTAR",
        "STAR",
        "STARTER",
        "ROLE_PLAYER",
        "JOURNEYMAN",
      ].includes(finished.careerTier!),
    );
  });

  it("still reaches RETIRED with awards + career scoring", () => {
    const finished = playFullCareer(2);
    assert.equal(finished.stage, "RETIRED");
    assert.ok(finished.careerHistory.length >= 12);
    assert.ok(finished.careerHistory.length <= 45);
    assert.ok(typeof finished.careerScore === "number");
  });
});

describe("DRAFT engine integration", () => {
  it("updates draftHistory, team, role, and lastOutcome on DRAFT", () => {
    let player = createInitialPlayer();
    player = {
      ...player,
      stage: "CBA",
      currentEventId: "cba-draft",
      overall: 88,
      potential: 90,
      draftStock: 75,
      basketballIQ: 80,
      mental: 80,
      fame: 50,
      role: "BENCH",
      team: "CBA职业球队",
      draftHistory: [],
      contracts: [],
      money: 0,
    };

    const beforeTeam = player.team;
    const beforeFame = player.fame;
    const beforeMoney = player.money;
    const after = applyChoice(player, "cba-draft-showcase-skill");

    assert.equal(after.draftHistory.length, 1);
    assert.equal(after.contracts.length, 1);
    assert.ok(after.lastOutcome?.kind === "DRAFT");
    const draft = after.lastOutcome.result;
    const contractResult = after.lastOutcome.contract;
    assert.equal(after.team, draft.teamName);
    assert.equal(after.team, contractResult.contract.teamName);
    assert.notEqual(after.team, beforeTeam);
    assert.equal(
      after.role,
      draft.tier === "LOTTERY" || draft.tier === "FIRST_ROUND"
        ? "ROTATION"
        : "BENCH",
    );
    // choice effects money +20000, then signingBonus only (not annualSalary)
    assert.equal(
      after.money,
      beforeMoney + 20000 + contractResult.contract.signingBonus,
    );
    // choice effects fame +3, then contract fameDelta
    assert.equal(after.fame, beforeFame + 3 + contractResult.fameDelta);
    assert.ok(after.careerHistory.at(-1)?.choiceText.includes(draft.message));
    assert.ok(
      after.careerHistory.at(-1)?.choiceText.includes(contractResult.summary),
    );
  });

  it("adds signingBonus to money but not annualSalary", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "CBA" as const,
      currentEventId: "cba-draft",
      overall: 88,
      potential: 90,
      draftStock: 75,
      basketballIQ: 80,
      mental: 80,
      fame: 50,
      money: 1000,
      contracts: [],
      draftHistory: [],
    };

    // Use interview choice: money 12000 in effects
    const after = applyChoice(player, "cba-draft-interview");
    assert.ok(after.lastOutcome?.kind === "DRAFT");
    const { contract } = after.lastOutcome.contract;
    assert.equal(after.contracts.length, 1);
    assert.equal(
      after.money,
      1000 + 12000 + contract.signingBonus,
    );
    assert.notEqual(
      after.money,
      1000 + 12000 + contract.signingBonus + contract.annualSalary,
    );
  });

  it("sets BENCH role for undrafted outcome and still creates contract", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "NBA" as const,
      currentEventId: "nba-draft",
      overall: 35,
      potential: 35,
      draftStock: 5,
      basketballIQ: 20,
      mental: 20,
      fame: 0,
      role: "STARTER" as const,
      team: "NBA职业球队",
      draftHistory: [],
      contracts: [],
      money: 0,
      flags: ["NBA_BOUND"],
    };

    const after = applyChoice(player, "nba-draft-media");
    assert.equal(after.lastOutcome?.kind, "DRAFT");
    assert.equal(after.lastOutcome.result.tier, "UNDRAFTED");
    assert.equal(after.draftHistory[0]?.teamName, "未选中");
    assert.equal(after.contracts[0]?.teamName, "未选中");
    assert.equal(after.role, "BENCH");
    assert.equal(after.contracts.length, 1);
    assert.equal(after.contracts[0]?.years, 1);
    assert.ok(after.lastOutcome.contract);
  });

  it("still reaches RETIRED with draft + contract system enabled", () => {
    const finished = playFullCareer(1);
    assert.equal(finished.stage, "RETIRED");
    assert.equal(finished.isGameOver, true);
    assert.ok(finished.draftHistory.length >= 1);
    assert.ok(finished.contracts.length >= 1);
    assert.equal(finished.draftHistory.length, finished.contracts.length);
    assert.ok(finished.careerHistory.length >= 12);
    assert.ok(finished.careerHistory.length <= 45);
  });
});

describe("branching career paths", () => {
  it("school star path reaches cuba-elite-invite", () => {
    let player = createInitialPlayer();
    for (const id of [
      "np-first-ball-shoot",
      "np-arctic-physical",
      "np-leave-brave",
      "school-tryout-score",
      "school-first-attack",
      "school-bench-ignore",
      "school-rival-iso",
    ]) {
      player = applyChoice(player, id);
    }
    player = applyChoice(player, "school-focus-star");
    assert.ok(player.flags.includes("SCHOOL_STAR"));
    assert.equal(player.currentEventId, "cuba-elite-invite");
    assert.ok(
      !player.careerHistory.some((entry) => entry.eventId === "cuba-walkon-tryout"),
    );
  });

  it("school grind path reaches cuba-walkon-tryout", () => {
    let player = createInitialPlayer();
    for (const id of [
      "np-first-ball-shoot",
      "np-arctic-physical",
      "np-leave-brave",
      "school-tryout-score",
      "school-first-attack",
      "school-bench-ignore",
      "school-rival-iso",
    ]) {
      player = applyChoice(player, id);
    }
    player = applyChoice(player, "school-focus-grind");
    assert.ok(player.flags.includes("SCHOOL_GRIND"));
    assert.equal(player.currentEventId, "cuba-walkon-tryout");
  });

  it("skip draft flag routes to undrafted camp", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "CUBA" as const,
      currentEventId: "cuba-draft-decision",
      flags: [] as PlayerState["flags"],
    };
    const after = applyChoice(player, "cuba-draft-skip");
    assert.ok(after.flags.includes("SKIPPED_DRAFT"));
    assert.equal(after.currentEventId, "cba-undrafted-camp");
  });

  it("applies negative choice effects", () => {
    const before = createInitialPlayer();
    const after = applyChoice(before, "np-first-ball-quit");
    assert.ok(after.mental < before.mental);
    assert.ok(after.potential <= before.potential);
  });

  it("early retire path still calculates career score", () => {
    const player = {
      ...createInitialPlayer(),
      stage: "CBA" as const,
      currentEventId: "cba-after-title",
      flags: ["DOMESTIC_FOCUS"] as PlayerState["flags"],
      overall: 70,
      fame: 40,
    };
    const after = applyChoice(player, "cba-after-retire-early");
    assert.equal(after.stage, "RETIRED");
    assert.equal(after.isGameOver, true);
    assert.ok(after.careerScore > 0);
    assert.ok(after.careerTier !== null);
  });

  it("ambitious path can still reach national team and retire", () => {
    const finished = playFullCareer(0);
    assert.equal(finished.stage, "RETIRED");
    const stages = new Set(finished.careerHistory.map((entry) => entry.stage));
    assert.ok(stages.has("NBA") || stages.has("NATIONAL_TEAM"));
    assert.ok(finished.careerTier !== null);
  });
});
