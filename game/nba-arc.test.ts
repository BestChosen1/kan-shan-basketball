import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveNbaArcPhase,
  resolveNbaArcEventId,
  roleFromNbaArcPhase,
  NBA_ARC_PHASE_LABEL,
} from "./nba-arc.ts";

describe("resolveNbaArcPhase", () => {
  it("marks early low-OVR seasons as ROOKIE", () => {
    assert.equal(
      resolveNbaArcPhase({ age: 22, overall: 68, nbaSeason: 1 }),
      "ROOKIE",
    );
  });

  it("marks mid OVR as STARTER", () => {
    assert.equal(
      resolveNbaArcPhase({ age: 27, overall: 78, nbaSeason: 4 }),
      "STARTER",
    );
  });

  it("marks high OVR as ALL_STAR then SUPERSTAR", () => {
    assert.equal(
      resolveNbaArcPhase({ age: 28, overall: 85, nbaSeason: 5 }),
      "ALL_STAR",
    );
    assert.equal(
      resolveNbaArcPhase({ age: 29, overall: 91, nbaSeason: 6 }),
      "SUPERSTAR",
    );
  });

  it("prioritizes VETERAN by age", () => {
    assert.equal(
      resolveNbaArcPhase({ age: 35, overall: 92, nbaSeason: 10 }),
      "VETERAN",
    );
  });

  it("maps each phase to a distinct arc event id", () => {
    assert.equal(
      resolveNbaArcEventId("ROOKIE", "early"),
      "nba-arc-rookie-wall",
    );
    assert.equal(
      resolveNbaArcEventId("SUPERSTAR", "mid"),
      "nba-arc-mvp-race",
    );
    assert.equal(resolveNbaArcEventId("VETERAN", "late"), "nba-arc-vet-ring");
  });

  it("exposes Chinese labels", () => {
    assert.equal(NBA_ARC_PHASE_LABEL.ALL_STAR, "全明星时期");
  });

  it("maps phase to role", () => {
    assert.equal(roleFromNbaArcPhase("ROOKIE"), "ROTATION");
    assert.equal(roleFromNbaArcPhase("SUPERSTAR"), "STAR");
  });
});
