import { execFile } from "node:child_process";

import type {
  CliRunner,
  SearchZhihuInput,
  SearchZhihuOutput,
  ZhihuSearchItem,
  ZhihuToolErrorCode,
} from "../types.ts";

export const DEFAULT_SEARCH_COUNT = 3;
export const DEFAULT_CLI_TIMEOUT_MS = 15_000;
export const ZHIHU_CLI_ENV = "ZHIHU_CLI";

const MIN_COUNT = 1;
const MAX_COUNT = 10;

export class ZhihuToolError extends Error {
  readonly code: ZhihuToolErrorCode;

  constructor(code: ZhihuToolErrorCode, message: string) {
    super(message);
    this.name = "ZhihuToolError";
    this.code = code;
  }
}

export function clampSearchCount(count: number | undefined): number {
  if (count === undefined || Number.isNaN(count)) {
    return DEFAULT_SEARCH_COUNT;
  }
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.trunc(count)));
}

/**
 * Server / 正式运行配置：必须提供 ZHIHU_CLI 绝对路径。
 * 不读取 ZHIHU_ACCESS_SECRET；不打印路径以外的敏感信息。
 */
export function getZhihuCliPath(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configured = env[ZHIHU_CLI_ENV]?.trim();
  if (!configured) {
    throw new Error("ZHIHU_CLI is not configured");
  }
  if (!configured.startsWith("/")) {
    throw new Error("ZHIHU_CLI must be an absolute path");
  }
  return configured;
}

export function resolveZhihuCliPath(
  env: NodeJS.ProcessEnv = process.env,
): string {
  try {
    return getZhihuCliPath(env);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ZHIHU_CLI is not configured"
    ) {
      throw new ZhihuToolError(
        "CLI_NOT_CONFIGURED",
        `${ZHIHU_CLI_ENV} is not configured`,
      );
    }
    if (error instanceof Error) {
      throw new ZhihuToolError("CLI_ERROR", error.message);
    }
    throw error;
  }
}

export function mapExitCodeToErrorCode(exitCode: number): ZhihuToolErrorCode {
  switch (exitCode) {
    case 2:
      return "CLI_ERROR";
    case 3:
      return "AUTH_REQUIRED";
    case 4:
      return "RATE_LIMITED";
    case 5:
      return "NETWORK_ERROR";
    case 6:
      return "UPSTREAM_ERROR";
    case 7:
      return "CLI_ERROR";
    case 8:
      return "CLI_ERROR";
    default:
      return "CLI_ERROR";
  }
}

function mapCliErrorCode(raw: string | undefined): ZhihuToolErrorCode | null {
  if (!raw) {
    return null;
  }
  switch (raw) {
    case "AUTH_REQUIRED":
      return "AUTH_REQUIRED";
    case "AUTH_INVALID":
      return "AUTH_INVALID";
    case "RATE_LIMITED":
      return "RATE_LIMITED";
    case "QUOTA_EXHAUSTED":
      return "QUOTA_EXHAUSTED";
    case "NETWORK_ERROR":
      return "NETWORK_ERROR";
    case "UPSTREAM_ERROR":
      return "UPSTREAM_ERROR";
    case "INVALID_ARGUMENT":
      return "CLI_ERROR";
    default:
      return null;
  }
}

/**
 * 生产环境 CliRunner：只用 execFile，参数数组传入，不走 shell。
 */
