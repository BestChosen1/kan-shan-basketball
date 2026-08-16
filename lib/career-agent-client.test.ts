import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mapCareerAgentOutputToCardStatus,
  requestCareerAgent,
  shouldRequestCareerAgent,
} from "./career-agent-client.ts";
import type { CareerAgentClientContext } from "./career-agent-types.ts";

const sampleContext: CareerAgentClientContext = {
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
};

describe("shouldRequestCareerAgent", () => {
  it("ordinary STORY 不请求 API", () => {
    assert.equal(
      shouldRequestCareerAgent({
        eventKind: "STORY",
        stageChanged: false,
        careerComplete: false,
      }),
      null,
    );
  });

  it("MATCH 请求 API", () => {
    assert.equal(
      shouldRequestCareerAgent({
        eventKind: "MATCH",
        stageChanged: false,
        careerComplete: false,
      }),
      "MATCH",
    );
  });

  it("DRAFT 请求 API", () => {
    assert.equal(
      shouldRequestCareerAgent({
        eventKind: "DRAFT",
        stageChanged: false,
        careerComplete: false,
      }),
      "DRAFT",
    );
  });

  it("STAGE_CHANGE 请求 API", () => {
    assert.equal(
      shouldRequestCareerAgent({
        eventKind: "STORY",
        stageChanged: true,
        careerComplete: false,
      }),
      "STAGE_CHANGE",
    );
  });

  it("CAREER_COMPLETE 请求 API", () => {
    assert.equal(
      shouldRequestCareerAgent({
        eventKind: "STORY",
        stageChanged: false,
        careerComplete: true,
      }),
      "CAREER_COMPLETE",
    );
  });
});

describe("mapCareerAgentOutputToCardStatus", () => {
  it("success", () => {
    assert.equal(
      mapCareerAgentOutputToCardStatus({
        ok: true,
        data: {
          status: "SUCCESS",
          headline: "热议",
          summary: "摘要",
          query: "hidden",
          sources: [
            {
              title: "标题",
              author: "作者",
              excerpt: "摘录",
              url: "https://www.zhihu.com/question/1",
            },
          ],
        },
      }),
      "success",
    );
  });

  it("empty", () => {
    assert.equal(
      mapCareerAgentOutputToCardStatus({
        ok: true,
        data: {
          status: "NO_RESULTS",
          headline: "",
          summary: "",
          query: null,
          sources: [],
        },
      }),
      "empty",
    );
  });

  it("error", () => {
    assert.equal(
      mapCareerAgentOutputToCardStatus({
        ok: false,
        error: { code: "AGENT_UNAVAILABLE", message: "down" },
      }),
      "error",
    );
  });

  it("API error 映射为 error，不影响调用方游戏逻辑", () => {
    const status = mapCareerAgentOutputToCardStatus({
      ok: false,
      error: { code: "AGENT_UNAVAILABLE", message: "down" },
    });
    assert.equal(status, "error");
  });
});

describe("requestCareerAgent", () => {
  it("解析 success 响应", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            status: "SUCCESS",
            headline: "CUBA 热议",
            summary: "社区关注决赛。",
            query: "should-not-matter",
            sources: [
              {
                title: "观察",
                author: "用户",
                excerpt: "摘录",
                url: "https://www.zhihu.com/question/2",
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    try {
      const result = await requestCareerAgent(sampleContext);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.data.sources.length, 1);
        assert.equal(result.data.sources[0]?.url.startsWith("https://"), true);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("解析 error 响应", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          ok: false,
          error: { code: "AGENT_UNAVAILABLE", message: "unavailable" },
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    try {
      const result = await requestCareerAgent(sampleContext);
      assert.equal(result.ok, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("stale AbortSignal 会抛出 AbortError", async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      () => requestCareerAgent(sampleContext, { signal: controller.signal }),
      (error: unknown) =>
        error instanceof Error && error.name === "AbortError",
    );
  });
});

describe("zhihu request generation guard", () => {
  it("restart 后旧请求不会污染状态", () => {
    let currentId = 0;
    let status: "idle" | "loading" | "success" = "idle";
    let headline: string | null = null;

    function startRequest() {
      const requestId = ++currentId;
      status = "loading";
      return requestId;
    }

    function applyResponse(requestId: number, nextHeadline: string) {
      if (requestId !== currentId) {
        return;
      }
      status = "success";
      headline = nextHeadline;
    }

    const first = startRequest();
    const second = startRequest();
    applyResponse(first, "旧生涯");
    assert.equal(status, "loading");
    assert.equal(headline, null);
    applyResponse(second, "新生涯");
    assert.equal(status, "success");
    assert.equal(headline, "新生涯");
  });
});
