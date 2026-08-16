export type {
  CareerHistoryEntry,
  CareerStage,
  Choice,
  ChoiceEffects,
  EventVisualType,
  GameEvent,
  PlayerState,
} from "./types.ts";

export {
  CAREER_STAGE_ORDER,
  INITIAL_PLAYER,
  SKILL_GAIN_MULTIPLIER,
  STAGE_ENTRY_AGE,
  STAGE_LABEL,
  STAGE_TEAM,
} from "./constants.ts";

export { CAREER_EVENTS, getEventById, getEventsByStage } from "./events.ts";

export {
  advanceEvent,
  advanceStage,
  applyChoice,
  calculateOverall,
  createInitialPlayer,
  getCurrentEvent,
  getNextStage,
  isCareerFinished,
  isStageComplete,
  restartCareer,
} from "./engine.ts";
