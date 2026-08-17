export type CareerStage =
  | "NORTH_POLE"
  | "SCHOOL"
  | "CUBA"
  | "CBA"
  | "NBA"
  | "NATIONAL_TEAM"
  | "RETIRED";

export type EventVisualType =
  | "NONE"
  | "SHOOT"
  | "DEFENSE"
  | "DRIVE"
  | "CELEBRATE"
  | "CHAMPION";

export type EventKind = "STORY" | "MATCH" | "DRAFT" | "CONTRACT";

export type PlayerRole = "BENCH" | "ROTATION" | "STARTER" | "STAR";

/** NBA 生涯弧光阶段（由年龄 + 综合评分计算） */
export type NbaArcPhase =
  | "ROOKIE"
  | "ROTATION"
  | "STARTER"
  | "ALL_STAR"
  | "SUPERSTAR"
  | "VETERAN";

export type CareerTier =
  | "LEGEND"
  | "SUPERSTAR"
  | "STAR"
  | "STARTER"
  | "ROLE_PLAYER"
  | "JOURNEYMAN";

export type TrophyId =
  | "CUBA_CHAMPION"
  | "CBA_CHAMPION"
  | "NBA_CHAMPION"
  | "ASIA_GOLD"
  | "WORLD_MEDAL";

export type AwardId = "FMVP" | "DPOY_LIKE" | "ALL_STAR_LIKE" | "MVP_LIKE";

export type LeagueId = "CBA" | "NBA";

export type MatchStakes = "REGULAR" | "FINAL" | "PLAYOFF";

export type ChoiceIntent =
  | "SCORE"
  | "DEFEND"
  | "TEAM"
  | "SAFE"
  | "RISK"
  | "DECLARE"
  | "WAIT";

/** 生涯分叉旗标（由选择 set/clear，用于事件门控） */
export type CareerFlag =
  | "SCHOOL_STAR"
  | "SCHOOL_GRIND"
  | "DECLARED_EARLY"
  | "STAYED_CUBA"
  | "SKIPPED_DRAFT"
  | "SKIPPED_CUBA"
  | "SKIPPED_CBA"
  | "DOMESTIC_FOCUS"
  | "NBA_BOUND"
  | "NBA_BUST"
  | "NT_CALLED"
  | "NT_DONE"
  | "EARLY_RETIRE"
  | "INJURY_PRONE"
  | "MEDIA_BACKLASH";

export type SkillStat =
  | "shooting"
  | "finishing"
  | "passing"
  | "defense"
  | "physical"
  | "basketballIQ";

export type ClampStat =
  | SkillStat
  | "stamina"
  | "potential"
  | "mental"
  | "fame"
  | "zhihuReputation";

export type ChoiceEffects = Partial<
  Record<ClampStat | "money" | "draftStock", number>
>;

export interface Choice {
  id: string;
  text: string;
  effects: ChoiceEffects;
  intent?: ChoiceIntent;
  nextEventId?: string;
  nextStage?: CareerStage;
  setFlags?: CareerFlag[];
  clearFlags?: CareerFlag[];
  /** NBA 休赛期续约下一季：年龄 +1，nbaSeason +1 */
  advanceNbaSeason?: boolean;
}

export interface MatchConfig {
  opponentStrength: number;
  stakes: MatchStakes;
}

export interface DraftConfig {
  league: LeagueId;
}

export interface ContractConfig {
  league: LeagueId;
}

export interface GameEvent {
  id: string;
  stage: CareerStage;
  title: string;
  description: string;
  kanShanDialogue: string;
  choices: [Choice, Choice, Choice];
  visualType: EventVisualType;
  eventKind: EventKind;
  matchConfig?: MatchConfig;
  draftConfig?: DraftConfig;
  contractConfig?: ContractConfig;
  nextStageAfterComplete?: CareerStage;
  nextEventId?: string;
  requiresFlags?: CareerFlag[];
  excludesFlags?: CareerFlag[];
}

export interface CareerHistoryEntry {
  eventId: string;
  stage: CareerStage;
  eventTitle: string;
  choiceId: string;
  choiceText: string;
  timestamp: number;
}

/** 生涯历史记录列表 */
export type CareerHistory = CareerHistoryEntry[];

export interface MatchResult {
  eventId: string;
  stage: CareerStage;
  won: boolean;
  playerScore: number;
  opponentScore: number;
  performance: number;
  stakes: MatchStakes;
  draftStockDelta: number;
  fameDelta: number;
  staminaDelta: number;
  highlight: string;
  trophyId?: TrophyId;
}

export type DraftTier =
  | "LOTTERY"
  | "FIRST_ROUND"
  | "SECOND_ROUND"
  | "UNDRAFTED";

export interface DraftResult {
  eventId: string;
  league: LeagueId;
  pick: number;
  tier: DraftTier;
  teamName: string;
  draftValue: number;
  message: string;
}

export interface Contract {
  id: string;
  league: LeagueId;
  teamName: string;
  years: number;
  annualSalary: number;
  signingBonus: number;
  signedAtEventId: string;
}

export interface ContractResult {
  contract: Contract;
  summary: string;
  /** 签约带来的名气增量（由 engine 写入 PlayerState） */
  fameDelta: number;
}

export interface Trophy {
  id: TrophyId;
  name: string;
  stage: CareerStage;
  eventId: string;
}

export interface Award {
  id: AwardId;
  name: string;
  stage: CareerStage;
  eventId: string;
}

export interface AwardResult {
  trophies: Trophy[];
  awards: Award[];
  fameDelta: number;
}

export type GameOutcome =
  | {
      kind: "MATCH";
      result: MatchResult;
      awards: AwardResult;
    }
  | {
      kind: "DRAFT";
      result: DraftResult;
      contract: ContractResult;
    }
  | {
      kind: "CONTRACT";
      result: Contract;
    }
  | {
      kind: "STORY";
      summary: string;
    };

export interface PlayerState {
  name: string;
  age: number;
  stage: CareerStage;

  overall: number;

  shooting: number;
  finishing: number;
  passing: number;
  defense: number;
  physical: number;
  basketballIQ: number;
  stamina: number;

  potential: number;
  mental: number;

  fame: number;
  zhihuReputation: number;

  money: number;

  team: string;

  trophies: Trophy[];
  awards: Award[];

  careerHistory: CareerHistory;

  currentEventId: string | null;

  isGameOver: boolean;

  wins: number;
  losses: number;

  matchHistory: MatchResult[];
  draftHistory: DraftResult[];
  contracts: Contract[];

  draftStock: number;
  role: PlayerRole;

  lastOutcome: GameOutcome | null;

  careerScore: number;
  careerTier: CareerTier | null;

  flags: CareerFlag[];

  /** 已完成 / 当前所处的 NBA 赛季数；0 表示尚未进入 NBA */
  nbaSeason: number;
}
