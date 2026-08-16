import type { CareerStage, EventVisualType } from "@/game";

/** UI 层事件插图路径（禁止写入 game/） */
export const EVENT_VISUAL_SRC: Partial<Record<EventVisualType, string>> = {
  SHOOT: "/assets/kanshan/web/actions/kanshan-shoot.webp",
  DEFENSE: "/assets/kanshan/web/actions/kanshan-defense.webp",
  CELEBRATE: "/assets/kanshan/web/actions/kanshan-celebrate.webp",
  CHAMPION: "/assets/kanshan/web/achievements/kanshan-champion.webp",
};

/** 按阶段的 UI 主角色立绘（不写入 PlayerState） */
export const STAGE_CHARACTER_SRC: Partial<Record<CareerStage, string>> = {
  NBA: "/assets/kanshan/web/characters/kanshan-basketball.webp",
  NATIONAL_TEAM: "/assets/kanshan/web/characters/kanshan-national-team.webp",
};

export const EVENT_VISUAL_ALT: Partial<Record<EventVisualType, string>> = {
  SHOOT: "刘看山投篮瞬间",
  DEFENSE: "刘看山防守瞬间",
  CELEBRATE: "刘看山庆祝瞬间",
  CHAMPION: "刘看山冠军时刻",
};

export function getEventVisualSrc(
  visualType: EventVisualType | undefined,
): string | null {
  if (!visualType || visualType === "NONE" || visualType === "DRIVE") {
    return null;
  }
  return EVENT_VISUAL_SRC[visualType] ?? null;
}

export function getStageCharacterSrc(stage: CareerStage): string | null {
  return STAGE_CHARACTER_SRC[stage] ?? null;
}
