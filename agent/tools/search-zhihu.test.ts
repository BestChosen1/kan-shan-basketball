import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CliRunner } from "../types.ts";
import {
  clampSearchCount,
  createExecFileRunner,
  mapExitCodeToErrorCode,
  searchZhihuContext,
  ZhihuToolError,
} from "./search-zhihu.ts";

function fakeRunner(
  response: {
    exitCode: number;
    stdout?: string;
    stderr?: string;
  },
  calls: Array<{ file: string; args: string[] }>,
): CliRunner {
  return {
    async run(file, args) {
      calls.push({ file, args: [...args] });
      return {
        exitCode: response.exitCode,
        stdout: response.stdout ?? "",
        stderr: response.stderr ?? "",
      };
    },
  };
}

const sampleItem = {
  Title: "CUBA 观赛笔记",
  AuthorName: "篮筐观察者",
  ContentText: "大学生联赛越来越职业化。",
  Url: "https://www.zhihu.com/question/1",
};

describe("searchZhihuContext", () => {
  it("正确调用 CLI 参数", async () => {
    const calls: Array<{ file: string; args: string[] }> = [];
    await searchZhihuContext(
      { query: "CUBA 大学生篮球", count: 2 },
      {
        env: { ZHIHU_CLI: "/abs/path/zhihu-cli" },
        runner: fakeRunner(
          {
            exitCode: 0,
            stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
          },
          calls,
        ),
      },
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.file, "/abs/path/zhihu-cli");
    assert.deepEqual(calls[0]?.args, [
      "search",
      "zhihu",
      "--query",
      "CUBA 大学生篮球",
      "--count",
      "2",
    ]);
  });

  it("count 默认 3", async () => {
    const calls: Array<{ file: string; args: string[] }> = [];
    await searchZhihuContext(
      { query: "CBA" },
      {
        env: { ZHIHU_CLI: "/abs/path/zhihu-cli" },
        runner: fakeRunner(
          { exitCode: 0, stdout: JSON.stringify({ ok: true, data: { Items: [] } }) },
          calls,
        ),
      },
    );
    assert.equal(calls[0]?.args[5], "3");
  });

  it("count clamp 1-10", () => {
    assert.equal(clampSearchCount(0), 1);
    assert.equal(clampSearchCount(1), 1);
    assert.equal(clampSearchCount(10), 10);
    assert.equal(clampSearchCount(99), 10);
    assert.equal(clampSearchCount(undefined), 3);
  });

  it("正确解析 JSON", async () => {
    const output = await searchZhihuContext(
      { query: "NBA" },
      {
        env: { ZHIHU_CLI: "/abs/path/zhihu-cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
        }, []),
      },
    );
    assert.equal(output.results.length, 1);
  });

  it("正确映射 Title", async () => {
    const output = await searchZhihuContext(
      { query: "NBA" },
      {
        env: { ZHIHU_CLI: "/cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
        }, []),
      },
    );
    assert.equal(output.results[0]?.title, "CUBA 观赛笔记");
  });

  it("正确映射 AuthorName", async () => {
    const output = await searchZhihuContext(
      { query: "NBA" },
      {
        env: { ZHIHU_CLI: "/cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
        }, []),
      },
    );
    assert.equal(output.results[0]?.author, "篮筐观察者");
  });

  it("正确映射 ContentText", async () => {
    const output = await searchZhihuContext(
      { query: "NBA" },
      {
        env: { ZHIHU_CLI: "/cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
        }, []),
      },
    );
    assert.equal(output.results[0]?.excerpt, "大学生联赛越来越职业化。");
  });

  it("正确映射 Url", async () => {
    const output = await searchZhihuContext(
      { query: "NBA" },
      {
        env: { ZHIHU_CLI: "/cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
        }, []),
      },
    );
    assert.equal(output.results[0]?.url, "https://www.zhihu.com/question/1");
  });

  it("空结果", async () => {
    const output = await searchZhihuContext(
      { query: "冷门关键词" },
      {
        env: { ZHIHU_CLI: "/cli" },
        runner: fakeRunner({
          exitCode: 0,
          stdout: JSON.stringify({ ok: true, data: { Items: [] } }),
        }, []),
      },
    );
    assert.deepEqual(output, { query: "冷门关键词", results: [] });
  });

  it("exit code 3 -> AUTH_REQUIRED", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: { ZHIHU_CLI: "/cli" },
            runner: fakeRunner({ exitCode: 3, stderr: "auth" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "AUTH_REQUIRED",
    );
  });

  it("exit code 4 -> RATE_LIMITED", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: { ZHIHU_CLI: "/cli" },
            runner: fakeRunner({ exitCode: 4, stderr: "rate" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "RATE_LIMITED",
    );
  });

  it("exit code 5 -> NETWORK_ERROR", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: { ZHIHU_CLI: "/cli" },
            runner: fakeRunner({ exitCode: 5, stderr: "net" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "NETWORK_ERROR",
    );
  });

  it("exit code 6 -> UPSTREAM_ERROR", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: { ZHIHU_CLI: "/cli" },
            runner: fakeRunner({ exitCode: 6, stderr: "up" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "UPSTREAM_ERROR",
    );
  });

  it("exit code 7 -> keychain error", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: { ZHIHU_CLI: "/cli" },
            runner: fakeRunner({ exitCode: 7, stderr: "keychain" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "CLI_ERROR",
    );
    assert.equal(mapExitCodeToErrorCode(7), "CLI_ERROR");
  });

  it("CLI path 未配置", async () => {
    await assert.rejects(
      () =>
        searchZhihuContext(
          { query: "q" },
          {
            env: {},
            runner: fakeRunner({ exitCode: 0, stdout: "{}" }, []),
          },
        ),
      (error: unknown) =>
        error instanceof ZhihuToolError && error.code === "CLI_NOT_CONFIGURED",
    );
  });

  it("CLI runner 不使用 shell", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(new URL("./search-zhihu.ts", import.meta.url), "utf8");
    assert.match(source, /from "node:child_process"/);
    assert.match(source, /execFile\(/);
    assert.doesNotMatch(source, /\bexec\(/);
    assert.doesNotMatch(source, /bash -c|sh -c|shell:\s*true/);
    const runner = createExecFileRunner();
    assert.equal(typeof runner.run, "function");
    assert.equal(runner.run.length, 2);
  });

  it("不修改任何输入对象", async () => {
    const input = Object.freeze({ query: "CUBA", count: 3 });
    const env = Object.freeze({ ZHIHU_CLI: "/cli" });
    await searchZhihuContext(input, {
      env,
      runner: fakeRunner({
        exitCode: 0,
        stdout: JSON.stringify({ ok: true, data: { Items: [sampleItem] } }),
      }, []),
    });
    assert.equal(input.query, "CUBA");
    assert.equal(input.count, 3);
    assert.equal(env.ZHIHU_CLI, "/cli");
  });
});
