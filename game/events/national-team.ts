import type { Choice, GameEvent } from "../types.ts";

function C(
  id: string,
  text: string,
  bag: Choice["effects"] &
    Pick<
      Partial<Choice>,
      "intent" | "nextEventId" | "nextStage" | "setFlags" | "clearFlags"
    > = {},
  extra: Partial<Choice> = {},
): Choice {
  const merged = { ...bag, ...extra };
  const effects: Choice["effects"] = {};
  for (const [key, value] of Object.entries(merged)) {
    if (
      key === "intent" ||
      key === "nextEventId" ||
      key === "nextStage" ||
      key === "setFlags" ||
      key === "clearFlags" ||
      key === "id" ||
      key === "text" ||
      key === "effects" ||
      value === undefined
    ) {
      continue;
    }
    (effects as Record<string, number>)[key] = value as number;
  }
  return {
    id,
    text,
    effects,
    intent: merged.intent,
    nextEventId: merged.nextEventId,
    nextStage: merged.nextStage,
    setFlags: merged.setFlags,
    clearFlags: merged.clearFlags,
  };
}

/** 国家队：征召后打完仍回到 NBA 休赛期，退役仅由玩家在休赛期选择 */
export const NATIONAL_TEAM_EVENTS: GameEvent[] = [
  {
    id: "nt-camp",
    stage: "NATIONAL_TEAM",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NT_CALLED"],
    nextEventId: "nt-role-battle",
    title: "国家队集训",
    description:
      "红衣入营。位置竞争激烈，战术用语与俱乐部不同，荣誉感与压力同时拉满。",
    kanShanDialogue: "这身队服，比任何合同都重。",
    choices: [
      C("nt-camp-role", "快速吃透国家队战术角色", {
        basketballIQ: 3,
        passing: 2,
        mental: 2,
      }),
      C("nt-camp-condition", "把身体状态调到巅峰", {
        stamina: 4,
        physical: 2,
        defense: 1,
      }),
      C("nt-camp-shooting", "加练国际赛场空间投射", {
        shooting: 3,
        finishing: 1,
        stamina: -2,
        fame: 1,
      }),
    ],
  },
  {
    id: "nt-role-battle",
    stage: "NATIONAL_TEAM",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NT_CALLED"],
    nextEventId: "nt-asia",
    title: "主力争夺",
    description:
      "同一位置还有归化球员与老国手。教练让你打一场队内教学赛定轮换。",
    kanShanDialogue: "队内红，也是红。",
    choices: [
      C("nt-role-aggressive", "队内赛全力表现", {
        finishing: 2,
        fame: 2,
        mental: 1,
        stamina: -3,
      }),
      C("nt-role-team", "主动给老将喂球", {
        passing: 3,
        mental: 2,
        zhihuReputation: 2,
      }),
      C("nt-role-clash", "与队友发生冲突", {
        fame: 1,
        mental: -4,
        zhihuReputation: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "nt-asia",
    stage: "NATIONAL_TEAM",
    visualType: "DEFENSE",
    eventKind: "MATCH",
    requiresFlags: ["NT_CALLED"],
    matchConfig: { opponentStrength: 72, stakes: "FINAL" },
    nextEventId: "nt-between",
    title: "亚洲赛场",
    description:
      "亚洲赛场节奏更快、身体接触更多。你需要在国家队体系里证明自己配得上球衣。",
    kanShanDialogue: "代表的不只是自己，是身后那片冰原和整个国家。",
    choices: [
      C(
        "nt-asia-score",
        "成为稳定得分点",
        { shooting: 2, finishing: 2, fame: 4, zhihuReputation: 3 },
        { intent: "SCORE" },
      ),
      C(
        "nt-asia-lock",
        "盯防对方核心",
        { defense: 4, physical: 1, fame: 3, stamina: -3 },
        { intent: "DEFEND" },
      ),
      C(
        "nt-asia-lead",
        "场上指挥与情绪稳定器",
        { basketballIQ: 2, mental: 4, passing: 1, zhihuReputation: 4 },
        { intent: "TEAM" },
      ),
    ],
  },
  {
    id: "nt-between",
    stage: "NATIONAL_TEAM",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NT_CALLED"],
    nextEventId: "nt-world-final",
    title: "决赛前夜",
    description:
      "有人传你状态下滑，有人说你该让位。你关上门，只剩自己和一颗球。",
    kanShanDialogue: "流言很吵，心跳更响。",
    choices: [
      C("nt-between-focus", "提前结束采访，早睡", {
        mental: 3,
        stamina: 3,
      }),
      C("nt-between-extra", "加练到深夜", {
        shooting: 2,
        stamina: -4,
        mental: 1,
      }),
      C("nt-between-scroll", "刷评论到凌晨", {
        mental: -4,
        fame: -1,
        stamina: -2,
      }),
    ],
  },
  {
    id: "nt-world-final",
    stage: "NATIONAL_TEAM",
    visualType: "CHAMPION",
    eventKind: "MATCH",
    requiresFlags: ["NT_CALLED"],
    matchConfig: { opponentStrength: 82, stakes: "FINAL" },
    title: "国际大赛决赛",
    description:
      "国际大赛决赛夜。哨响之前，你回想起北极的第一下运球——然后走向中圈。结束后，你仍将回到俱乐部休赛期做自己的选择。",
    kanShanDialogue: "无论结局如何，这球，我打完。",
    choices: [
      C(
        "nt-final-hero",
        "关键球亲自终结",
        { shooting: 2, finishing: 2, mental: 5, fame: 8, stamina: -4 },
        {
          intent: "SCORE",
          clearFlags: ["NT_CALLED"],
          setFlags: ["NT_DONE"],
          nextEventId: "nba-offseason",
        },
      ),
      C(
        "nt-final-team",
        "把队友带到最佳位置",
        {
          passing: 3,
          basketballIQ: 3,
          mental: 4,
          fame: 6,
          zhihuReputation: 5,
        },
        {
          intent: "TEAM",
          clearFlags: ["NT_CALLED"],
          setFlags: ["NT_DONE"],
          nextEventId: "nba-offseason",
        },
      ),
      C(
        "nt-final-wall",
        "最后一防赌上一切",
        {
          defense: 4,
          physical: 2,
          mental: 4,
          fame: 7,
          stamina: -5,
        },
        {
          intent: "DEFEND",
          clearFlags: ["NT_CALLED"],
          setFlags: ["NT_DONE"],
          nextEventId: "nba-offseason",
        },
      ),
    ],
  },
  {
    id: "nt-denied",
    stage: "NATIONAL_TEAM",
    visualType: "NONE",
    eventKind: "STORY",
    excludesFlags: ["NT_CALLED"],
    title: "落选名单",
    description:
      "国家队最终名单没有你。电话那头很短——但俱乐部的休赛期还在，退役与否仍由你决定。",
    kanShanDialogue: "没穿上那件红衣，不等于没走过这条路。",
    choices: [
      C(
        "nt-denied-return",
        "回到俱乐部休赛期再做决定",
        { mental: 1, fame: -1 },
        {
          clearFlags: ["NT_CALLED"],
          setFlags: ["NT_DONE"],
          nextEventId: "nba-offseason",
        },
      ),
      C(
        "nt-denied-bitter",
        "公开抱怨后仍回俱乐部",
        { fame: 2, zhihuReputation: -4, mental: -3 },
        {
          clearFlags: ["NT_CALLED"],
          setFlags: ["NT_DONE"],
          nextEventId: "nba-offseason",
        },
      ),
      C(
        "nt-denied-retire",
        "就此宣布退役",
        { mental: 2, basketballIQ: 1 },
        { nextStage: "RETIRED" },
      ),
    ],
  },
];
