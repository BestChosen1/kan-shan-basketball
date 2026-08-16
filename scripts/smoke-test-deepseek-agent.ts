/**
 * Real DeepSeek + CareerAgent smoke test.
 * Loads local env files if present; never prints secrets.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CareerAgent } from "../agent/career-agent.ts";
import {
  getDeepSeekConfig,
  resolveDeepSeekModel,
} from "../agent/deepseek.ts";
import type { CareerAgentContext } from "../agent/types.ts";
import { searchZhihuContext } from "../agent/tools/search-zhihu.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Load KEY=VALUE into process.env when unset. Never logs values. */
function loadEnvFile(filePath: string): boolean {
  if (!existsSync(filePath)) {
    return false;
  }

  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }
    if (process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = stripQuotes(line.slice(eq + 1).trim());
  }
  return true;
}

function printSmoke(lines: Record<string, string | number | boolean>): void {
  console.log("[DeepSeek Smoke Test]");
  for (const [key, value] of Object.entries(lines)) {
    console.log(`${key}: ${value}`);
  }
}

function cubaFinalContext(): CareerAgentContext {
  return {
    stage: "CUBA",
    eventId: "cuba-finals",
    eventTitle: "总决赛",
    eventDescription: "CUBA 总决赛关键战",
    trigger: "EVENT_RESULT",
    player: {
      name: "刘看山",
      age: 21,
      team: "CUBA大学球队",
      overall: 74,
      role: "STARTER",
    },
    match: {
      won: true,
      performance: 88,
    },
  };
}

function ensureZhihuCliEnv(): string | null {
  if (process.env.ZHIHU_CLI?.trim()) {
    return process.env.ZHIHU_CLI.trim();
  }

  const home = process.env.HOME?.trim();
  if (!home) {
    return null;
  }

  const candidates = [
    path.join(home, "Library/Application Support/zhihu-cli/current/zhihu-cli"),
    path.join(home, ".local/share/zhihu-cli/current/zhihu-cli"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      process.env.ZHIHU_CLI = candidate;
      return candidate;
    }
  }

  return null;
}

async function main(): Promise<void> {
  const envLocalPath = path.join(ROOT, ".env.local");
  const envPath = path.join(ROOT, ".env");
  loadEnvFile(envLocalPath);
  loadEnvFile(envPath);

  let configured = false;
  let model = resolveDeepSeekModel();

  try {
    const config = getDeepSeekConfig();
    configured = true;
    model = config.model;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DEEPSEEK_API_KEY is not configured";
    printSmoke({
      configured: false,
      model,
      status: "UNAVAILABLE",
      query: "null",
      sources: 0,
    });
    console.error(message);
    process.exitCode = 1;
    return;
  }

  const zhihuCli = ensureZhihuCliEnv();
  if (!zhihuCli) {
    printSmoke({
      configured,
      model,
      status: "UNAVAILABLE",
      query: "null",
      sources: 0,
    });
    console.error("ZHIHU_CLI is not configured");
    process.exitCode = 1;
    return;
  }

  let searchCalls = 0;
  let searchResultCount = 0;
  let searchErrorCode: string | null = null;

  const agent = new CareerAgent({
    searchTool: async (input) => {
      searchCalls += 1;
      try {
        const output = await searchZhihuContext(input);
        searchResultCount = output.results.length;
        return output;
      } catch (error) {
        searchErrorCode =
          error && typeof error === "object" && "code" in error
            ? String((error as { code: string }).code)
            : "CLI_ERROR";
        throw error;
      }
    },
  });

  const result = await agent.run(cubaFinalContext());

  printSmoke({
    configured,
    model,
    status: result.status,
    query: result.query ?? "null",
    sources: result.sources.length,
  });

  // Extra diagnostics for the final report (no secrets / no absolute path dump of credentials).
  console.log(`search_zhihu_calls: ${searchCalls}`);
  console.log(`zhihu_raw_results: ${searchResultCount}`);
  console.log(`zhihu_cli_configured: true`);
  console.log(`env_local_present: ${existsSync(envLocalPath)}`);
  if (searchErrorCode) {
    console.log(`search_error_code: ${searchErrorCode}`);
  }

  if (result.status === "UNAVAILABLE") {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "DeepSeek smoke test failed";
  printSmoke({
    configured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()),
    model: resolveDeepSeekModel(),
    status: "UNAVAILABLE",
    query: "null",
    sources: 0,
  });
  console.error(message);
  process.exitCode = 1;
});
