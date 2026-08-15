export type CareerStage =
  | "NORTH_POLE"
  | "SCHOOL"
  | "CUBA"
  | "CBA"
  | "NBA"
  | "NATIONAL_TEAM"
  | "RETIRED";

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

export type ChoiceEffects = Partial<Record<ClampStat | "money", number>>;

export interface Choice {
  id: string;
  text: string;
  effects: ChoiceEffects;
}

export interface GameEvent {
  id: string;
  stage: CareerStage;
  title: string;
  description: string;
  kanShanDialogue: string;
  choices: [Choice, Choice, Choice];
  nextStageAfterComplete?: CareerStage;
}

export interface CareerHistoryEntry {
  eventId: string;
  stage: CareerStage;
  eventTitle: string;
  choiceId: string;
  choiceText: string;
  timestamp: number;
}

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

  trophies: string[];

  careerHistory: CareerHistoryEntry[];

  currentEventId: string | null;

  isGameOver: boolean;
}
