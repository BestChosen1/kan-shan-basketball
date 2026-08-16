import type { CareerStage, PlayerState } from "@/game";
import { SKILL_GAIN_MULTIPLIER } from "@/game";

export {
  getAvatarSrc,
  getHeroSheet,
  KANSHAN_ASSETS,
  KANSHAN_SHEETS,
  KanshanFigure,
} from "./kanshan-figure";

/** UI 展示用短标签（不改动 game 常量） */
export const TIMELINE_LABEL: Record<CareerStage, string> = {
  NORTH_POLE: "北极",
  SCHOOL: "校园",
  CUBA: "CUBA",
  CBA: "CBA",
  NBA: "NBA",
  NATIONAL_TEAM: "国家队",
  RETIRED: "退役",
};

export const SKILL_GROUPS = [
  {
    id: "scoring",
    title: "得分",
    stats: [
      { key: "shooting", label: "投篮", max: 99 },
      { key: "finishing", label: "突破", max: 99 },
    ],
  },
  {
    id: "playmaking",
    title: "组织",
    stats: [
      { key: "passing", label: "传球", max: 99 },
      { key: "basketballIQ", label: "篮球智商", max: 99 },
    ],
  },
  {
    id: "defense",
    title: "防守",
    stats: [
      { key: "defense", label: "防守", max: 99 },
      { key: "physical", label: "身体", max: 99 },
    ],
  },
  {
    id: "condition",
    title: "体能",
    stats: [{ key: "stamina", label: "体力", max: 100 }],
  },
] as const;

export type SkillKey = (typeof SKILL_GROUPS)[number]["stats"][number]["key"];

export type DiffableStatKey =
  | SkillKey
  | "overall"
  | "potential"
  | "mental"
  | "fame"
  | "zhihuReputation"
  | "money";

export interface StatDelta {
  key: DiffableStatKey;
  label: string;
  delta: number;
}

const DIFF_LABELS: Record<DiffableStatKey, string> = {
  shooting: "投篮",
  finishing: "突破",
  passing: "传球",
  defense: "防守",
  physical: "身体",
  basketballIQ: "篮球智商",
  stamina: "体力",
  overall: "OVR",
  potential: "潜力",
  mental: "心态",
  fame: "名气",
  zhihuReputation: "知乎声望",
  money: "资金",
};

const DIFF_KEYS = Object.keys(DIFF_LABELS) as DiffableStatKey[];

export function computeStatDeltas(
  before: PlayerState,
  after: PlayerState,
): StatDelta[] {
  const deltas: StatDelta[] = [];

  for (const key of DIFF_KEYS) {
    const delta = after[key] - before[key];
    if (delta !== 0) {
      deltas.push({
        key,
        label: DIFF_LABELS[key],
        delta,
      });
    }
  }

  return deltas;
}

export function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN")}`;
}

/** 仅用于 UI 展示 Choice.effects（正向技能按引擎倍率预览） */
export function formatChoiceEffects(
  effects: Partial<Record<DiffableStatKey | "money", number>>,
): string[] {
  const skillKeys = new Set([
    "shooting",
    "finishing",
    "passing",
    "defense",
    "physical",
    "basketballIQ",
  ]);

  return (Object.keys(effects) as Array<DiffableStatKey | "money">)
    .filter((key) => effects[key] !== undefined && effects[key] !== 0)
    .map((key) => {
      let delta = effects[key] as number;
      if (skillKeys.has(key) && delta > 0) {
        delta = Math.round(delta * SKILL_GAIN_MULTIPLIER);
      }
      const label = DIFF_LABELS[key as DiffableStatKey] ?? key;
      return `${label} ${delta > 0 ? `+${delta}` : delta}`;
    });
}

export const CORE_STATS = [
  { key: "shooting", label: "投篮", max: 99 },
  { key: "finishing", label: "突破", max: 99 },
  { key: "passing", label: "传球", max: 99 },
  { key: "basketballIQ", label: "篮球智商", max: 99 },
  { key: "defense", label: "防守", max: 99 },
  { key: "physical", label: "身体", max: 99 },
  { key: "stamina", label: "体力", max: 100 },
] as const;

export function getStageTransitionCopy(
  from: CareerStage,
  to: CareerStage,
): { eyebrow: string; title: string; subtitle: string } {
  const map: Partial<
    Record<
      `${CareerStage}->${CareerStage}`,
      { eyebrow: string; title: string; subtitle: string }
    >
  > = {
    "NORTH_POLE->SCHOOL": {
      eyebrow: "生涯新阶段解锁",
      title: "校园",
      subtitle: "看山把篮球带进了学校球场",
    },
    "SCHOOL->CUBA": {
      eyebrow: "生涯新阶段解锁",
      title: "CUBA",
      subtitle: "大学联赛的哨声已经响起",
    },
    "CUBA->CBA": {
      eyebrow: "生涯新阶段解锁",
      title: "CBA",
      subtitle: "看山正式踏入职业篮球",
    },
    "CBA->NBA": {
      eyebrow: "生涯新阶段解锁",
      title: "NBA",
      subtitle: "世界最高舞台向北极狐敞开",
    },
    "NBA->NATIONAL_TEAM": {
      eyebrow: "生涯新阶段解锁",
      title: "国家队",
      subtitle: "红衣加身，代表中国出战",
    },
    "NATIONAL_TEAM->RETIRED": {
      eyebrow: "生涯落幕",
      title: "退役",
      subtitle: "一段从冰原到世界之巅的旅程完成了",
    },
  };

  return (
    map[`${from}->${to}`] ?? {
      eyebrow: "生涯新阶段解锁",
      title: TIMELINE_LABEL[to],
      subtitle: `从${TIMELINE_LABEL[from]}迈向${TIMELINE_LABEL[to]}`,
    }
  );
}
