import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialPlayer } from "../game/engine.ts";
import { pickFallbackTemplate } from "./career-template-fallback.ts";
import {
  buildCareerTemplateProfile,
  buildPlayerCommentQuery,
  buildPlayerSearchQuery,
} from "./career-template-profile.ts";
import { CareerTemplateAgent } from "./career-template-agent.ts";
import type { SearchZhihuOutput } from "./types.ts";

describe("buildCareerTemplateProfile", () => {
  it("marks defense-heavy builds", () => {
    const player = {
      ...createInitialPlayer(),
      defense: 88,
      physical: 80,
      shooting: 55,
      finishing: 52,
      passing: 50,
      basketballIQ: 60,
      mental: 70,
      role: "STARTER" as const,
      careerHistory: [
        {
          eventId: "e",
          stage: "NBA" as const,
          eventTitle: "t",
          choiceId: "nba-rs-two-way",
          choiceText: "攻防两端",
          timestamp: 1,
        },
      ],
    };

    const profile = buildCareerTemplateProfile(player);
    assert.ok(profile.playstyles.includes("DEFENSE"));
    assert.ok(profile.topSkills[0] === "defense" || profile.topSkills[1] === "defense");
    assert.ok(profile.searchHints.some((hint) => hint.includes("防守")));
  });

  it("detects hot-headed temperament from choice ids and flags", () => {
    const player = {
      ...createInitialPlayer(),
      mental: 48,
      flags: ["MEDIA_BACKLASH" as const],
      careerHistory: [
        {
          eventId: "e",
          stage: "SCHOOL" as const,
          eventTitle: "t",
          choiceId: "school-bench-clapback",
          choiceText: "当场呛回去",
          timestamp: 1,
        },
      ],
    };

    const profile = buildCareerTemplateProfile(player);
    assert.ok(profile.temperaments.includes("HOT_HEADED"));
    assert.ok(profile.temperaments.includes("MEDIA_REACTIVE"));
  });

  it("builds bounded search queries", () => {
    const profile = buildCareerTemplateProfile(createInitialPlayer());
    const query = buildPlayerSearchQuery(profile);
    assert.ok(query.length > 0);
    assert.ok(query.length <= 100);
    assert.ok(buildPlayerCommentQuery("科怀·伦纳德").includes("科怀"));
  });
});

describe("pickFallbackTemplate", () => {
  it("prefers matching playstyle and temperament", () => {
    const template = pickFallbackTemplate(
      ["SHOOTING", "SCORING"],
      ["MILD", "TEAM_FIRST"],
    );
    assert.equal(template.name, "斯蒂芬·库里");
  });
});

describe("CareerTemplateAgent", () => {
  it("returns SUCCESS with comments when search + model work", async () => {
    const searchResults: SearchZhihuOutput[] = [
      {
        query: "q1",
        results: [
          {
            title: "伦纳德为什么这么稳",
            author: "球评人",
            excerpt: "攻防一体",
            url: "https://www.zhihu.com/question/1",
          },
        ],
      },
      {
        query: "q2",
        results: [
          {
            title: "如何评价科怀·伦纳德",
            author: "知友",
            excerpt: "冷血杀手",
            url: "https://www.zhihu.com/question/2",
          },
        ],
      },
    ];
    let searchCalls = 0;

    const agent = new CareerTemplateAgent({
      searchTool: async () => {
        const next = searchResults[searchCalls] ?? searchResults[0]!;
        searchCalls += 1;
        return next;
      },
      chatCompletion: async () => ({
        id: "x",
        object: "chat.completion",
        created: 1,
        model: "test",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: JSON.stringify({
                playerName: "科怀·伦纳德",
                league: "NBA",
                teamHint: "快船",
                rationale: "攻防一体且情绪稳定，贴合当前画像。",
              }),
            },
          },
        ],
      }),
    });

    const player = {
      ...createInitialPlayer(),
      defense: 85,
      shooting: 78,
      finishing: 70,
      mental: 80,
      overall: 78,
      role: "STAR" as const,
      nbaSeason: 3,
      careerHistory: [],
      flags: [],
      wins: 10,
      losses: 8,
      careerScore: 400,
      careerTier: "STARTER" as const,
    };

    const output = await agent.run({
      name: player.name,
      age: player.age,
      team: player.team,
      overall: player.overall,
      role: player.role,
      nbaSeason: player.nbaSeason,
      shooting: player.shooting,
      finishing: player.finishing,
      passing: player.passing,
      defense: player.defense,
      physical: player.physical,
      basketballIQ: player.basketballIQ,
      stamina: player.stamina,
      mental: player.mental,
      fame: player.fame,
      wins: player.wins,
      losses: player.losses,
      careerScore: player.careerScore,
      careerTier: player.careerTier,
      flags: player.flags,
      careerHistory: [],
    });

    assert.equal(output.status, "SUCCESS");
    assert.equal(output.playerName, "科怀·伦纳德");
    assert.equal(searchCalls, 2);
    assert.ok(output.comments.length >= 1);
    assert.equal(output.source, "zhihu+model");
  });

  it("falls back when zhihu search fails", async () => {
    const { ZhihuToolError } = await import("./tools/search-zhihu.ts");
    const agent = new CareerTemplateAgent({
      searchTool: async () => {
        throw new ZhihuToolError("CLI_NOT_CONFIGURED", "missing");
      },
      chatCompletion: async () => {
        throw new Error("should not chat");
      },
    });

    const base = createInitialPlayer();
    const output = await agent.run({
      name: base.name,
      age: base.age,
      team: base.team,
      overall: base.overall,
      role: base.role,
      nbaSeason: 0,
      shooting: base.shooting,
      finishing: base.finishing,
      passing: base.passing,
      defense: base.defense,
      physical: base.physical,
      basketballIQ: base.basketballIQ,
      stamina: base.stamina,
      mental: base.mental,
      fame: base.fame,
      wins: 0,
      losses: 0,
      careerScore: 0,
      careerTier: null,
      flags: [],
      careerHistory: [],
    });

    assert.equal(output.status, "FALLBACK");
    assert.equal(output.source, "fallback");
    assert.ok(output.playerName.length > 0);
    assert.equal(output.comments.length, 0);
  });
});
