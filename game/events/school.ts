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

/** 校园：6 */
export const SCHOOL_EVENTS: GameEvent[] = [
  {
    id: "school-tryout",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "school-first-game",
    title: "校队选拔",
    description:
      "体育馆里挤满报名的学生。教练只看三轮：运球、投篮、一对一。名单今晚公布。",
    kanShanDialogue: "北极来的？没关系，球架高度全世界一样。",
    choices: [
      C("school-tryout-score", "用投篮表现抢眼", {
        shooting: 3,
        fame: 2,
        stamina: -2,
      }),
      C("school-tryout-defend", "死咬对手，防守抢戏", {
        defense: 3,
        physical: 1,
        stamina: -3,
      }),
      C("school-tryout-choke", "紧张到连续打铁", {
        shooting: -1,
        mental: -3,
        fame: -1,
        stamina: -2,
      }),
    ],
  },
  {
    id: "school-first-game",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 38, stakes: "REGULAR" },
    nextEventId: "school-bench-pressure",
    title: "第一次正式比赛",
    description:
      "校际联赛首秀。替补席上心跳如鼓，教练突然喊你的名字——上场两分钟，决定你是否留下。",
    kanShanDialogue: "别想北极，别想观众。只想下一次空位。",
    choices: [
      C(
        "school-first-attack",
        "主动要球强攻篮下",
        { finishing: 3, fame: 2, stamina: -3, mental: -1 },
        { intent: "SCORE" },
      ),
      C(
        "school-first-smart",
        "按战术跑位，稳妥处理球",
        { basketballIQ: 3, passing: 1, mental: 2 },
        { intent: "SAFE" },
      ),
      C(
        "school-first-hustle",
        "拼抢篮板和防守轮转",
        { defense: 2, physical: 2, stamina: -4 },
        { intent: "DEFEND" },
      ),
    ],
  },
  {
    id: "school-bench-pressure",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "school-rival",
    title: "替补席上的闲话",
    description:
      "有人说你只是「北极猎奇」。队友笑场，教练假装没听见。你怎么接这一刀？",
    kanShanDialogue: "证明不需要嘴，但嘴有时会先伤到人。",
    choices: [
      C("school-bench-ignore", "装作没听见，加练回应", {
        mental: 2,
        stamina: -3,
        shooting: 2,
      }),
      C("school-bench-clapback", "当场呛回去", {
        fame: 2,
        mental: -2,
        zhihuReputation: -2,
        setFlags: ["MEDIA_BACKLASH"],
      }),
      C("school-bench-sink", "生闷气，训练放空", {
        mental: -4,
        stamina: -1,
        potential: -1,
      }),
    ],
  },
  {
    id: "school-rival",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "MATCH",
    matchConfig: { opponentStrength: 46, stakes: "REGULAR" },
    nextEventId: "school-focus",
    title: "区赛仇敌战",
    description:
      "对手专防你的投篮点。教练要你证明：你是体系一环，还是只会单干的新人。",
    kanShanDialogue: "被针对不可怕，可怕的是自己先乱。",
    choices: [
      C(
        "school-rival-iso",
        "硬解单打证明自己",
        { finishing: 3, fame: 2, mental: -2, stamina: -4 },
        { intent: "RISK" },
      ),
      C(
        "school-rival-team",
        "传球带动空切",
        { passing: 3, basketballIQ: 2, fame: 1 },
        { intent: "TEAM" },
      ),
      C(
        "school-rival-hide",
        "减少触球避开责任",
        { mental: -3, fame: -2, stamina: 1 },
        { intent: "SAFE" },
      ),
    ],
  },
  {
    id: "school-focus",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "STORY",
    title: "选择主攻方向",
    description:
      "教练约谈：特招名额、普通CUBA通道、或者先打磨一年再冲。三条路，三种人生开局。",
    kanShanDialogue: "我想把短板补上，也想让长板更长。",
    choices: [
      C(
        "school-focus-star",
        "冲击特招，走明星通道",
        { shooting: 3, fame: 3, mental: 1, stamina: -2 },
        {
          setFlags: ["SCHOOL_STAR"],
          clearFlags: ["SCHOOL_GRIND"],
          nextEventId: "cuba-elite-invite",
        },
      ),
      C(
        "school-focus-grind",
        "拒绝捷径，苦练旁路",
        { defense: 3, physical: 2, mental: 2, fame: -1 },
        {
          setFlags: ["SCHOOL_GRIND"],
          clearFlags: ["SCHOOL_STAR"],
          nextEventId: "cuba-walkon-tryout",
        },
      ),
      C(
        "school-focus-balanced",
        "稳妥选校，正常申报",
        { basketballIQ: 2, passing: 2, potential: 1 },
        {
          clearFlags: ["SCHOOL_STAR", "SCHOOL_GRIND"],
          nextEventId: "cuba-school-choice",
        },
      ),
    ],
  },
  {
    id: "school-injury-scare",
    stage: "SCHOOL",
    visualType: "NONE",
    eventKind: "STORY",
    excludesFlags: ["SCHOOL_STAR", "SCHOOL_GRIND"],
    nextStageAfterComplete: "CUBA",
    title: "体检警报",
    description:
      "（备用节点）校医提醒踝关节负荷过高。多数玩家不会走到这里。",
    kanShanDialogue: "疼可以忍，但不能装看不见。",
    choices: [
      C("school-inj-rest", "停训一周", { stamina: 4, physical: -1, mental: 1 }),
      C("school-inj-play", "瞒着继续打", {
        fame: 1,
        physical: -3,
        stamina: -3,
        setFlags: ["INJURY_PRONE"],
      }),
      C("school-inj-therapy", "做康复训练", {
        physical: 1,
        mental: 2,
        basketballIQ: 1,
      }),
    ],
  },
];
