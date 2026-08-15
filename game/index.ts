export type {
  CareerHistoryEntry,
  CareerStage,
  Choice,
  ChoiceEffects,
  GameEvent,
  PlayerState,
} from "./types.ts";

export {
  CAREER_STAGE_ORDER,
  INITIAL_PLAYER,
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
