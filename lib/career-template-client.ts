import type { PlayerState } from "@/game";
import type { CareerTemplateOutput } from "@/agent/schemas";

export type CareerTemplateClientResult =
  | { ok: true; data: CareerTemplateOutput }
  | { ok: false; error: { code: string; message: string } };

export function buildCareerTemplateRequestPlayer(player: PlayerState) {
  return {
    name: player.name,
    age: player.age,
    team: player.team,
    overall: player.overall,
    role: player.role,
    nbaSeason: player.nbaSeason,
    shooting: player.shooting,
    finishing: player.finishing,
    passing: player.passing,
    defense: player.defense,
    physical: player.physical,
    basketballIQ: player.basketballIQ,
    stamina: player.stamina,
    mental: player.mental,
    fame: player.fame,
    wins: player.wins,
    losses: player.losses,
    careerScore: player.careerScore,
    careerTier: player.careerTier,
    flags: player.flags,
    careerHistory: player.careerHistory.map((entry) => ({
      eventId: entry.eventId,
      stage: entry.stage,
      eventTitle: entry.eventTitle,
      choiceId: entry.choiceId,
      choiceText: entry.choiceText,
    })),
  };
}

/**
 * Browser → POST /api/career-template
 * 仅用于结算页「生涯模版」展示；失败由调用方显示 fallback UI。
 */
export async function requestCareerTemplate(
  player: PlayerState,
  options: { signal?: AbortSignal } = {},
): Promise<CareerTemplateClientResult> {
  let response: Response;
  try {
    response = await fetch("/api/career-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player: buildCareerTemplateRequestPlayer(player),
      }),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return {
      ok: false,
      error: { code: "NETWORK", message: "Network error" },
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      error: { code: "INVALID_RESPONSE", message: "Invalid JSON" },
    };
  }

  if (
    body &&
    typeof body === "object" &&
    "ok" in body &&
    (body as { ok: unknown }).ok === true &&
    "data" in body
  ) {
    return {
      ok: true,
      data: (body as { data: CareerTemplateOutput }).data,
    };
  }

  const errorBody =
    body && typeof body === "object" && "error" in body
      ? (body as { error?: { code?: string; message?: string } }).error
      : undefined;

  return {
    ok: false,
    error: {
      code: errorBody?.code ?? "UNKNOWN",
      message: errorBody?.message ?? "Career template request failed",
    },
  };
}

export const PLAYSTYLE_LABEL: Record<string, string> = {
  SCORING: "得分",
  SHOOTING: "投射",
  DEFENSE: "防守",
  PLAYMAKING: "组织",
  PHYSICAL: "身体",
  IQ: "球商",
  TWO_WAY: "攻防一体",
  ROLE: "角色球员",
};

export const TEMPERAMENT_LABEL: Record<string, string> = {
  HOT_HEADED: "脾气火爆",
  EMOTIONAL: "情绪化",
  MILD: "性格温和",
  HUSTLE: "拼劲十足",
  MEDIA_REACTIVE: "舆论敏感",
  TEAM_FIRST: "团队优先",
  RISK_TAKER: "敢于冒险",
  RESILIENT: "韧性强",
};
