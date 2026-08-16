import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CareerAgent } from "./career-agent.ts";
import { DeepSeekError } from "./deepseek.ts";
import type {
  CareerAgentContext,
  DeepSeekChatCompletionRequest,
  DeepSeekChatCompletionResponse,
  DeepSeekMessage,
  SearchZhihuOutput,
} from "./types.ts";
import { ZhihuToolError } from "./tools/search-zhihu.ts";

function context(
  overrides: Partial<CareerAgentContext> = {},
): CareerAgentContext {
  return {
    stage: "CUBA",
    eventId: "cuba-finals",
    eventTitle: "总决赛",
    eventDescription: "CUBA 总决赛",
    player: {
      name: "刘看山",
      age: 21,
      team: "CUBA大学球队",
      overall: 74,
      role: "STARTER",
    },
    trigger: "EVENT_RESULT",
    match: { won: true, performance: 88 },
    ...overrides,
  };
}

function finalJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    status: "SUCCESS",
    headline: "CUBA 决赛热议",
    summary: "社区关注大学生球员关键战表现与成长路径。",
    query: "CUBA 大学生篮球 总决赛",
    sources: [
      {
        title: "CUBA 总决赛观察",
        author: "知乎用户",
        excerpt: "年轻球员成长迅速",
        url: "https://www.zhihu.com/question/2",
      },
    ],
    ...overrides,
  });
}

function completionFromMessage(
  message: DeepSeekMessage,
): DeepSeekChatCompletionResponse {
  return { choices: [{ message }] };
}

