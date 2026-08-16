/** Client-safe Career Agent types（不依赖 agent/server）。 */

export type CareerAgentClientStage =
  | "NORTH_POLE"
  | "SCHOOL"
  | "CUBA"
  | "CBA"
  | "NBA"
  | "NATIONAL_TEAM"
  | "RETIRED";

export type CareerAgentClientTrigger =
  | "EVENT_ENTER"
  | "EVENT_RESULT"
  | "STAGE_CHANGE"
  | "CAREER_COMPLETE";

export interface CareerAgentClientPlayer {
  name: string;
  age: number;
  team: string;
  overall: number;
  role: string;
}

export interface CareerAgentClientMatch {
  won?: boolean;
  performance?: number;
}

export interface CareerAgentClientDraft {
  league?: string;
  pick?: number;
  teamName?: string;
}

export interface CareerAgentClientContext {
  stage: CareerAgentClientStage;
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  player: CareerAgentClientPlayer;
  match?: CareerAgentClientMatch;
  draft?: CareerAgentClientDraft;
  trigger: CareerAgentClientTrigger;
}

export interface CareerAgentClientSource {
  title: string;
  author: string | null;
  excerpt: string;
  url: string;
}

export interface CareerAgentClientOutput {
  status: "NOT_NEEDED" | "SUCCESS" | "NO_RESULTS" | "UNAVAILABLE";
  headline: string;
  summary: string;
  query: string | null;
  sources: CareerAgentClientSource[];
}

export type ZhihuCardStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type CareerAgentClientResult =
  | { ok: true; data: CareerAgentClientOutput }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };
