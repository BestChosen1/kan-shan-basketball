import type {
  AwardId,
  CareerFlag,
  CareerStage,
  CareerTier,
  ChoiceIntent,
  DraftTier,
  EventKind,
  MatchStakes,
  PlayerRole,
  TrophyId,
} from "./types.ts";

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

export const EVENT_KINDS: readonly EventKind[] = [
  "STORY",
  "MATCH",
  "DRAFT",
  "CONTRACT",
] as const;

export const CAREER_FLAGS: readonly CareerFlag[] = [
  "SCHOOL_STAR",
  "SCHOOL_GRIND",
  "DECLARED_EARLY",
  "STAYED_CUBA",
  "SKIPPED_DRAFT",
  "DOMESTIC_FOCUS",
  "NBA_BOUND",
  "NBA_BUST",
  "NT_CALLED",
  "EARLY_RETIRE",
  "INJURY_PRONE",
  "MEDIA_BACKLASH",
] as const;

export const CAREER_FLAG_LABEL: Record<CareerFlag, string> = {
  SCHOOL_STAR: "校园明星",
  SCHOOL_GRIND: "苦练旁路",
  DECLARED_EARLY: "提早申报",
  STAYED_CUBA: "再留 CUBA",
  SKIPPED_DRAFT: "放弃选秀冲击",
  DOMESTIC_FOCUS: "深耕国内",
  NBA_BOUND: "冲击 NBA",
  NBA_BUST: "海外碰壁",
  NT_CALLED: "国家队征召",
  EARLY_RETIRE: "提前退役轨迹",
  INJURY_PRONE: "伤病阴云",
  MEDIA_BACKLASH: "舆论反噬",
};

export const PLAYER_ROLES: readonly PlayerRole[] = [
  "BENCH",
  "ROTATION",
  "STARTER",
  "STAR",
] as const;

export const CAREER_TIERS: readonly CareerTier[] = [
  "LEGEND",
  "SUPERSTAR",
  "STAR",
  "STARTER",
  "ROLE_PLAYER",
  "JOURNEYMAN",
] as const;

export const TROPHY_IDS: readonly TrophyId[] = [
  "CUBA_CHAMPION",
  "CBA_CHAMPION",
  "NBA_CHAMPION",
  "ASIA_GOLD",
  "WORLD_MEDAL",
] as const;

export const AWARD_IDS: readonly AwardId[] = [
  "FMVP",
  "DPOY_LIKE",
  "ALL_STAR_LIKE",
  "MVP_LIKE",
] as const;

export const TROPHY_NAMES: Record<TrophyId, string> = {
  CUBA_CHAMPION: "CUBA 总冠军",
  CBA_CHAMPION: "CBA 总冠军",
  NBA_CHAMPION: "NBA 总冠军",
  ASIA_GOLD: "亚洲金牌",
  WORLD_MEDAL: "世界大赛奖牌",
};

export const AWARD_NAMES: Record<AwardId, string> = {
  FMVP: "总决赛 MVP",
  DPOY_LIKE: "防守大锁",
  ALL_STAR_LIKE: "全明星级表现",
  MVP_LIKE: "赛季 MVP 级",
};

export const CAREER_TIER_LABEL: Record<CareerTier, string> = {
  LEGEND: "传奇",
  SUPERSTAR: "超级巨星",
  STAR: "明星",
  STARTER: "稳固首发",
  ROLE_PLAYER: "角色球员",
  JOURNEYMAN: "闯荡者",
};

export const SKILL_MIN = 0;
export const SKILL_MAX = 99;
export const OVERALL_MIN = 0;
export const OVERALL_MAX = 99;
export const METER_MIN = 0;
export const METER_MAX = 100;
export const MONEY_MIN = 0;

export const DRAFT_STOCK_MIN = 0;
export const DRAFT_STOCK_MAX = 100;
export const INITIAL_DRAFT_STOCK = 20;

export const PERFORMANCE_MIN = 0;
export const PERFORMANCE_MAX = 100;

export const MATCH_PERFORMANCE_WEIGHTS = {
  shooting: 0.15,
  finishing: 0.1,
  passing: 0.1,
  defense: 0.15,
  physical: 0.1,
  basketballIQ: 0.15,
  mental: 0.1,
  stamina: 0.05,
  overall: 0.1,
} as const;

export const INTENT_BONUS: Record<ChoiceIntent, number> = {
  SCORE: 8,
  DEFEND: 8,
  TEAM: 5,
  SAFE: 2,
  RISK: 6,
  DECLARE: 4,
  WAIT: 0,
};

export const ROLE_BONUS: Record<PlayerRole, number> = {
  BENCH: -4,
  ROTATION: 0,
  STARTER: 3,
  STAR: 6,
};

export const STAKES_BONUS: Record<MatchStakes, number> = {
  REGULAR: 0,
  PLAYOFF: 2,
  FINAL: 4,
};

export const STAMINA_COST_BY_STAKES: Record<MatchStakes, number> = {
  REGULAR: -4,
  PLAYOFF: -6,
  FINAL: -8,
};

export const DRAFT_VALUE_MIN = 0;
export const DRAFT_VALUE_MAX = 100;

export const CBA_DRAFT_WEIGHTS = {
  overall: 0.45,
  potential: 0.2,
  draftStock: 0.2,
  basketballIQ: 0.05,
  mental: 0.05,
  fame: 0.05,
} as const;

export const NBA_DRAFT_WEIGHTS = {
  overall: 0.5,
  potential: 0.2,
  draftStock: 0.15,
  basketballIQ: 0.05,
  mental: 0.05,
  fame: 0.05,
} as const;

/** 选秀专用 intent bonus（与比赛 INTENT_BONUS 独立） */
export const DRAFT_INTENT_BONUS: Partial<Record<ChoiceIntent, number>> = {
  DECLARE: 5,
  WAIT: 2,
};

export const DRAFT_TIER_THRESHOLDS = {
  LOTTERY_MIN: 82,
  FIRST_ROUND_MIN: 72,
  SECOND_ROUND_MIN: 60,
} as const;

export const DRAFT_PICK_RANGES: Record<
  Exclude<DraftTier, "UNDRAFTED">,
  { best: number; worst: number; valueMin: number; valueMax: number }
> = {
  LOTTERY: { best: 1, worst: 14, valueMin: 82, valueMax: 100 },
  FIRST_ROUND: { best: 15, worst: 30, valueMin: 72, valueMax: 81 },
  SECOND_ROUND: { best: 31, worst: 60, valueMin: 60, valueMax: 71 },
};

export const CBA_DRAFT_TEAMS: ReadonlyArray<{
  maxPick: number;
  name: string;
}> = [
  { maxPick: 5, name: "北极星俱乐部" },
  { maxPick: 14, name: "极光篮球队" },
  { maxPick: 30, name: "长城篮球队" },
  { maxPick: 60, name: "雪狐篮球队" },
];

export const NBA_DRAFT_TEAMS: ReadonlyArray<{
  maxPick: number;
  name: string;
}> = [
  { maxPick: 5, name: "North Star" },
  { maxPick: 14, name: "Northern Lights" },
  { maxPick: 30, name: "Arctic Wolves" },
  { maxPick: 60, name: "Polar Bears" },
];

export const UNDRAFTED_TEAM_NAME = "未选中";

export const DRAFT_ROLE_BY_TIER: Record<DraftTier, PlayerRole> = {
  LOTTERY: "ROTATION",
  FIRST_ROUND: "ROTATION",
  SECOND_ROUND: "BENCH",
  UNDRAFTED: "BENCH",
};

export interface ContractBaseOffer {
  years: number;
  annualSalary: number;
  signingBonus: number;
}

export const CBA_CONTRACT_BY_TIER: Record<DraftTier, ContractBaseOffer> = {
  LOTTERY: { years: 3, annualSalary: 800, signingBonus: 30 },
  FIRST_ROUND: { years: 3, annualSalary: 600, signingBonus: 20 },
  SECOND_ROUND: { years: 2, annualSalary: 350, signingBonus: 10 },
  UNDRAFTED: { years: 1, annualSalary: 100, signingBonus: 3 },
};

export const NBA_CONTRACT_BY_TIER: Record<DraftTier, ContractBaseOffer> = {
  LOTTERY: { years: 4, annualSalary: 2400, signingBonus: 100 },
  FIRST_ROUND: { years: 3, annualSalary: 1600, signingBonus: 70 },
  SECOND_ROUND: { years: 2, annualSalary: 800, signingBonus: 30 },
  UNDRAFTED: { years: 1, annualSalary: 300, signingBonus: 10 },
};

/** 签约名气：按档位给固定增量（非现实联赛） */
export const CONTRACT_FAME_BY_TIER: Record<DraftTier, number> = {
  LOTTERY: 3,
  FIRST_ROUND: 2,
  SECOND_ROUND: 1,
  UNDRAFTED: 1,
};

export const OVERALL_WEIGHTS = {
  shooting: 0.2,
  finishing: 0.15,
  passing: 0.15,
  defense: 0.15,
  physical: 0.1,
  basketballIQ: 0.25,
} as const;

/** 进入各阶段时的年龄 */
export const STAGE_ENTRY_AGE: Record<CareerStage, number> = {
  NORTH_POLE: 12,
  SCHOOL: 15,
  CUBA: 18,
  CBA: 22,
  NBA: 25,
  NATIONAL_TEAM: 28,
  RETIRED: 33,
};

/** 选择带来的正向技能收益放大（改善 Demo 成长手感） */
export const SKILL_GAIN_MULTIPLIER = 2.5;

/** 每升一阶段，六维技能额外提升 */
export const STAGE_ADVANCE_SKILL_BONUS = 4;

export const INITIAL_PLAYER = {
  name: "刘看山",
  age: STAGE_ENTRY_AGE.NORTH_POLE,
  stage: "NORTH_POLE" as const,
  shooting: 52,
  finishing: 50,
  passing: 50,
  defense: 48,
  physical: 55,
  basketballIQ: 48,
  stamina: 78,
  potential: 92,
  mental: 65,
  fame: 0,
  zhihuReputation: 10,
  money: 0,
  team: STAGE_TEAM.NORTH_POLE,
  wins: 0,
  losses: 0,
  draftStock: INITIAL_DRAFT_STOCK,
  role: "BENCH" as const,
  careerScore: 0,
};
