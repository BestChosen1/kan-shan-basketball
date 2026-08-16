import type {
  CareerAgentContext,
  CareerAgentStage,
  CareerAgentTrigger,
} from "./types.ts";

const SEARCHABLE_STAGES: ReadonlySet<CareerAgentStage> = new Set([
  "CUBA",
  "CBA",
  "NBA",
  "NATIONAL_TEAM",
]);

const SEARCHABLE_TRIGGERS: ReadonlySet<CareerAgentTrigger> = new Set([
  "STAGE_CHANGE",
  "CAREER_COMPLETE",
]);

const MAX_QUERY_LENGTH = 96;

function isMatchContext(context: CareerAgentContext): boolean {
  return context.match !== undefined;
}

function isDraftContext(context: CareerAgentContext): boolean {
  return context.draft !== undefined;
}

/**
 * Deterministic policy：普通 STORY 不搜；NORTH_POLE / SCHOOL 不搜；
 * MATCH / DRAFT / STAGE_CHANGE / CAREER_COMPLETE 在允许阶段可搜。
 */
export function shouldSearchZhihu(context: CareerAgentContext): boolean {
  if (!SEARCHABLE_STAGES.has(context.stage)) {
    return false;
  }

  if (SEARCHABLE_TRIGGERS.has(context.trigger)) {
    return true;
  }

  if (isMatchContext(context) || isDraftContext(context)) {
    return true;
  }

  return false;
}

function truncateQuery(query: string): string {
  const normalized = query.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_QUERY_LENGTH) {
    return normalized;
  }
  return normalized.slice(0, MAX_QUERY_LENGTH).trimEnd();
}

export function buildZhihuQuery(context: CareerAgentContext): string | null {
  const title = context.eventTitle.trim();
  if (!title) {
    return null;
  }

  switch (context.stage) {
    case "CUBA":
      return truncateQuery(`CUBA 大学生篮球 ${title}`);
    case "CBA":
      return truncateQuery(`CBA 年轻球员 ${title}`);
    case "NBA":
      return truncateQuery(`NBA 中国球员 ${title}`);
    case "NATIONAL_TEAM":
      return truncateQuery(`中国男篮 国家队 ${title}`);
    default:
      return null;
  }
}
