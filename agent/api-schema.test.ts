import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  careerAgentApiRequestSchema,
  careerAgentContextSchema,
} from "./schemas.ts";
import { getZhihuCliPath } from "./tools/search-zhihu.ts";

describe("careerAgentApiRequestSchema", () => {
  it("accepts CareerAgentContext", () => {
    const parsed = careerAgentApiRequestSchema.parse({
      context: {
        stage: "CUBA",
        eventId: "cuba-finals",
        eventTitle: "总决赛",
        eventDescription: "CUBA 总决赛",
        trigger: "EVENT_RESULT",
        player: {
          name: "刘看山",
          age: 21,
          team: "CUBA大学球队",
          overall: 74,
          role: "STARTER",
        },
        match: { won: true, performance: 88 },
      },
    });
    assert.equal(parsed.context.stage, "CUBA");
  });

  it("rejects full PlayerState-like payloads", () => {
    const result = careerAgentContextSchema.safeParse({
      stage: "CUBA",
      eventId: "cuba-finals",
      eventTitle: "总决赛",
      eventDescription: "desc",
      trigger: "EVENT_RESULT",
      player: {
        name: "刘看山",
        age: 21,
        team: "CUBA大学球队",
        overall: 74,
        role: "STARTER",
        wins: 12,
        losses: 0,
        draftStock: 80,
      },
    });
    assert.equal(result.success, false);
  });
});

describe("getZhihuCliPath", () => {
  it("requires absolute ZHIHU_CLI", () => {
    assert.throws(
      () => getZhihuCliPath({}),
      (error: unknown) =>
        error instanceof Error && error.message === "ZHIHU_CLI is not configured",
    );
    assert.throws(
      () => getZhihuCliPath({ ZHIHU_CLI: "zhihu-cli" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "ZHIHU_CLI must be an absolute path",
    );
    assert.equal(
      getZhihuCliPath({ ZHIHU_CLI: "/abs/path/zhihu-cli" }),
      "/abs/path/zhihu-cli",
    );
  });
});
