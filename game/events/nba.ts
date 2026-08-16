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

/** NBA：10 */
export const NBA_EVENTS: GameEvent[] = [
  {
    id: "nba-draft",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "DRAFT",
    draftConfig: { league: "NBA" },
    requiresFlags: ["NBA_BOUND"],
    nextEventId: "nba-summer-league",
    title: "NBA 选秀",
    description:
      "布鲁克林的舞台比任何联赛都大。球衣还没穿上，镜头已经把你推到世界面前。",
    kanShanDialogue: "从冰原到这里——深呼吸，然后打球。",
    choices: [
      C(
        "nba-draft-workout-offense",
        "试训展示投射与持球威胁",
        { shooting: 3, finishing: 1, fame: 5, money: 100000, draftStock: 4 },
        { intent: "DECLARE" },
      ),
      C(
        "nba-draft-workout-two-way",
        "强调攻防一体与转换",
        { defense: 2, physical: 2, fame: 4, money: 90000 },
        { intent: "DECLARE" },
      ),
      C(
        "nba-draft-media",
        "媒体日讲清故事与心态",
        {
          mental: 3,
          zhihuReputation: 5,
          fame: 3,
          money: 80000,
        },
        { intent: "WAIT" },
      ),
    ],
  },
  {
    id: "nba-summer-league",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 52, stakes: "REGULAR" },
    nextEventId: "nba-roster-crunch",
    title: "夏季联赛",
    description:
      "拉斯维加斯的夏联是新人战场：球权更多，容错更少，教练组在评估你的地板与天花板。",
    kanShanDialogue: "这里每个人都想被看见。那就用比赛说话。",
    choices: [
      C(
        "nba-summer-hero",
        "承担终结权，冲击数据",
        { finishing: 3, shooting: 2, fame: 3, stamina: -5, mental: -1 },
        { intent: "SCORE" },
      ),
      C(
        "nba-summer-system",
        "按 NBA 体系跑位学习",
        { basketballIQ: 4, passing: 2, potential: 1 },
        { intent: "SAFE" },
      ),
      C(
        "nba-summer-defense",
        "先靠防守与体力站稳轮换",
        { defense: 3, stamina: 2, physical: 1, fame: 1 },
        { intent: "DEFEND" },
      ),
    ],
  },
  {
    id: "nba-roster-crunch",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    title: "裁员名单前夜",
    description:
      "开季名单只剩两个名额。总经理约谈：你可能留下，也可能被裁后转 G 联赛或回国。",
    kanShanDialogue: "名额很残酷，但它比谎言干净。",
    choices: [
      C(
        "nba-roster-earn",
        "最后一场对抗拼到抽筋",
        { physical: 2, defense: 2, stamina: -6, mental: 2 },
        { nextEventId: "nba-regular-season" },
      ),
      C(
        "nba-roster-accept-g",
        "接受发展联赛历练",
        { mental: 1, potential: 2, fame: -2 },
        { nextEventId: "nba-gleague-grind" },
      ),
      C(
        "nba-roster-bust",
        "心态崩溃表现失常",
        { mental: -5, fame: -4, draftStock: -8 },
        {
          setFlags: ["NBA_BUST"],
          clearFlags: ["NBA_BOUND"],
          nextEventId: "cba-bust-return",
        },
      ),
    ],
  },
  {
    id: "nba-gleague-grind",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    matchConfig: { opponentStrength: 58, stakes: "REGULAR" },
    nextEventId: "nba-regular-season",
    title: "发展联赛征途",
    description:
      "巴士、小馆、更少镜头。你要在这里把自己重新打造成「可上场的轮换」。",
    kanShanDialogue: "小馆也能出大事。",
    choices: [
      C(
        "nba-g-score",
        "场场冲击高效得分",
        { shooting: 3, finishing: 2, stamina: -4 },
        { intent: "SCORE" },
      ),
      C(
        "nba-g-two-way",
        "攻防两端抢存在感",
        { defense: 3, physical: 2, fame: 1 },
        { intent: "DEFEND" },
      ),
      C(
        "nba-g-whine",
        "抱怨舞台太小",
        { mental: -4, fame: -2, potential: -1 },
        { intent: "RISK" },
      ),
    ],
  },
  {
    id: "nba-regular-season",
    stage: "NBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 68, stakes: "REGULAR" },
    nextEventId: "nba-load-management",
    title: "NBA 常规赛",
    description:
      "82 场漫长旅程。背靠背、时区、身体对抗、角色定位——每一场都在重新定义你是谁。",
    kanShanDialogue: "职业不是一夜爆红，是八十二次证明。",
    choices: [
      C(
        "nba-rs-specialist",
        "做定点空间型射手",
        { shooting: 4, basketballIQ: 1, fame: 2, stamina: -3 },
        { intent: "SCORE" },
      ),
      C(
        "nba-rs-connector",
        "做连接者提升球队净效率",
        { passing: 3, basketballIQ: 3, mental: 2 },
        { intent: "TEAM" },
      ),
      C(
        "nba-rs-two-way",
        "攻防两端抢脏活上位",
        { defense: 3, physical: 2, stamina: -4, fame: 2 },
        { intent: "DEFEND" },
      ),
    ],
  },
  {
    id: "nba-load-management",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-playoff-game",
    title: "负荷管理争议",
    description:
      "教练安排你轮休关键大战。国内球迷骂「娇气」，训练师说「这是科学」。",
    kanShanDialogue: "我可以打，但长期健康也是责任。",
    choices: [
      C("nba-load-follow", "服从轮休", { stamina: 4, mental: 1, fame: -2 }),
      C("nba-load-insist", "强烈要求上场", {
        fame: 3,
        stamina: -5,
        physical: -2,
        setFlags: ["INJURY_PRONE"],
      }),
      C("nba-load-leak", "把内部分歧泄露给媒体", {
        fame: 2,
        zhihuReputation: -4,
        mental: -2,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "nba-playoff-game",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 76, stakes: "PLAYOFF" },
    title: "季后赛关键比赛",
    description:
      "季后赛 G5，胜者晋级。对手针对性极强，裁判尺度更紧，观众声浪几乎要把地板掀翻。",
    kanShanDialogue: "关键球，我接。",
    choices: [
      C(
        "nba-po-clutch-shot",
        "关键投篮自己出手",
        { shooting: 3, mental: 4, fame: 6, stamina: -3 },
        {
          intent: "SCORE",
          setFlags: ["NT_CALLED"],
          nextStage: "NATIONAL_TEAM",
        },
      ),
      C(
        "nba-po-drive",
        "冲击篮筐造杀伤",
        { finishing: 3, physical: 2, fame: 5, stamina: -4 },
        {
          intent: "RISK",
          setFlags: ["NT_CALLED"],
          nextStage: "NATIONAL_TEAM",
        },
      ),
      C(
        "nba-po-trust",
        "信任体系，找到最佳出手点",
        { passing: 2, basketballIQ: 4, fame: 4, zhihuReputation: 3 },
        {
          intent: "TEAM",
          setFlags: ["NT_CALLED"],
          nextStage: "NATIONAL_TEAM",
        },
      ),
    ],
  },
  {
    id: "nba-injury-shutdown",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["INJURY_PRONE", "NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    title: "赛季报销阴影",
    description:
      "扫描结果显示累积劳损。队医建议赛季报销，你也可以选择带伤打。",
    kanShanDialogue: "职业生涯很长，但膝盖只有一双。",
    choices: [
      C(
        "nba-inj-rest",
        "接受赛季报销",
        { stamina: 5, physical: 1, fame: -3, mental: -1 },
        { setFlags: ["NT_CALLED"], nextStage: "NATIONAL_TEAM" },
      ),
      C(
        "nba-inj-play",
        "带伤继续打",
        { fame: 3, physical: -4, stamina: -4, mental: 2 },
        { nextEventId: "nba-playoff-game" },
      ),
      C(
        "nba-inj-retire",
        "宣布退役",
        { mental: -2, fame: 1 },
        { setFlags: ["EARLY_RETIRE"], nextStage: "RETIRED" },
      ),
    ],
  },
  {
    id: "nba-allstar-weekend",
    stage: "NBA",
    visualType: "CELEBRATE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-playoff-game",
    title: "全明星周末旁听",
    description:
      "你没进球星赛，但被邀请技巧挑战赛。镜头很多，实力检验更真实。",
    kanShanDialogue: "站在旁边，也要站得像要进场的人。",
    choices: [
      C("nba-as-compete", "认真对待挑战赛", {
        shooting: 2,
        fame: 3,
        mental: 1,
      }),
      C("nba-as-network", "社交结识球星", {
        fame: 2,
        zhihuReputation: 2,
        basketballIQ: 1,
      }),
      C("nba-as-party", "通宵庆祝影响状态", {
        fame: 1,
        stamina: -5,
        mental: -2,
      }),
    ],
  },
  {
    id: "nba-contract-extension-talk",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-load-management",
    title: "续约谈判噪音",
    description:
      "经纪人把报价单拍在桌上。数字很甜，条款很刺——你要名声还是保障？",
    kanShanDialogue: "钱会说话，但别替我做决定。",
    choices: [
      C("nba-ext-safe", "签下保障年限", {
        money: 50000,
        mental: 2,
        potential: -1,
      }),
      C("nba-ext-bet", "赌自己明年暴涨", {
        mental: 3,
        fame: 2,
        money: -10000,
      }),
      C("nba-ext-leak", "谈判细节外流", {
        fame: 3,
        zhihuReputation: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
];
