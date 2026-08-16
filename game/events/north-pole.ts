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

/** 北极：3 */
export const NORTH_POLE_EVENTS: GameEvent[] = [
  {
    id: "np-first-ball",
    stage: "NORTH_POLE",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "np-arctic-training",
    title: "第一次接触篮球",
    description:
      "极夜漫长，冰面空旷。一只被人遗弃的旧篮球滚到你脚边——你第一次真正握住它。",
    kanShanDialogue: "这球好沉……但在冰上弹起来的声音，比风好听。",
    choices: [
      C("np-first-ball-shoot", "对着雪堆练投篮手感", { shooting: 3, stamina: -2 }),
      C("np-first-ball-dribble", "在冰面上反复运球找节奏", {
        finishing: 2,
        physical: 1,
        stamina: -3,
      }),
      C("np-first-ball-quit", "太冷了，先缩回帐篷", {
        mental: -2,
        stamina: 2,
        potential: -1,
      }),
    ],
  },
  {
    id: "np-arctic-training",
    stage: "NORTH_POLE",
    visualType: "NONE",
    eventKind: "STORY",
    nextEventId: "np-cold-doubt",
    title: "北极训练",
    description:
      "极寒中的体能课：负重奔跑、雪地折返、手套外的指尖投篮。你的身体在极限里适应篮球。",
    kanShanDialogue: "冷可以忍，但球不能不碰。今天再多一组。",
    choices: [
      C("np-arctic-physical", "加练爆发力与对抗", {
        physical: 4,
        defense: 1,
        stamina: -4,
      }),
      C("np-arctic-endurance", "专注耐力，撑完整堂课", {
        stamina: 5,
        mental: 2,
        physical: 1,
      }),
      C("np-arctic-overtrain", "硬撑加练到虚脱", {
        physical: 2,
        shooting: 1,
        stamina: -8,
        mental: -3,
        setFlags: ["INJURY_PRONE"],
      }),
    ],
  },
  {
    id: "np-cold-doubt",
    stage: "NORTH_POLE",
    visualType: "NONE",
    eventKind: "STORY",
    nextStageAfterComplete: "SCHOOL",
    title: "离乡前夜",
    description:
      "家人争论要不要让你去内地读书打球。风雪拍窗，你必须在勇气与退缩之间选一边。",
    kanShanDialogue: "如果我不走，这只球就只是北极的玩具。",
    choices: [
      C("np-leave-brave", "坚持南下追寻篮球", { mental: 3, potential: 2, fame: 1 }),
      C("np-leave-hesitate", "答应去，但心里发虚", {
        mental: -2,
        potential: 1,
        basketballIQ: 1,
      }),
      C("np-leave-bitter", "带着不服气赌气出发", {
        mental: -1,
        physical: 2,
        fame: -1,
      }),
    ],
  },
];
