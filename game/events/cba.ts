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

/** CBA：12 */
export const CBA_EVENTS: GameEvent[] = [
  {
    id: "cba-draft",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "DRAFT",
    draftConfig: { league: "CBA" },
    nextEventId: "cba-first-pro-camp",
    excludesFlags: ["SKIPPED_DRAFT"],
    title: "CBA 选秀",
    description:
      "选秀夜灯光刺眼。你的名字被念出——职业生涯正式开始，合同与期望一同落下。",
    kanShanDialogue: "从北极到职业联赛，这只是真正开始。",
    choices: [
      C(
        "cba-draft-showcase-skill",
        "试训秀进攻技术抢顺位",
        { shooting: 2, finishing: 2, fame: 3, money: 20000, draftStock: 3 },
        { intent: "DECLARE" },
      ),
      C(
        "cba-draft-showcase-defense",
        "用防守态度打动球队",
        { defense: 3, physical: 1, fame: 2, money: 15000 },
        { intent: "DECLARE" },
      ),
      C(
        "cba-draft-interview",
        "访谈强调可塑性与球商",
        {
          basketballIQ: 2,
          mental: 3,
          zhihuReputation: 3,
          money: 12000,
        },
        { intent: "WAIT" },
      ),
    ],
  },
  {
    id: "cba-undrafted-camp",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["SKIPPED_DRAFT"],
    nextEventId: "cba-first-pro-camp",
    title: "落选秀训练营",
    description:
      "你没有走上选秀台，却挤进了落选秀营。合同更薄，眼神更冷，机会更少。",
    kanShanDialogue: "门没关死，只是更窄。",
    choices: [
      C("cba-ud-fight", "每场对抗都拼命", {
        physical: 3,
        defense: 2,
        stamina: -5,
        draftStock: 4,
      }),
      C("cba-ud-network", "求经纪人找短期合同", {
        fame: 1,
        money: 8000,
        mental: -1,
      }),
      C("cba-ud-quit-thought", "产生退役念头", {
        mental: -5,
        potential: -2,
        setFlags: ["EARLY_RETIRE"],
      }),
    ],
  },
  {
    id: "cba-first-pro-camp",
    stage: "CBA",
    visualType: "DEFENSE",
    eventKind: "STORY",
    nextEventId: "cba-big-decision",
    title: "第一次职业训练",
    description:
      "职业队训练强度、录像分析、营养与恢复一应俱全。你第一次明白：天赋只是入场券。",
    kanShanDialogue: "以前觉得自己够拼，现在才知道职业是什么意思。",
    choices: [
      C("cba-camp-skills", "加班加练投篮与脚步", {
        shooting: 3,
        finishing: 2,
        stamina: -5,
      }),
      C("cba-camp-film", "跟教练组抠战术录像", {
        basketballIQ: 4,
        passing: 1,
        mental: 1,
      }),
      C("cba-camp-body", "优先力量与恢复体系", {
        physical: 3,
        stamina: 3,
        defense: 1,
      }),
    ],
  },
  {
    id: "cba-rookie-wall",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 74, stakes: "REGULAR" },
    nextEventId: "cba-starting-battle",
    title: "新秀墙",
    description:
      "连续客场、身体对抗、裁判尺度……新秀墙不是传说。你被对面老将点名单防。",
    kanShanDialogue: "墙很高，但我不是来参观的。",
    choices: [
      C(
        "cba-wall-attack",
        "硬着头皮强攻",
        { finishing: 2, physical: 2, stamina: -5, mental: -1 },
        { intent: "RISK" },
      ),
      C(
        "cba-wall-smart",
        "减少失误，做对的事",
        { basketballIQ: 3, passing: 2, mental: 2 },
        { intent: "SAFE" },
      ),
      C(
        "cba-wall-fold",
        "回避对抗，显得怯场",
        { mental: -4, fame: -3, draftStock: -3 },
        { intent: "SAFE" },
      ),
    ],
  },
  {
    id: "cba-starting-battle",
    stage: "CBA",
    visualType: "DEFENSE",
    eventKind: "STORY",
    nextEventId: "cba-media-storm",
    title: "首发竞争",
    description:
      "外援归来压缩国内球员空间。教练让你打满一周对抗训练，胜者拿首发。",
    kanShanDialogue: "位置不是给的，是抢的。",
    choices: [
      C("cba-start-score", "用得分证明不可替代", {
        shooting: 3,
        finishing: 2,
        fame: 3,
        stamina: -4,
      }),
      C("cba-start-lockdown", "用防守赢下信任", {
        defense: 4,
        physical: 2,
        fame: 2,
        stamina: -4,
      }),
      C("cba-start-team", "串联全队提升净效率", {
        passing: 3,
        basketballIQ: 3,
        mental: 2,
      }),
    ],
  },
  {
    id: "cba-media-storm",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "cba-big-decision",
    title: "舆论漩涡",
    description:
      "一段训练馆争执视频流出。评论区撕裂，俱乐部公关找你谈话。",
    kanShanDialogue: "球馆里的事，不该只活在手机上。",
    choices: [
      C("cba-media-apology", "公开致歉降温", {
        zhihuReputation: 2,
        fame: -1,
        mental: 1,
        clearFlags: ["MEDIA_BACKLASH"],
      }),
      C("cba-media-silence", "拒绝回应埋头打球", {
        mental: 2,
        shooting: 2,
        fame: -2,
      }),
      C("cba-media-fight", "直播回击引战", {
        fame: 4,
        zhihuReputation: -5,
        mental: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "cba-big-decision",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    title: "职业生涯第一次重大选择",
    description:
      "窗口期来临：死磕国内总冠军、赴美试训冲击 NBA，或先打完赛季再决定下一步——但通往更高舞台的门票，绕不开 NBA。",
    kanShanDialogue: "每条路都好看，每条路都贵。",
    choices: [
      C(
        "cba-decision-champion",
        "留下冲击联赛总冠军",
        { mental: 3, fame: 2, defense: 1, draftStock: -2 },
        {
          setFlags: ["DOMESTIC_FOCUS"],
          clearFlags: ["NBA_BOUND"],
          nextEventId: "cba-title-run",
        },
      ),
      C(
        "cba-decision-overseas",
        "赴美试训冲击 NBA",
        { potential: 3, fame: 4, mental: 2, money: -5000 },
        {
          setFlags: ["NBA_BOUND"],
          clearFlags: ["DOMESTIC_FOCUS"],
          nextEventId: "nba-draft",
        },
      ),
      C(
        "cba-decision-prepare-nba",
        "打完关键赛季再启程 NBA",
        { mental: 2, defense: 2, basketballIQ: 2, fame: 2 },
        {
          setFlags: ["DOMESTIC_FOCUS", "NBA_BOUND"],
          nextEventId: "cba-title-run",
        },
      ),
    ],
  },
  {
    id: "cba-title-run",
    stage: "CBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 82, stakes: "FINAL" },
    requiresFlags: ["DOMESTIC_FOCUS"],
    title: "CBA 决赛之夜",
    description:
      "总决赛 G7。主场声浪几乎掀翻屋顶。这是国内最高舞台的入场券之战。",
    kanShanDialogue: "北极的风，吹不到这里——但我还在。",
    choices: [
      C(
        "cba-final-hero",
        "关键球自己终结",
        { shooting: 3, mental: 4, fame: 5, stamina: -4 },
        { intent: "SCORE", nextEventId: "cba-after-title" },
      ),
      C(
        "cba-final-wall",
        "死守对方外援",
        { defense: 4, physical: 2, fame: 4, stamina: -5 },
        { intent: "DEFEND", nextEventId: "cba-after-title" },
      ),
      C(
        "cba-final-trust",
        "信任体系找最佳出手",
        { passing: 3, basketballIQ: 3, fame: 3 },
        { intent: "TEAM", nextEventId: "cba-after-title" },
      ),
    ],
  },
  {
    id: "cba-after-title",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["DOMESTIC_FOCUS"],
    title: "决赛后的分岔",
    description:
      "无论胜负，俱乐部都问：现在启程 NBA，还是再观望一年？国家队名额可以等——但 NBA 门票不能一直拖。",
    kanShanDialogue: "故事可以改结局，但不能改已经流出的汗。",
    choices: [
      C(
        "cba-after-nba-late",
        "启程冲击 NBA 选秀/试训",
        { fame: 2, potential: 2, mental: 1 },
        {
          setFlags: ["NBA_BOUND"],
          clearFlags: ["DOMESTIC_FOCUS"],
          nextEventId: "nba-draft",
        },
      ),
      C(
        "cba-after-nba-and-nt",
        "先去 NBA，顺带争取国家队关注",
        { mental: 3, defense: 1, zhihuReputation: 3, fame: 2 },
        {
          setFlags: ["NBA_BOUND", "NT_CALLED"],
          clearFlags: ["DOMESTIC_FOCUS"],
          nextEventId: "nba-draft",
        },
      ),
      C(
        "cba-after-nba-risk",
        "带伤也要去试训",
        { fame: 3, physical: -2, stamina: -2, mental: 1 },
        {
          setFlags: ["NBA_BOUND", "INJURY_PRONE"],
          clearFlags: ["DOMESTIC_FOCUS"],
          nextEventId: "nba-draft",
        },
      ),
    ],
  },
  {
    id: "cba-bust-return",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BUST"],
    nextEventId: "cba-bust-match",
    title: "从海外回来",
    description:
      "NBA 试训未果的消息铺天盖地。国内有球队愿意收容你，但合同和眼神都打了折。",
    kanShanDialogue: "回来不是认输，是换一块地板继续打。",
    choices: [
      C("cba-bust-humble", "接受角色球员定位", {
        mental: 2,
        defense: 2,
        fame: -2,
      }),
      C("cba-bust-prove", "扬言要打脸所有人", {
        fame: 3,
        mental: -2,
        shooting: 2,
      }),
      C("cba-bust-fade", "训练提不起劲", {
        mental: -5,
        stamina: -3,
        potential: -2,
        setFlags: ["EARLY_RETIRE"],
      }),
    ],
  },
  {
    id: "cba-bust-match",
    stage: "CBA",
    visualType: "DEFENSE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 76, stakes: "REGULAR" },
    title: "回归首秀",
    description:
      "国内媒体架好长枪短炮。你要在嘘声或掌声里重新介绍自己。",
    kanShanDialogue: "自我介绍？用比赛。",
    choices: [
      C(
        "cba-bust-m-score",
        "用得分回应质疑，争取二次赴美",
        { shooting: 3, fame: 3, stamina: -4 },
        {
          intent: "SCORE",
          setFlags: ["NBA_BOUND"],
          clearFlags: ["NBA_BUST"],
          nextEventId: "nba-season-tipoff",
        },
      ),
      C(
        "cba-bust-m-def",
        "用防守赢尊重，再冲 NBA 合同",
        { defense: 4, physical: 1, fame: 2 },
        {
          intent: "DEFEND",
          setFlags: ["NBA_BOUND"],
          clearFlags: ["NBA_BUST"],
          nextEventId: "nba-season-tipoff",
        },
      ),
      C(
        "cba-bust-m-quit",
        "赛后宣布考虑退役",
        { mental: -4, fame: -3 },
        { setFlags: ["EARLY_RETIRE"], nextStage: "RETIRED" },
      ),
    ],
  },
  {
    id: "cba-filler-trade",
    stage: "CBA",
    visualType: "NONE",
    eventKind: "STORY",
    excludesFlags: ["DOMESTIC_FOCUS", "NBA_BOUND", "NBA_BUST", "SKIPPED_DRAFT"],
    nextStageAfterComplete: "NBA",
    title: "交易传闻",
    description: "（极少触发）经纪人提到一笔潜在交易。",
    kanShanDialogue: "我人还在这，名字已经在别处飞了。",
    choices: [
      C("cba-trade-yes", "接受新环境", { mental: 1, fame: 1 }),
      C("cba-trade-no", "要求留下", { mental: 2, fame: -1 }),
      C("cba-trade-leak", "自己把传闻说漏", {
        fame: 2,
        zhihuReputation: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
];
