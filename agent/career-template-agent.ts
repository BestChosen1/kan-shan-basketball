import { createChatCompletion, DeepSeekError } from "./deepseek.ts";
import {
  pickFallbackTemplate,
  type FallbackPlayerTemplate,
} from "./career-template-fallback.ts";
import {
  buildCareerTemplateProfile,
  buildPlayerCommentQuery,
  buildPlayerSearchQuery,
  type CareerTemplateProfile,
} from "./career-template-profile.ts";
import { extractJsonObject } from "./career-agent.ts";
import {
  careerTemplateModelPickSchema,
  careerTemplateOutputSchema,
  type CareerTemplateModelPick,
  type CareerTemplateOutput,
  type CareerTemplateApiRequest,
} from "./schemas.ts";
import type {
  DeepSeekChatCompletionRequest,
  DeepSeekChatCompletionResponse,
  DeepSeekMessage,
  SearchZhihuInput,
  SearchZhihuOutput,
} from "./types.ts";
import { ZhihuToolError } from "./tools/search-zhihu.ts";
import type { CareerFlag, CareerStage, PlayerState } from "../game/types.ts";

export type SearchZhihuTool = (
  input: SearchZhihuInput,
) => Promise<SearchZhihuOutput>;

export type ChatCompletionFn = (
  request: Omit<DeepSeekChatCompletionRequest, "model"> & { model?: string },
) => Promise<DeepSeekChatCompletionResponse>;

export interface CareerTemplateAgentOptions {
  searchTool: SearchZhihuTool;
  chatCompletion?: ChatCompletionFn;
  apiKey?: string;
  model?: string;
}

const SYSTEM_PROMPT = `你是“看山篮球生涯模拟器”的 Career Template Agent。

任务：根据玩家最终属性分布与生涯选择画像，从知乎搜索结果中挑选最贴近的真实篮球运动员作为「生涯模版」。
优先 NBA 球员，其次其他联赛。

规则：
- 不得修改任何游戏数值或生涯结果
- 不得编造知乎链接；球员姓名必须能从搜索结果或常识篮球名人中合理对应
- 只输出 JSON：playerName, league(NBA|CBA|OTHER), teamHint, rationale(<=160字)
- 不要输出 Markdown 解释`;

function toPlayerState(
  input: CareerTemplateApiRequest["player"],
): PlayerState {
  return {
    name: input.name,
    age: input.age,
    stage: "RETIRED",
    overall: input.overall,
    shooting: input.shooting,
    finishing: input.finishing,
    passing: input.passing,
    defense: input.defense,
    physical: input.physical,
    basketballIQ: input.basketballIQ,
    stamina: input.stamina,
    potential: 50,
    mental: input.mental,
    fame: input.fame,
    zhihuReputation: 0,
    money: 0,
    team: input.team,
    trophies: [],
    awards: [],
    careerHistory: input.careerHistory.map((entry) => ({
      eventId: entry.eventId,
      stage: entry.stage as CareerStage,
      eventTitle: entry.eventTitle,
      choiceId: entry.choiceId,
      choiceText: entry.choiceText,
      timestamp: 0,
    })),
    currentEventId: null,
    isGameOver: true,
    wins: input.wins,
    losses: input.losses,
    matchHistory: [],
    draftHistory: [],
    contracts: [],
    draftStock: 0,
    role: input.role as PlayerState["role"],
    lastOutcome: null,
    careerScore: input.careerScore,
    careerTier: input.careerTier as PlayerState["careerTier"],
    flags: input.flags as CareerFlag[],
    nbaSeason: input.nbaSeason,
  };
}

function fallbackOutput(
  profile: CareerTemplateProfile,
  template: FallbackPlayerTemplate,
  status: "FALLBACK" | "UNAVAILABLE" = "FALLBACK",
): CareerTemplateOutput {
  return careerTemplateOutputSchema.parse({
    status,
    playerName: template.name,
    league: template.league,
    teamHint: template.teamHint,
    rationale: template.rationale,
    profileSummary: profile.summary,
    playstyles: profile.playstyles,
    temperaments: profile.temperaments,
    searchQuery: null,
    commentQuery: null,
    comments: [],
    source: "fallback",
  });
}