export function createExecFileRunner(
  timeoutMs: number = DEFAULT_CLI_TIMEOUT_MS,
): CliRunner {
  return {
    run(file, args) {
      return new Promise((resolve) => {
        execFile(
          file,
          args,
          {
            timeout: timeoutMs,
            maxBuffer: 10 * 1024 * 1024,
            encoding: "utf8",
          },
          (error, stdout, stderr) => {
            const out = typeof stdout === "string" ? stdout : "";
            const err = typeof stderr === "string" ? stderr : "";

            if (!error) {
              resolve({ exitCode: 0, stdout: out, stderr: err });
              return;
            }

            const code = (error as NodeJS.ErrnoException & { code?: unknown })
              .code;
            if (typeof code === "number") {
              resolve({ exitCode: code, stdout: out, stderr: err });
              return;
            }

            resolve({
              exitCode: 6,
              stdout: out,
              stderr: err || error.message,
            });
          },
        );
      });
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function normalizeItem(raw: unknown): ZhihuSearchItem | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const title = readString(record, "Title") ?? readString(record, "title");
  const url = readString(record, "Url") ?? readString(record, "url");
  const excerpt =
    readString(record, "ContentText") ??
    readString(record, "contentText") ??
    readString(record, "Excerpt") ??
    readString(record, "excerpt") ??
    "";
  const authorRaw =
    readString(record, "AuthorName") ??
    readString(record, "authorName") ??
    readString(record, "Author") ??
    readString(record, "author");

  if (!title || !url) {
    return null;
  }

  return {
    title,
    author: authorRaw && authorRaw.trim() ? authorRaw : null,
    excerpt,
    url,
  };
}

function extractRawItems(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  const data = root.data ?? root.Data;
  const dataRecord = asRecord(data);
  if (dataRecord) {
    const nested =
      dataRecord.Items ??
      dataRecord.items ??
      dataRecord.Results ??
      dataRecord.results;
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  if (Array.isArray(data)) {
    return data;
  }

  const topLevel = root.Items ?? root.items ?? root.Results ?? root.results;
  if (Array.isArray(topLevel)) {
    return topLevel;
  }

  return [];
}

export function parseZhihuSearchStdout(
  stdout: string,
  query: string,
): SearchZhihuOutput {
  let payload: unknown;
  try {
    payload = JSON.parse(stdout);
  } catch {
    throw new ZhihuToolError(
      "INVALID_RESPONSE",
      "zhihu-cli stdout is not valid JSON",
    );
  }

  const root = asRecord(payload);
  if (!root) {
    throw new ZhihuToolError(
      "INVALID_RESPONSE",
      "zhihu-cli stdout JSON must be an object",
    );
  }

  if (root.ok === false) {
    const errorRecord = asRecord(root.error);
    const mapped =
      mapCliErrorCode(readString(errorRecord ?? {}, "code") ?? undefined) ??
      "UPSTREAM_ERROR";
    const message =
      readString(errorRecord ?? {}, "message") ?? "zhihu-cli returned ok:false";
    throw new ZhihuToolError(mapped, message);
  }

  const results = extractRawItems(payload)
    .map(normalizeItem)
    .filter((item): item is ZhihuSearchItem => item !== null);

  return { query, results };
}

export interface SearchZhihuOptions {
  runner?: CliRunner;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

/**
 * 通过绝对路径 zhihu-cli 搜索知乎社区内容。
 * 禁止 shell 拼接；禁止读 Access Secret；禁止直连 HTTP API。
 */
export async function searchZhihuContext(
  input: SearchZhihuInput,
  options: SearchZhihuOptions = {},
): Promise<SearchZhihuOutput> {
  const query = input.query.trim();
  if (!query) {
    throw new ZhihuToolError("CLI_ERROR", "query must not be empty");
  }

  const count = clampSearchCount(input.count);
  const cliPath = resolveZhihuCliPath(options.env ?? process.env);
  const runner =
    options.runner ?? createExecFileRunner(options.timeoutMs ?? DEFAULT_CLI_TIMEOUT_MS);

  const args = [
    "search",
    "zhihu",
    "--query",
    query,
    "--count",
    String(count),
  ];

  const { exitCode, stdout, stderr } = await runner.run(cliPath, args);

  if (exitCode !== 0) {
    const code = mapExitCodeToErrorCode(exitCode);
    throw new ZhihuToolError(
      code,
      stderr.trim() || `zhihu-cli exited with code ${exitCode}`,
    );
  }

  return parseZhihuSearchStdout(stdout, query);
}
