import type { CareerStage } from "./types.ts";

export const CAREER_STAGE_ORDER: readonly CareerStage[] = [
  "NORTH_POLE",
  "SCHOOL",
  "CUBA",
  "CBA",
  "NBA",
  "NATIONAL_TEAM",
  "RETIRED",
] as const;

export const STAGE_TEAM: Record<CareerStage, string> = {
  NORTH_POLE: "北极冰原篮球队",
  SCHOOL: "校园篮球队",
  CUBA: "CUBA大学球队",
  CBA: "CBA职业球队",
  NBA: "NBA职业球队",
  NATIONAL_TEAM: "中国国家队",
  RETIRED: "退役",
};

export const STAGE_LABEL: Record<CareerStage, string> = {
  NORTH_POLE: "北极",
  SCHOOL: "校园篮球",
  CUBA: "CUBA",
  CBA: "CBA",
  NBA: "NBA",
  NATIONAL_TEAM: "中国国家队",
  RETIRED: "退役",
};

export const SKILL_MIN = 0;
export const SKILL_MAX = 99;
export const OVERALL_MIN = 0;
export const OVERALL_MAX = 99;
export const METER_MIN = 0;
export const METER_MAX = 100;
export const MONEY_MIN = 0;

export const OVERALL_WEIGHTS = {
  shooting: 0.2,
  finishing: 0.15,
  passing: 0.15,
  defense: 0.15,
  physical: 0.1,
  basketballIQ: 0.25,
} as const;

export const INITIAL_PLAYER = {
  name: "刘看山",
  age: 12,
  stage: "NORTH_POLE" as const,
  shooting: 45,
  finishing: 40,
  passing: 42,
  defense: 38,
  physical: 50,
  basketballIQ: 35,
  stamina: 70,
  potential: 90,
  mental: 60,
  fame: 0,
  zhihuReputation: 10,
  money: 0,
  team: STAGE_TEAM.NORTH_POLE,
  trophies: [] as string[],
};