function parseModelPick(content: string | null | undefined): CareerTemplateModelPick {
  if (!content?.trim()) {
    throw new Error("empty model content");
  }
  const raw = extractJsonObject(content);
  return careerTemplateModelPickSchema.parse(raw);
}

/**
 * 生涯模版 Agent：
 * 1) 画像分析（本地）
 * 2) 知乎搜索球员风格
 * 3) DeepSeek 挑选模版球员
 * 4) 再搜该球员相关知乎评论
 * 全程失败则 fallback，不阻断结算页。
 */
export class CareerTemplateAgent {
  private readonly searchTool: SearchZhihuTool;
  private readonly chatCompletion: ChatCompletionFn;

  constructor(options: CareerTemplateAgentOptions) {
    this.searchTool = options.searchTool;
    this.chatCompletion =
      options.chatCompletion ??
      ((request) =>
        createChatCompletion(request, {
          apiKey: options.apiKey,
          model: options.model,
        }));
  }

  async run(
    input: CareerTemplateApiRequest["player"],
  ): Promise<CareerTemplateOutput> {
    const player = toPlayerState(input);
    const profile = buildCareerTemplateProfile(player);
    const fallback = pickFallbackTemplate(
      profile.playstyles,
      profile.temperaments,
    );

    const searchQuery = buildPlayerSearchQuery(profile);
    let search: SearchZhihuOutput | null = null;

    try {
      search = await this.searchTool({ query: searchQuery, count: 3 });
    } catch (error) {
      if (!(error instanceof ZhihuToolError)) {
        return fallbackOutput(profile, fallback, "FALLBACK");
      }
      return fallbackOutput(profile, fallback, "FALLBACK");
    }

    let pick: CareerTemplateModelPick;
    try {
      pick = await this.pickPlayer(profile, search);
    } catch {
      pick = {
        playerName: fallback.name,
        league: fallback.league,
        teamHint: fallback.teamHint,
        rationale: fallback.rationale,
      };
      if (!search.results.length) {
        return fallbackOutput(profile, fallback, "FALLBACK");
      }
    }

    const commentQuery = buildPlayerCommentQuery(pick.playerName);
    let comments: CareerTemplateOutput["comments"] = [];
    try {
      const commentSearch = await this.searchTool({
        query: commentQuery,
        count: 3,
      });
      comments = commentSearch.results.slice(0, 3).map((item) => ({
        title: item.title,
        author: item.author,
        excerpt: item.excerpt.slice(0, 160),
        url: item.url,
      }));
    } catch {
      comments = [];
    }

    return careerTemplateOutputSchema.parse({
      status: "SUCCESS",
      playerName: pick.playerName,
      league: pick.league,
      teamHint: pick.teamHint || fallback.teamHint,
      rationale: pick.rationale,
      profileSummary: profile.summary,
      playstyles: profile.playstyles,
      temperaments: profile.temperaments,
      searchQuery,
      commentQuery,
      comments,
      source: comments.length > 0 ? "zhihu+model" : "zhihu",
    });
  }

  private async pickPlayer(
    profile: CareerTemplateProfile,
    search: SearchZhihuOutput,
  ): Promise<CareerTemplateModelPick> {
    const messages: DeepSeekMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify(
          {
            profile,
            zhihuResults: search.results,
            instructions:
              "根据 profile 与 zhihuResults 选择最匹配的球员模版，输出 JSON。",
          },
          null,
          2,
        ),
      },
    ];

    try {
      const response = await this.chatCompletion({
        messages,
        tool_choice: "none",
        temperature: 0.3,
      });
      const content = response.choices[0]?.message?.content;
      return parseModelPick(content);
    } catch (error) {
      if (error instanceof DeepSeekError) {
        throw error;
      }
      throw error;
    }
  }
}
