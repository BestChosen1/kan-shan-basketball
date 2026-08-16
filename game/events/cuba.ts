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

/** CUBA：10（含分叉入口） */
export const CUBA_EVENTS: GameEvent[] = [
  {
    id: "cuba-elite-invite",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["SCHOOL_STAR"],
    nextEventId: "cuba-first-league",
    title: "CUBA 强校特招",
    description:
      "传统强校抛来橄榄枝：更多曝光，也更残酷的竞争。你被推进聚光灯中心。",
    kanShanDialogue: "强校很香，也很吃人。",
    choices: [
      C("cuba-elite-accept-pressure", "接受核心竞争压力", {
        fame: 4,
        mental: -2,
        potential: 2,
      }),
      C("cuba-elite-role", "先求轮换站稳", {
        defense: 2,
        basketballIQ: 2,
        fame: 1,
      }),
      C("cuba-elite-party", "享受新鲜感放松纪律", {
        fame: 2,
        stamina: -3,
        mental: -2,
        potential: -2,
      }),
    ],
  },
  {
    id: "cuba-walkon-tryout",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["SCHOOL_GRIND"],
    nextEventId: "cuba-first-league",
    title: "CUBA 试训旁路",
    description:
      "没有大红地毯。你和其他走训生一起排队，用一场对抗赛换球衣。",
    kanShanDialogue: "从零证明，我熟。",
    choices: [
      C("cuba-walkon-hustle", "脏活累活全包", {
        defense: 3,
        physical: 2,
        stamina: -5,
        fame: 1,
      }),
      C("cuba-walkon-skill", "用投篮惊艳教练组", {
        shooting: 3,
        fame: 2,
        mental: 1,
      }),
      C("cuba-walkon-doubt", "怀疑自己配不配", {
        mental: -4,
        potential: -1,
        stamina: -1,
      }),
    ],
  },
  {
    id: "cuba-school-choice",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    excludesFlags: ["SCHOOL_STAR", "SCHOOL_GRIND"],
    nextEventId: "cuba-first-league",
    title: "CUBA 选校",
    description:
      "多所大学抛来橄榄枝：强校竞争激烈，中游球队承诺首发，还有注重培养的体系型学校。",
    kanShanDialogue: "选校像选路：风光、时间，还是方法。",
    choices: [
      C("cuba-school-power", "去强校挑战更高强度", {
        potential: 2,
        mental: 2,
        fame: 2,
        stamina: -2,
      }),
      C("cuba-school-system", "选体系完善的中游名校", {
        basketballIQ: 3,
        passing: 1,
        mental: 1,
      }),
      C("cuba-school-minutes", "去能保证出场时间的球队", {
        finishing: 2,
        shooting: 1,
        fame: 1,
        potential: -1,
      }),
    ],
  },
  {
    id: "cuba-first-league",
    stage: "CUBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 48, stakes: "REGULAR" },
    nextEventId: "cuba-midseason-slump",
    title: "第一次大学联赛",
    description:
      "CUBA 分区赛开打。强度远超高中：挡拆质量、轮转速度、体能消耗都上了一个台阶。",
    kanShanDialogue: "大学篮球会惩罚每一次走神。",
    choices: [
      C(
        "cuba-league-volume",
        "提高出手量，建立得分威胁",
        { shooting: 3, finishing: 1, fame: 2, stamina: -4 },
        { intent: "SCORE" },
      ),
      C(
        "cuba-league-glue",
        "做胶水人，防守+传球",
        { defense: 2, passing: 2, basketballIQ: 1, stamina: -3 },
        { intent: "TEAM" },
      ),
      C(
        "cuba-league-recover",
        "严格管理负荷，保证出场质量",
        { stamina: 4, mental: 2, potential: 1 },
        { intent: "SAFE" },
      ),
    ],
  },
  {
    id: "cuba-midseason-slump",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "cuba-coach-conflict",
    title: "赛季中段低潮",
    description:
      "连续三场手感冰凉。社交媒体开始标签化你，队友眼神也变了。",
    kanShanDialogue: "低潮不是终点，沉沦才是。",
    choices: [
      C("cuba-slump-film", "加看录像找问题", {
        basketballIQ: 3,
        mental: 2,
        stamina: -2,
      }),
      C("cuba-slump-force", "下场比赛豪赌出手", {
        shooting: 2,
        fame: 1,
        mental: -3,
        stamina: -3,
      }),
      C("cuba-slump-spiral", "自我怀疑，训练迟到", {
        mental: -5,
        fame: -2,
        potential: -2,
        draftStock: -4,
      }),
    ],
  },
  {
    id: "cuba-coach-conflict",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "cuba-finals",
    title: "与教练争执",
    description:
      "战术会议上你公开质疑轮转。教练给你两个选择：服从，或坐看板。",
    kanShanDialogue: "我可以听话，但不能变成没有想法的棋子。",
    choices: [
      C("cuba-coach-submit", "公开道歉并执行战术", {
        mental: 1,
        basketballIQ: 2,
        fame: -1,
      }),
      C("cuba-coach-argue", "坚持己见硬刚", {
        fame: 2,
        mental: -2,
        draftStock: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
      C("cuba-coach-quiet", "表面服从，私下消极", {
        mental: -3,
        stamina: -2,
        passing: -1,
      }),
    ],
  },
  {
    id: "cuba-finals",
    stage: "CUBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 58, stakes: "FINAL" },
    nextEventId: "cuba-draft-decision",
    title: "决赛关键时刻",
    description:
      "全国赛决赛，倒计时 28 秒，落后两分。球到你手上——教练喊暂停，所有人看着你。",
    kanShanDialogue: "我不怕投丢。我怕不敢投。",
    choices: [
      C(
        "cuba-finals-iso",
        "单打造杀伤冲击篮筐",
        { finishing: 3, physical: 1, fame: 4, stamina: -3, mental: 2 },
        { intent: "RISK" },
      ),
      C(
        "cuba-finals-three",
        "直接拔三分追平/超分",
        { shooting: 3, fame: 5, mental: 1, stamina: -2 },
        { intent: "SCORE" },
      ),
      C(
        "cuba-finals-dish",
        "吸引包夹后传给空位队友",
        { passing: 3, basketballIQ: 3, fame: 2, zhihuReputation: 2 },
        { intent: "TEAM" },
      ),
    ],
  },
  {
    id: "cuba-draft-decision",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    title: "是否参加职业选秀",
    description:
      "CUBA 赛季结束。经纪人、教练、家人意见不一：申报 CBA 选秀，再读一年，还是先就业放弃冲击？",
    kanShanDialogue: "职业是目标，但时机也对。",
    choices: [
      C(
        "cuba-draft-declare",
        "立刻申报选秀冲击职业",
        { fame: 4, mental: 2, potential: 1, money: 5000, draftStock: 5 },
        {
          intent: "DECLARE",
          setFlags: ["DECLARED_EARLY"],
          clearFlags: ["STAYED_CUBA", "SKIPPED_DRAFT"],
          nextEventId: "cba-draft",
        },
      ),
      C(
        "cuba-draft-wait",
        "再留一年打磨技术",
        { basketballIQ: 3, shooting: 2, potential: 2, fame: -1 },
        {
          intent: "WAIT",
          setFlags: ["STAYED_CUBA"],
          clearFlags: ["DECLARED_EARLY", "SKIPPED_DRAFT"],
          nextEventId: "cuba-extra-year",
        },
      ),
      C(
        "cuba-draft-skip",
        "放弃选秀，另寻出路",
        { mental: -2, fame: -3, draftStock: -10, money: 2000 },
        {
          setFlags: ["SKIPPED_DRAFT", "DOMESTIC_FOCUS"],
          clearFlags: ["DECLARED_EARLY", "NBA_BOUND"],
          nextEventId: "cba-undrafted-camp",
        },
      ),
    ],
  },
  {
    id: "cuba-extra-year",
    stage: "CUBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["STAYED_CUBA"],
    nextEventId: "cuba-extra-match",
    title: "多留的一年",
    description:
      "队友陆续走人，你成为老将。有人说你胆怯，有人说你明智。",
    kanShanDialogue: "多一年，不是逃跑，是补课。",
    choices: [
      C("cuba-extra-lead", "承担领袖职责", {
        mental: 3,
        passing: 2,
        fame: 2,
      }),
      C("cuba-extra-skills", "专精投篮与脚步", {
        shooting: 4,
        finishing: 2,
        stamina: -3,
      }),
      C("cuba-extra-regret", "整夜刷手机怀疑决定", {
        mental: -4,
        potential: -1,
        draftStock: -2,
      }),
    ],
  },
  {
    id: "cuba-extra-match",
    stage: "CUBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    requiresFlags: ["STAYED_CUBA"],
    matchConfig: { opponentStrength: 55, stakes: "PLAYOFF" },
    nextStageAfterComplete: "CBA",
    title: "加时赛季关键战",
    description:
      "多留一年的你迎来淘汰赛。球探席比去年更满——也更挑剔。",
    kanShanDialogue: "这回，别再留遗憾。",
    choices: [
      C(
        "cuba-extra-score",
        "接管进攻",
        { shooting: 3, fame: 3, stamina: -4 },
        { intent: "SCORE", nextEventId: "cba-draft" },
      ),
      C(
        "cuba-extra-lock",
        "锁死对方箭头",
        { defense: 4, physical: 1, fame: 2 },
        { intent: "DEFEND", nextEventId: "cba-draft" },
      ),
      C(
        "cuba-extra-safe",
        "减少失误求稳",
        { basketballIQ: 2, mental: 2, fame: 1 },
        { intent: "SAFE", nextEventId: "cba-draft" },
      ),
    ],
  },
];
