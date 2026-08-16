export type CareerAgentStage =
  | "NORTH_POLE"
  | "SCHOOL"
  | "CUBA"
  | "CBA"
  | "NBA"
  | "NATIONAL_TEAM"
  | "RETIRED";

export type CareerAgentTrigger =
  | "EVENT_ENTER"
  | "EVENT_RESULT"
  | "STAGE_CHANGE"
  | "CAREER_COMPLETE";

export type ZhihuContextStatus =
  | "NOT_NEEDED"
  | "SUCCESS"
  | "NO_RESULTS"
  | "AUTH_REQUIRED"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export type ZhihuToolErrorCode =
  | "CLI_NOT_CONFIGURED"
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "RATE_LIMITED"
  | "QUOTA_EXHAUSTED"
  | "NETWORK_ERROR"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE"
  | "CLI_ERROR";

export interface CareerAgentPlayerSnapshot {
  name: string;
  age: number;
  team: string;
  overall: number;
  role: string;
}

export interface CareerAgentMatchSnapshot {
  won?: boolean;
  performance?: number;
}

export interface CareerAgentDraftSnapshot {
  league?: string;
  pick?: number;
  teamName?: string;
}

/**
 * Agent 只接收精简上下文，禁止传入完整 PlayerState。
 */
export interface CareerAgentContext {
  stage: CareerAgentStage;
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  player: CareerAgentPlayerSnapshot;
  match?: CareerAgentMatchSnapshot;
  draft?: CareerAgentDraftSnapshot;
  trigger: CareerAgentTrigger;
}

export interface ZhihuSearchItem {
  title: string;
  author: string | null;
  excerpt: string;
  url: string;
}

export interface SearchZhihuInput {
  query: string;
  count?: number;
}

export interface SearchZhihuOutput {
  query: string;
  results: ZhihuSearchItem[];
}

export interface CareerAgentResult {
  shouldSearch: boolean;
  query: string | null;
  zhihu: {
    status: ZhihuContextStatus;
    results: ZhihuSearchItem[];
  };
}

export type CareerAgentOutputStatus =
  | "NOT_NEEDED"
  | "SUCCESS"
  | "NO_RESULTS"
  | "UNAVAILABLE";

export interface CareerAgentSource {
  title: string;
  author: string | null;
  excerpt: string;
  url: string;
}

/** Step 6C LLM Agent 结构化输出（由 Zod 校验）。 */
export interface CareerAgentOutput {
  status: CareerAgentOutputStatus;
  headline: string;
  summary: string;
  query: string | null;
  sources: CareerAgentSource[];
}

export interface CliRunner {
  run(
    file: string,
    args: string[],
  ): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }>;
}

export type DeepSeekRole = "system" | "user" | "assistant" | "tool";

export interface DeepSeekToolCallFunction {
  name: string;
  arguments: string;
}

export interface DeepSeekToolCall {
  id: string;
  type: "function";
  function: DeepSeekToolCallFunction;
}

export interface DeepSeekMessage {
  role: DeepSeekRole;
  content?: string | null;
  tool_calls?: DeepSeekToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface DeepSeekToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface DeepSeekChatCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  tools?: DeepSeekToolDefinition[];
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
  temperature?: number;
}

export interface DeepSeekChatCompletionChoice {
  index?: number;
  finish_reason?: string | null;
  message: DeepSeekMessage;
}

export interface DeepSeekChatCompletionResponse {
  id?: string;
  choices: DeepSeekChatCompletionChoice[];
}