describe("CareerAgent DeepSeek tool calling", () => {
  it("policy blocked", async () => {
    let called = false;
    const agent = new CareerAgent({
      searchTool: async () => {
        called = true;
        throw new Error("should not search");
      },
      chatCompletion: async () => {
        called = true;
        throw new Error("should not call deepseek");
      },
    });

    const result = await agent.run(
      context({
        stage: "SCHOOL",
        trigger: "EVENT_ENTER",
        match: undefined,
      }),
    );

    assert.equal(result.status, "NOT_NEEDED");
    assert.equal(result.query, null);
    assert.deepEqual(result.sources, []);
    assert.equal(called, false);
  });

  it("no tool call", async () => {
    let searchCalls = 0;
    const agent = new CareerAgent({
      searchTool: async () => {
        searchCalls += 1;
        throw new Error("should not search");
      },
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: finalJson({
            status: "SUCCESS",
            query: null,
            sources: [],
            headline: "无需检索",
            summary: "模型直接给出赛事实景摘要。",
          }),
        }),
    });

    const result = await agent.run(context());
    assert.equal(result.status, "SUCCESS");
    assert.equal(result.headline, "无需检索");
    assert.equal(searchCalls, 0);
  });

  it("search_zhihu tool call", async () => {
    const requests: DeepSeekChatCompletionRequest[] = [];
    const agent = new CareerAgent({
      searchTool: async (input): Promise<SearchZhihuOutput> => ({
        query: input.query,
        results: [
          {
            title: "CUBA 总决赛观察",
            author: "知乎用户",
            excerpt: "年轻球员成长迅速",
            url: "https://www.zhihu.com/question/2",
          },
        ],
      }),
      chatCompletion: async (request) => {
        requests.push(request as DeepSeekChatCompletionRequest);
        if (requests.length === 1) {
          return completionFromMessage({
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: {
                  name: "search_zhihu",
                  arguments: JSON.stringify({
                    query: "CUBA 大学生篮球 总决赛",
                    count: 2,
                  }),
                },
              },
            ],
          });
        }
        return completionFromMessage({
          role: "assistant",
          content: finalJson(),
        });
      },
    });

    const result = await agent.run(context());
    assert.equal(result.status, "SUCCESS");
    assert.equal(result.sources.length, 1);
    assert.equal(requests.length, 2);
    assert.equal(requests[0]?.tools?.[0]?.function.name, "search_zhihu");
  });

  it("tool arguments Zod validation", async () => {
    const agent = new CareerAgent({
      searchTool: async () => {
        throw new Error("should not run invalid args");
      },
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_bad",
              type: "function",
              function: {
                name: "search_zhihu",
                arguments: JSON.stringify({ query: "", count: 99 }),
              },
            },
          ],
        }),
    });

    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("tool called maximum once", async () => {
    let searchCalls = 0;
    const agent = new CareerAgent({
      searchTool: async (input) => {
        searchCalls += 1;
        return { query: input.query, results: [] };
      },
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_a",
              type: "function",
              function: {
                name: "search_zhihu",
                arguments: JSON.stringify({ query: "CUBA A" }),
              },
            },
            {
              id: "call_b",
              type: "function",
              function: {
                name: "search_zhihu",
                arguments: JSON.stringify({ query: "CUBA B" }),
              },
            },
          ],
        }),
    });

    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
    assert.equal(searchCalls, 0);
  });

  it("tool result回传模型", async () => {
    const requests: DeepSeekChatCompletionRequest[] = [];
    const agent = new CareerAgent({
      searchTool: async (input) => ({
        query: input.query,
        results: [
          {
            title: "回传测试",
            author: null,
            excerpt: "excerpt",
            url: "https://www.zhihu.com/question/9",
          },
        ],
      }),
      chatCompletion: async (request) => {
        requests.push(request as DeepSeekChatCompletionRequest);
        if (requests.length === 1) {
          return completionFromMessage({
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_echo",
                type: "function",
                function: {
                  name: "search_zhihu",
                  arguments: JSON.stringify({ query: "CUBA echo", count: 1 }),
                },
              },
            ],
          });
        }
        return completionFromMessage({
          role: "assistant",
          content: finalJson({
            query: "CUBA echo",
            sources: [
              {
                title: "回传测试",
                author: null,
                excerpt: "excerpt",
                url: "https://www.zhihu.com/question/9",
              },
            ],
          }),
        });
      },
    });

    await agent.run(context());
    assert.equal(requests.length, 2);
    const secondMessages = requests[1]?.messages ?? [];
    const toolMessage = secondMessages.find((message) => message.role === "tool");
    assert.ok(toolMessage);
    assert.equal(toolMessage?.tool_call_id, "call_echo");
    assert.match(toolMessage?.content ?? "", /回传测试/);
    assert.equal(requests[1]?.tool_choice, "none");
  });

  it("final structured result", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: finalJson({ status: "NO_RESULTS", sources: [], query: "x" }),
        }),
    });
    const result = await agent.run(context());
    assert.equal(result.status, "NO_RESULTS");
    assert.ok(result.headline.length <= 30);
    assert.ok(result.summary.length <= 100);
  });

  it("invalid final output", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: JSON.stringify({ status: "SUCCESS", headline: "x".repeat(40) }),
        }),
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("DeepSeek 401", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () => {
        throw new DeepSeekError("AI_AUTH_ERROR", "auth", 401);
      },
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("DeepSeek 429", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () => {
        throw new DeepSeekError("AI_RATE_LIMITED", "rate", 429);
      },
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("DeepSeek 5xx", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () => {
        throw new DeepSeekError("AI_UPSTREAM_ERROR", "upstream", 503);
      },
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("network error", async () => {
    const agent = new CareerAgent({
      searchTool: async () => ({ query: "x", results: [] }),
      chatCompletion: async () => {
        throw new DeepSeekError("AI_NETWORK_ERROR", "network");
      },
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("Zhihu AUTH_REQUIRED", async () => {
    const agent = new CareerAgent({
      searchTool: async () => {
        throw new ZhihuToolError("AUTH_REQUIRED", "auth");
      },
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_auth",
              type: "function",
              function: {
                name: "search_zhihu",
                arguments: JSON.stringify({ query: "CUBA" }),
              },
            },
          ],
        }),
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("Zhihu RATE_LIMITED", async () => {
    const agent = new CareerAgent({
      searchTool: async () => {
        throw new ZhihuToolError("RATE_LIMITED", "rate");
      },
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_rate",
              type: "function",
              function: {
                name: "search_zhihu",
                arguments: JSON.stringify({ query: "CUBA" }),
              },
            },
          ],
        }),
    });
    const result = await agent.run(context());
    assert.equal(result.status, "UNAVAILABLE");
  });

  it("Career Agent 不修改 context", async () => {
    const frozen = Object.freeze(
      context({
        player: Object.freeze({
          name: "刘看山",
          age: 21,
          team: "CUBA大学球队",
          overall: 74,
          role: "STARTER",
        }),
        match: Object.freeze({ won: true, performance: 88 }),
      }),
    );

    const agent = new CareerAgent({
      searchTool: async () => ({ query: "CUBA", results: [] }),
      chatCompletion: async () =>
        completionFromMessage({
          role: "assistant",
          content: finalJson({ status: "NO_RESULTS", sources: [] }),
        }),
    });

    await agent.run(frozen);
    assert.equal(frozen.eventTitle, "总决赛");
    assert.equal(frozen.player.overall, 74);
    assert.equal(frozen.match?.won, true);
  });
});
