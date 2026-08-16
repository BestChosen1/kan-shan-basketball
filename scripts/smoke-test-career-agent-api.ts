/**
 * HTTP smoke test for POST /api/career-agent.
 * Does not import CareerAgent — verifies full Next.js server chain.
 */
const BASE_URL = process.env.CAREER_AGENT_API_BASE ?? "http://localhost:3000";

type ApiBody = {
  ok?: boolean;
  data?: {
    status?: string;
    query?: string | null;
    sources?: unknown[];
  };
  error?: {
    code?: string;
    message?: string;
  };
};

function printResult(
  label: string,
  httpStatus: number,
  body: ApiBody,
): void {
  console.log(`[Career Agent API Smoke] ${label}`);
  console.log(`HTTP: ${httpStatus}`);
  console.log(`status: ${body.data?.status ?? body.error?.code ?? "unknown"}`);
  console.log(`query: ${body.data?.query ?? "null"}`);
  console.log(`sources: ${Array.isArray(body.data?.sources) ? body.data.sources.length : 0}`);
  if (body.error?.message) {
    console.log(`message: ${body.error.message}`);
  }
}

async function postContext(context: unknown): Promise<{
  httpStatus: number;
  body: ApiBody;
}> {
  const response = await fetch(`${BASE_URL}/api/career-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ context }),
  });

  let body: ApiBody = {};
  try {
    body = (await response.json()) as ApiBody;
  } catch {
    body = { ok: false, error: { code: "INVALID_JSON", message: "non-json response" } };
  }

  return { httpStatus: response.status, body };
}

async function main(): Promise<void> {
  // 1) CUBA FINAL — expect SUCCESS / NO_RESULTS (or UNAVAILABLE if deps down)
  const cuba = await postContext({
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
  });
  printResult("CUBA FINAL", cuba.httpStatus, cuba.body);

  // 2) STORY gate — expect NOT_NEEDED
  const story = await postContext({
    stage: "CBA",
    eventId: "cba-first-pro-training",
    eventTitle: "第一次职业训练",
    eventDescription: "看山迎来第一次职业队训练",
    trigger: "EVENT_ENTER",
    player: {
      name: "刘看山",
      age: 22,
      team: "CBA职业球队",
      overall: 76,
      role: "ROTATION",
    },
  });
  printResult("CBA STORY", story.httpStatus, story.body);

  const cubaOk =
    cuba.httpStatus === 200 &&
    cuba.body.ok === true &&
    (cuba.body.data?.status === "SUCCESS" ||
      cuba.body.data?.status === "NO_RESULTS");

  const storyOk =
    story.httpStatus === 200 &&
    story.body.ok === true &&
    story.body.data?.status === "NOT_NEEDED";

  if (!storyOk) {
    console.error("Policy gate failed: expected NOT_NEEDED for STORY context");
    process.exitCode = 1;
    return;
  }

  if (!cubaOk) {
    console.error("CUBA FINAL path did not return SUCCESS/NO_RESULTS");
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Career Agent API smoke failed";
  console.error(message);
  process.exitCode = 1;
});
