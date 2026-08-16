import { createChatCompletion, DeepSeekError } from "./deepseek.ts";
import { buildZhihuQuery, shouldSearchZhihu } from "./policy.ts";
import {
  careerAgentOutputSchema,
  SEARCH_ZHIHU_TOOL,
  SEARCH_ZHIHU_TOOL_NAME,
  searchZhihuArgsSchema,
  type CareerAgentOutput,
} from "./schemas.ts";
import type {
  CareerAgentContext,
  DeepSeekChatCompletionRequest,
  DeepSeekChatCompletionResponse,
  DeepSeekMessage,
  DeepSeekToolCall,
  SearchZhihuInput,
  SearchZhihuOutput,
} from "./types.ts";
import { ZhihuToolError } from "./tools/search-zhihu.ts";

export type SearchZhihuTool = (
  input: SearchZhihuInput,
) => Promise<SearchZhihuOutput>;

export type ChatCompletionFn = (
  request: Omit<DeepSeekChatCompletionRequest, "model"> & { model?: string },
) => Promise<DeepSeekChatCompletionResponse>;

export interface CareerAgentOptions {
  searchTool: SearchZhihuTool;
  chatCompletion?: ChatCompletionFn;
  apiKey?: string;
  model?: string;
}

export const CAREER_AGENT_SYSTEM_PROMPT = `你是“看山篮球生涯模拟器”的 Career Agent。

职责：
- 理解当前篮球生涯事件
- 判断是否需要知乎社区背景
- 必要时调用 search_zhihu
- 使用真实知乎结果生成简短赛事实景/社区背景

Game Engine 是唯一游戏事实来源。

你绝不能：
- 修改 PlayerState
- 决定比赛胜负
- 决定比赛表现
- 决定选秀
- 决定合同
- 决定奖杯
- 决定 Award
- 决定 Career Score

知乎内容只是现实社区背景。
搜索最多调用一次。
不要编造知乎标题、作者、链接或观点。

最终必须只输出一个 JSON 对象，字段为：
status: NOT_NEEDED | SUCCESS | NO_RESULTS | UNAVAILABLE
headline: 不超过 30 字
summary: 不超过 100 字
query: string | null
sources: 最多 3 条，每条含 title、author、excerpt、url
不要输出 Markdown 代码块以外的解释文字；优先直接输出 JSON。`;

function notNeededOutput(): CareerAgentOutput {
  return {
    status: "NOT_NEEDED",
    headline: "",
    summary: "",
    query: null,
    sources: [],
  };
}

function unavailableOutput(query: string | null = null): CareerAgentOutput {
  return {
    status: "UNAVAILABLE",
    headline: "社区背景暂不可用",
    summary: "暂时无法获取知乎社区背景，不影响生涯推进。",
    query,
    sources: [],
  };
}

function buildUserMessage(context: CareerAgentContext): string {
  const suggested = buildZhihuQuery(context);
  return JSON.stringify(
    {
      stage: context.stage,
      eventId: context.eventId,
      eventTitle: context.eventTitle,
      eventDescription: context.eventDescription,
      trigger: context.trigger,
      player: context.player,
      match: context.match ?? null,
      draft: context.draft ?? null,
      suggestedQuery: suggested,
      instructions:
        "如需现实社区背景，可调用 search_zhihu（最多一次）。完成后输出 CareerAgentOutput JSON。",
    },
    null,
    2,
  );
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

export function parseCareerAgentOutput(content: string | null | undefined): CareerAgentOutput {
  if (!content?.trim()) {
    throw new Error("empty model content");
  }
  const raw = extractJsonObject(content);
  return careerAgentOutputSchema.parse(raw);
}

function getAssistantMessage(
  response: DeepSeekChatCompletionResponse,
): DeepSeekMessage {
  const message = response.choices[0]?.message;
  if (!message) {
    throw new DeepSeekError("AI_UPSTREAM_ERROR", "DeepSeek response missing message");
  }
  return message;
}

/**
 * KanShan Career Agent（DeepSeek Tool Calling）。
 * 最多 2 次 DeepSeek 请求、最多 1 次知乎搜索；禁止递归；不修改游戏状态。
 */
export class CareerAgent {
  private readonly searchTool: SearchZhihuTool;
  private readonly chatCompletion: ChatCompletionFn;

  constructor(options: CareerAgentOptions) {
    this.searchTool = options.searchTool;
    this.chatCompletion =
      options.chatCompletion ??
      ((request) =>
        createChatCompletion(request, {
          apiKey: options.apiKey,
          model: options.model,
        }));
  }

  /** Step 6B 兼容：仅注入 searchTool。 */
  static fromSearchTool(searchTool: SearchZhihuTool): CareerAgent {
    return new CareerAgent({ searchTool });
  }

  async run(context: CareerAgentContext): Promise<CareerAgentOutput> {
    if (!shouldSearchZhihu(context)) {
      return notNeededOutput();
    }

    const suggestedQuery = buildZhihuQuery(context);
    const messages: DeepSeekMessage[] = [
      { role: "system", content: CAREER_AGENT_SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(context) },
    ];

    try {
      const first = await this.chatCompletion({
        messages,
        tools: [SEARCH_ZHIHU_TOOL],
        tool_choice: "auto",
        temperature: 0.2,
      });

      const firstMessage = getAssistantMessage(first);
      const toolCalls = firstMessage.tool_calls ?? [];

      if (toolCalls.length === 0) {
        return parseCareerAgentOutput(firstMessage.content);
      }

      if (toolCalls.length > 1) {
        return unavailableOutput(suggestedQuery);
      }

      const toolCall = toolCalls[0];
      if (!toolCall || toolCall.function.name !== SEARCH_ZHIHU_TOOL_NAME) {
        return unavailableOutput(suggestedQuery);
      }

      const toolResult = await this.executeSearchTool(toolCall);
      if (toolResult.kind === "error") {
        return unavailableOutput(toolResult.query ?? suggestedQuery);
      }

      messages.push({
        role: "assistant",
        content: firstMessage.content ?? null,
        tool_calls: [toolCall],
      });
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult.output),
      });

      const second = await this.chatCompletion({
        messages,
        tool_choice: "none",
        temperature: 0.2,
      });

      const secondMessage = getAssistantMessage(second);
      if ((secondMessage.tool_calls?.length ?? 0) > 0) {
        return unavailableOutput(toolResult.output.query);
      }

      return parseCareerAgentOutput(secondMessage.content);
    } catch (error) {
      if (error instanceof DeepSeekError) {
        return unavailableOutput(suggestedQuery);
      }
      return unavailableOutput(suggestedQuery);
    }
  }

  private async executeSearchTool(
    toolCall: DeepSeekToolCall,
  ): Promise<
    | { kind: "ok"; output: SearchZhihuOutput }
    | { kind: "error"; query: string | null }
  > {
    let parsedArgs: unknown;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch {
      return { kind: "error", query: null };
    }

    const argsResult = searchZhihuArgsSchema.safeParse(parsedArgs);
    if (!argsResult.success) {
      return { kind: "error", query: null };
    }

    try {
      const output = await this.searchTool({
        query: argsResult.data.query,
        count: argsResult.data.count,
      });
      return { kind: "ok", output };
    } catch (error) {
      if (error instanceof ZhihuToolError) {
        return { kind: "error", query: argsResult.data.query };
      }
      return { kind: "error", query: argsResult.data.query };
    }
  }
}
