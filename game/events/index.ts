import type { GameEvent } from "../types.ts";
import { CBA_EVENTS } from "./cba.ts";
import { CUBA_EVENTS } from "./cuba.ts";
import { NATIONAL_TEAM_EVENTS } from "./national-team.ts";
import { NBA_EVENTS } from "./nba.ts";
import { NORTH_POLE_EVENTS } from "./north-pole.ts";
import { SCHOOL_EVENTS } from "./school.ts";

export const CAREER_EVENTS: GameEvent[] = [
  ...NORTH_POLE_EVENTS,
  ...SCHOOL_EVENTS,
  ...CUBA_EVENTS,
  ...CBA_EVENTS,
  ...NBA_EVENTS,
  ...NATIONAL_TEAM_EVENTS,
];

export function getEventsByStage(stage: GameEvent["stage"]): GameEvent[] {
  return CAREER_EVENTS.filter((event) => event.stage === stage);
}

export function getEventById(id: string): GameEvent | undefined {
  return CAREER_EVENTS.find((event) => event.id === id);
}
