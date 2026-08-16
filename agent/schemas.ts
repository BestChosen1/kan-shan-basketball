import { z } from "zod";

export const searchZhihuArgsSchema = z.object({
  query: z.string().min(1).max(100),
  count: z.number().int().min(1).max(3).optional(),
});

export type SearchZhihuArgs = z.infer<typeof searchZhihuArgsSchema>;

export const careerAgentSourceSchema = z.object({
  title: z.string(),
  author: z.string().nullable(),
  excerpt: z.string(),
  url: z.string().url(),
});

export const careerAgentOutputSchema = z.object({
  status: z.enum(["NOT_NEEDED", "SUCCESS", "NO_RESULTS", "UNAVAILABLE"]),
  headline: z.string().max(30),
  summary: z.string().max(100),
  query: z.string().nullable(),
  sources: z.array(careerAgentSourceSchema).max(3),
});

export type CareerAgentOutput = z.infer<typeof careerAgentOutputSchema>;

/** 精简玩家快照；strict 拒绝完整 PlayerState 字段。 */
export const careerAgentPlayerSchema = z
  .object({
    name: z.string().min(1),
    age: z.number().int().min(0).max(120),
    team: z.string(),
    overall: z.number(),
    role: z.string(),
  })
  .strict();

export const careerAgentMatchSchema = z
  .object({
    won: z.boolean().optional(),
    performance: z.number().optional(),
  })
  .strict();

export const careerAgentDraftSchema = z
  .object({
    league: z.string().optional(),
    pick: z.number().optional(),
    teamName: z.string().optional(),
  })
  .strict();

export const careerAgentContextSchema = z
  .object({
    stage: z.enum([
      "NORTH_POLE",
      "SCHOOL",
      "CUBA",
      "CBA",
      "NBA",
      "NATIONAL_TEAM",
      "RETIRED",
    ]),
    eventId: z.string().min(1),
    eventTitle: z.string().min(1),
    eventDescription: z.string(),
    player: careerAgentPlayerSchema,
    match: careerAgentMatchSchema.optional(),
    draft: careerAgentDraftSchema.optional(),
    trigger: z.enum([
      "EVENT_ENTER",
      "EVENT_RESULT",
      "STAGE_CHANGE",
      "CAREER_COMPLETE",
    ]),
  })
  .strict();

export const careerAgentApiRequestSchema = z
  .object({
    context: careerAgentContextSchema,
  })
  .strict();

export type CareerAgentApiRequest = z.infer<typeof careerAgentApiRequestSchema>;

export const careerAgentApiErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "AGENT_UNAVAILABLE",
  "INTERNAL_ERROR",
]);

export const careerAgentApiSuccessSchema = z.object({
  ok: z.literal(true),
  data: careerAgentOutputSchema,
});

export const careerAgentApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: careerAgentApiErrorCodeSchema,
    message: z.string(),
  }),
});

export type CareerAgentApiSuccess = z.infer<typeof careerAgentApiSuccessSchema>;
export type CareerAgentApiError = z.infer<typeof careerAgentApiErrorSchema>;

export const SEARCH_ZHIHU_TOOL_NAME = "search_zhihu" as const;

/** OpenAI-compatible tool definition for DeepSeek. */
export const SEARCH_ZHIHU_TOOL = {
  type: "function" as const,
  function: {
    name: SEARCH_ZHIHU_TOOL_NAME,
    description:
      "搜索知乎公开内容，获取与当前篮球生涯事件相关的真实社区讨论、标题、作者摘要与链接。仅用于现实社区背景，不能修改游戏数值或决定胜负。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: {
          type: "string",
          minLength: 1,
          maxLength: 100,
          description: "知乎搜索关键词",
        },
        count: {
          type: "integer",
          minimum: 1,
          maximum: 3,
          description: "返回条数，默认由调用方决定，最多 3",
        },
      },
      required: ["query"],
    },
  },
};
