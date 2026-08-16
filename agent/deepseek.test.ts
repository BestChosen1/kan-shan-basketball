import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createChatCompletion,
  DeepSeekError,
  DEEPSEEK_BASE_URL,
  DEFAULT_DEEPSEEK_MODEL,
  getDeepSeekConfig,
  resolveDeepSeekModel,
} from "./deepseek.ts";

describe("getDeepSeekConfig", () => {
  it("reads key and model without printing secrets", () => {
    const config = getDeepSeekConfig({
      DEEPSEEK_API_KEY: "secret-value",
      DEEPSEEK_MODEL: "deepseek-v4-flash",
    });
    assert.equal(config.apiKey, "secret-value");
    assert.equal(config.model, "deepseek-v4-flash");
    assert.equal(config.baseUrl, DEEPSEEK_BASE_URL);
  });

  it("defaults model to deepseek-v4-flash", () => {
    const config = getDeepSeekConfig({
      DEEPSEEK_API_KEY: "secret-value",
    });
    assert.equal(config.model, DEFAULT_DEEPSEEK_MODEL);
  });

  it("throws clear error when key missing", () => {
    assert.throws(
      () => getDeepSeekConfig({}),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "DEEPSEEK_API_KEY is not configured",
    );
  });
});

describe("createChatCompletion", () => {
  it("posts to DeepSeek chat completions with bearer auth", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const response = await createChatCompletion(
      {
        messages: [{ role: "user", content: "ping" }],
      },
      {
        apiKey: "test-key",
        model: "deepseek-v4-flash",
        fetch: async (url, init) => {
          calls.push({ url: String(url), init });
          return new Response(
            JSON.stringify({
              choices: [{ message: { role: "assistant", content: "{}" } }],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        },
      },
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, `${DEEPSEEK_BASE_URL}/chat/completions`);
    const headers = new Headers(calls[0]?.init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer test-key");
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(response.choices[0]?.message.content, "{}");
  });

  it("maps 401 / 429 / 5xx / network errors", async () => {
    await assert.rejects(
      () =>
        createChatCompletion(
          { messages: [{ role: "user", content: "x" }] },
          {
            apiKey: "k",
            fetch: async () => new Response("nope", { status: 401 }),
          },
        ),
      (error: unknown) =>
        error instanceof DeepSeekError && error.code === "AI_AUTH_ERROR",
    );

    await assert.rejects(
      () =>
        createChatCompletion(
          { messages: [{ role: "user", content: "x" }] },
          {
            apiKey: "k",
            fetch: async () => new Response("slow", { status: 429 }),
          },
        ),
      (error: unknown) =>
        error instanceof DeepSeekError && error.code === "AI_RATE_LIMITED",
    );

    await assert.rejects(
      () =>
        createChatCompletion(
          { messages: [{ role: "user", content: "x" }] },
          {
            apiKey: "k",
            fetch: async () => new Response("boom", { status: 503 }),
          },
        ),
      (error: unknown) =>
        error instanceof DeepSeekError && error.code === "AI_UPSTREAM_ERROR",
    );

    await assert.rejects(
      () =>
        createChatCompletion(
          { messages: [{ role: "user", content: "x" }] },
          {
            apiKey: "k",
            fetch: async () => {
              throw new Error("offline");
            },
          },
        ),
      (error: unknown) =>
        error instanceof DeepSeekError && error.code === "AI_NETWORK_ERROR",
    );
  });

  it("resolves model from env default", () => {
    assert.equal(resolveDeepSeekModel(undefined), DEFAULT_DEEPSEEK_MODEL);
    assert.equal(resolveDeepSeekModel("custom-model"), "custom-model");
  });
});
