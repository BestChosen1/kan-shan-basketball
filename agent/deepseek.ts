import type {
  DeepSeekChatCompletionRequest,
  DeepSeekChatCompletionResponse,
} from "./types.ts";

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
export const DEEPSEEK_CHAT_COMPLETIONS_PATH = "/chat/completions";
export const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
export const DEEPSEEK_API_KEY_ENV = "DEEPSEEK_API_KEY";
export const DEEPSEEK_MODEL_ENV = "DEEPSEEK_MODEL";

export type DeepSeekErrorCode =
  | "AI_AUTH_ERROR"
  | "AI_RATE_LIMITED"
  | "AI_UPSTREAM_ERROR"
  | "AI_NETWORK_ERROR";

export class DeepSeekError extends Error {
  readonly code: DeepSeekErrorCode;
  readonly status?: number;

  constructor(code: DeepSeekErrorCode, message: string, status?: number) {
    super(message);
    this.name = "DeepSeekError";
    this.code = code;
    this.status = status;
  }
}

export interface DeepSeekConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

/**
 * 读取 DeepSeek 运行配置。
 * 不存在 DEEPSEEK_API_KEY 时抛出明确错误；绝不打印 Key。
 */
export function getDeepSeekConfig(
  env: NodeJS.ProcessEnv = process.env,
): DeepSeekConfig {
  const apiKey = env[DEEPSEEK_API_KEY_ENV]?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  return {
    apiKey,
    model: env[DEEPSEEK_MODEL_ENV]?.trim() || DEFAULT_DEEPSEEK_MODEL,
    baseUrl: DEEPSEEK_BASE_URL,
  };
}

export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface CreateChatCompletionOptions {
  apiKey?: string;
  model?: string;
  fetch?: FetchLike;
  baseUrl?: string;
}

export function resolveDeepSeekModel(explicit?: string): string {
  return (
    explicit?.trim() ||
    process.env[DEEPSEEK_MODEL_ENV]?.trim() ||
    DEFAULT_DEEPSEEK_MODEL
  );
}

function mapHttpStatusToError(status: number, bodyText: string): DeepSeekError {
  if (status === 401) {
    return new DeepSeekError("AI_AUTH_ERROR", "DeepSeek authentication failed", status);
  }
  if (status === 429) {
    return new DeepSeekError("AI_RATE_LIMITED", "DeepSeek rate limited", status);
  }
  if (status >= 500) {
    return new DeepSeekError(
      "AI_UPSTREAM_ERROR",
      bodyText || `DeepSeek upstream error (${status})`,
      status,
    );
  }
  return new DeepSeekError(
    "AI_UPSTREAM_ERROR",
    bodyText || `DeepSeek request failed (${status})`,
    status,
  );
}

/**
 * DeepSeek OpenAI-compatible Chat Completions。
 * 使用 Node 原生 fetch；禁止打印 API Key。
 */
export async function createChatCompletion(
  request: Omit<DeepSeekChatCompletionRequest, "model"> & { model?: string },
  options: CreateChatCompletionOptions = {},
): Promise<DeepSeekChatCompletionResponse> {
  const config = options.apiKey?.trim()
    ? {
        apiKey: options.apiKey.trim(),
        model: resolveDeepSeekModel(options.model ?? request.model),
        baseUrl: (options.baseUrl ?? DEEPSEEK_BASE_URL).replace(/\/$/, ""),
      }
    : (() => {
        const resolved = getDeepSeekConfig();
        return {
          apiKey: resolved.apiKey,
          model: resolveDeepSeekModel(options.model ?? request.model ?? resolved.model),
          baseUrl: (options.baseUrl ?? resolved.baseUrl).replace(/\/$/, ""),
        };
      })();

  const fetchImpl = options.fetch ?? fetch;
  const url = `${config.baseUrl}${DEEPSEEK_CHAT_COMPLETIONS_PATH}`;

  const body = JSON.stringify({
    ...request,
    model: config.model,
  });

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DeepSeek network error";
    throw new DeepSeekError("AI_NETWORK_ERROR", message);
  }

  const text = await response.text();
  if (!response.ok) {
    throw mapHttpStatusToError(response.status, text);
  }

  try {
    return JSON.parse(text) as DeepSeekChatCompletionResponse;
  } catch {
    throw new DeepSeekError(
      "AI_UPSTREAM_ERROR",
      "DeepSeek response is not valid JSON",
      response.status,
    );
  }
}

