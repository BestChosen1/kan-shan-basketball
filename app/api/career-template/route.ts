import { NextResponse } from "next/server";

import {
  CareerTemplateAgent,
  searchZhihuContext,
} from "@/agent/server";
import {
  careerTemplateApiRequestSchema,
  type CareerTemplateApiError,
  type CareerTemplateApiSuccess,
} from "@/agent/schemas";

export const runtime = "nodejs";
export const maxDuration = 45;

const API_TIMEOUT_MS = 45_000;

function jsonError(
  status: number,
  code: CareerTemplateApiError["error"]["code"],
  message: string,
): NextResponse {
  const body: CareerTemplateApiError = {
    ok: false,
    error: { code, message },
  };
  return NextResponse.json(body, { status });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Career Template Agent timed out"));
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

  const parsed = careerTemplateApiRequestSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "BAD_REQUEST", "Invalid career template player payload");
  }

  try {
    const agent = new CareerTemplateAgent({
      searchTool: searchZhihuContext,
    });

    const data = await withTimeout(agent.run(parsed.data.player), API_TIMEOUT_MS);

    const body: CareerTemplateApiSuccess = {
      ok: true,
      data,
    };
    return NextResponse.json(body, { status: 200 });
  } catch {
    return jsonError(
      503,
      "AGENT_UNAVAILABLE",
      "Career Template Agent is temporarily unavailable",
    );
  }
}
