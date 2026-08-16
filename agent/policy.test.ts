import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildZhihuQuery, shouldSearchZhihu } from "./policy.ts";
import type { CareerAgentContext } from "./types.ts";

function baseContext(
  overrides: Partial<CareerAgentContext> &
    Pick<CareerAgentContext, "stage" | "trigger">,
): CareerAgentContext {
  return {
    eventId: "evt-1",
    eventTitle: "总决赛关键战",
    eventDescription: "看山迎来关键一战",
    player: {
      name: "刘看山",
      age: 22,
      team: "测试队",
      overall: 72,
      role: "STARTER",
    },
    ...overrides,
  };
}

describe("shouldSearchZhihu", () => {
  it("NORTH_POLE -> no search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "NORTH_POLE",
          trigger: "EVENT_RESULT",
          match: { won: true },
        }),
      ),
      false,
    );
  });

  it("SCHOOL -> no search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "SCHOOL",
          trigger: "EVENT_RESULT",
          match: { won: true },
        }),
      ),
      false,
    );
  });

  it("CUBA MATCH -> search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "CUBA",
          trigger: "EVENT_RESULT",
          match: { won: true, performance: 80 },
        }),
      ),
      true,
    );
  });

  it("CBA MATCH -> search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "CBA",
          trigger: "EVENT_RESULT",
          match: { won: false, performance: 55 },
        }),
      ),
      true,
    );
  });

  it("NBA DRAFT -> search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "NBA",
          trigger: "EVENT_RESULT",
          draft: { league: "NBA", pick: 12, teamName: "某队" },
        }),
      ),
      true,
    );
  });

  it("NATIONAL_TEAM FINAL -> search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "NATIONAL_TEAM",
          trigger: "EVENT_RESULT",
          eventTitle: "世界杯决赛",
          match: { won: true, performance: 90 },
        }),
      ),
      true,
    );
  });

  it("STORY -> no search", () => {
    assert.equal(
      shouldSearchZhihu(
        baseContext({
          stage: "CUBA",
          trigger: "EVENT_ENTER",
        }),
      ),
      false,
    );
  });
});

describe("buildZhihuQuery", () => {
  it("query builder CUBA", () => {
    assert.equal(
      buildZhihuQuery(
        baseContext({
          stage: "CUBA",
          trigger: "EVENT_RESULT",
          eventTitle: "四强赛",
          match: {},
        }),
      ),
      "CUBA 大学生篮球 四强赛",
    );
  });

  it("query builder CBA", () => {
    assert.equal(
      buildZhihuQuery(
        baseContext({
          stage: "CBA",
          trigger: "EVENT_RESULT",
          eventTitle: "新秀墙",
          match: {},
        }),
      ),
      "CBA 年轻球员 新秀墙",
    );
  });

  it("query builder NBA", () => {
    assert.equal(
      buildZhihuQuery(
        baseContext({
          stage: "NBA",
          trigger: "EVENT_RESULT",
          eventTitle: "夏联首秀",
          match: {},
        }),
      ),
      "NBA 中国球员 夏联首秀",
    );
  });

  it("query builder NATIONAL_TEAM", () => {
    assert.equal(
      buildZhihuQuery(
        baseContext({
          stage: "NATIONAL_TEAM",
          trigger: "EVENT_RESULT",
          eventTitle: "亚洲杯决赛",
          match: {},
        }),
      ),
      "中国男篮 国家队 亚洲杯决赛",
    );
  });
});
