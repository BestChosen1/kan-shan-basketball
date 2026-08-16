import type {
  CareerAgentClientContext,
  CareerAgentClientOutput,
  CareerAgentClientResult,
  ZhihuCardStatus,
} from "./career-agent-types.ts";

export type { CareerAgentClientContext, CareerAgentClientOutput, ZhihuCardStatus };

export type CareerAgentRequestReason =
  | "MATCH"
  | "DRAFT"
  | "STAGE_CHANGE"
  | "CAREER_COMPLETE";

/**
 * 客户端触发门控：普通 STORY 不请求。
 * 后端 policy 仍会再校验一次。
 */
export function shouldRequestCareerAgent(input: {
  eventKind: string;
  stageChanged: boolean;
  careerComplete: boolean;
}): CareerAgentRequestReason | null {
  if (input.eventKind === "MATCH") {
    return "MATCH";
  }
  if (input.eventKind === "DRAFT") {
    return "DRAFT";
  }
  if (input.careerComplete) {
    return "CAREER_COMPLETE";
  }
  if (input.stageChanged) {
    return "STAGE_CHANGE";
  }
  return null;
}

export function mapCareerAgentOutputToCardStatus(
  result: CareerAgentClientResult,
): ZhihuCardStatus {
  if (!result.ok) {
    return "error";
  }

  if (result.data.status === "NOT_NEEDED") {
    return "idle";
  }

  if (result.data.status === "UNAVAILABLE") {
    return "error";
  }

  if (
    result.data.status === "NO_RESULTS" ||
    result.data.sources.length === 0
  ) {
    return "empty";
  }

  return "success";
}

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

/**
 * Browser → POST /api/career-agent
 * 不读取任何服务端 Secret / CLI 路径。
 */
export async function requestCareerAgent(
  context: CareerAgentClientContext,
  init?: { signal?: AbortSignal },
): Promise<CareerAgentClientResult> {
  if (init?.signal?.aborted) {
    const aborted = new Error("The operation was aborted");
    aborted.name = "AbortError";
    throw aborted;
  }

  let response: Response;
  try {
    response = await fetch("/api/career-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }),
      signal: init?.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Career Agent network error",
      },
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Career Agent returned invalid JSON",
      },
    };
  }

  if (
    body &&
    typeof body === "object" &&
    "ok" in body &&
    (body as { ok: unknown }).ok === true &&
    "data" in body
  ) {
    return {
      ok: true,
      data: (body as { data: CareerAgentClientOutput }).data,
    };
  }

  if (
    body &&
    typeof body === "object" &&
    "ok" in body &&
    (body as { ok: unknown }).ok === false &&
    "error" in body
  ) {
    const error = (body as { error: { code?: string; message?: string } }).error;
    return {
      ok: false,
      error: {
        code: error?.code ?? "AGENT_UNAVAILABLE",
        message: error?.message ?? "Career Agent unavailable",
      },
    };
  }

  return {
    ok: false,
    error: {
      code: "INVALID_RESPONSE",
      message: "Unexpected Career Agent response",
    },
  };
}
