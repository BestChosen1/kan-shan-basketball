import { NextResponse } from "next/server";

import {
  CareerAgent,
  getDeepSeekConfig,
  getZhihuCliPath,
  searchZhihuContext,
} from "@/agent/server";
import {
  careerAgentApiRequestSchema,
  type CareerAgentApiError,
  type CareerAgentApiSuccess,
} from "@/agent/schemas";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_TIMEOUT_MS = 30_000;

function jsonError(
  status: number,
  code: CareerAgentApiError["error"]["code"],
  message: string,
): NextResponse {
  const body: CareerAgentApiError = {
    ok: false,
    error: { code, message },
  };
  return NextResponse.json(body, { status });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Career Agent timed out"));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Request body must be valid JSON");
  }

  const parsed = careerAgentApiRequestSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "BAD_REQUEST", "Invalid CareerAgentContext");
  }

  try {
    getDeepSeekConfig();
    getZhihuCliPath();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent configuration missing";
    return jsonError(503, "AGENT_UNAVAILABLE", message);
  }

  try {
    const agent = new CareerAgent({
      searchTool: searchZhihuContext,
    });

    const data = await withTimeout(
      agent.run(parsed.data.context),
      API_TIMEOUT_MS,
    );

    if (data.status === "UNAVAILABLE") {
      return jsonError(
        503,
        "AGENT_UNAVAILABLE",
        "Career Agent is temporarily unavailable",
      );
    }

    const body: CareerAgentApiSuccess = {
      ok: true,
      data,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Career Agent failed";

    if (
      message.includes("DEEPSEEK_API_KEY") ||
      message.includes("ZHIHU_CLI") ||
      message.includes("timed out") ||
      message.includes("authentication") ||
      message.includes("rate") ||
      message.includes("network")
    ) {
      return jsonError(503, "AGENT_UNAVAILABLE", "Career Agent is temporarily unavailable");
    }

    return jsonError(500, "INTERNAL_ERROR", "Unexpected Career Agent error");
  }
}
