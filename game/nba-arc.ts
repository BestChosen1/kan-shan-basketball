import type { NbaArcPhase, PlayerRole, PlayerState } from "./types.ts";

/** 赛季循环中按生涯弧光分流的插槽 */
export type NbaArcSlot = "early" | "mid" | "late";

export const NBA_ARC_PHASES: readonly NbaArcPhase[] = [
  "ROOKIE",
  "ROTATION",
  "STARTER",
  "ALL_STAR",
  "SUPERSTAR",
  "VETERAN",
] as const;

export const NBA_ARC_PHASE_LABEL: Record<NbaArcPhase, string> = {
  ROOKIE: "新秀时期",
  ROTATION: "轮换时期",
  STARTER: "首发时期",
  ALL_STAR: "全明星时期",
  SUPERSTAR: "超级巨星时期",
  VETERAN: "老将时期",
};

/** goToEvent 用的哨兵 ID，运行时解析为阶段专属事件 */
export const NBA_ARC_SENTINEL = {
  early: "__nba_arc_early__",
  mid: "__nba_arc_mid__",
  late: "__nba_arc_late__",
} as const;

const ARC_EVENT_BY_PHASE: Record<NbaArcPhase, Record<NbaArcSlot, string>> = {
  ROOKIE: {
    early: "nba-arc-rookie-wall",
    mid: "nba-arc-rookie-coach",
    late: "nba-arc-rookie-showcase",
  },
  ROTATION: {
    early: "nba-arc-rotation-minutes",
    mid: "nba-arc-rotation-spark",
    late: "nba-arc-rotation-prove",
  },
  STARTER: {
    early: "nba-arc-starter-weight",
    mid: "nba-arc-starter-media",
    late: "nba-arc-starter-lock",
  },
  ALL_STAR: {
    early: "nba-arc-as-expectation",
    mid: "nba-arc-as-campaign",
    late: "nba-arc-as-statement",
  },
  SUPERSTAR: {
    early: "nba-arc-super-target",
    mid: "nba-arc-mvp-race",
    late: "nba-arc-legacy-night",
  },
  VETERAN: {
    early: "nba-arc-vet-body",
    mid: "nba-arc-vet-mentor",
    late: "nba-arc-vet-ring",
  },
};

/**
 * 按年龄 + 综合评分（辅以 nbaSeason）判定 NBA 生涯弧光阶段。
 * 老将优先于高分标签；新秀窗口优先于低分段轮换。
 */
export function resolveNbaArcPhase(
  player: Pick<PlayerState, "age" | "overall" | "nbaSeason">,
): NbaArcPhase {
  const { age, overall, nbaSeason } = player;

  if (age >= 34 || (age >= 32 && nbaSeason >= 7)) {
    return "VETERAN";
  }

  if (nbaSeason <= 2 && age <= 26 && overall < 80) {
    return "ROOKIE";
  }

  if (overall >= 90) {
    return "SUPERSTAR";
  }
  if (overall >= 84) {
    return "ALL_STAR";
  }
  if (overall >= 76) {
    return "STARTER";
  }
  if (overall >= 68 || nbaSeason >= 3) {
    return "ROTATION";
  }

  if (nbaSeason <= 2 && age < 28) {
    return "ROOKIE";
  }

  return "ROTATION";
}

export function resolveNbaArcEventId(
  phase: NbaArcPhase,
  slot: NbaArcSlot,
): string {
  return ARC_EVENT_BY_PHASE[phase][slot];
}

export function resolveNbaArcSentinel(
  sentinelId: string,
  player: Pick<PlayerState, "age" | "overall" | "nbaSeason">,
): string | null {
  if (sentinelId === NBA_ARC_SENTINEL.early) {
    return resolveNbaArcEventId(resolveNbaArcPhase(player), "early");
  }
  if (sentinelId === NBA_ARC_SENTINEL.mid) {
    return resolveNbaArcEventId(resolveNbaArcPhase(player), "mid");
  }
  if (sentinelId === NBA_ARC_SENTINEL.late) {
    return resolveNbaArcEventId(resolveNbaArcPhase(player), "late");
  }
  return null;
}

/** 弧光阶段映射到场上角色（展示与比赛加成） */
export function roleFromNbaArcPhase(phase: NbaArcPhase): PlayerRole {
  switch (phase) {
    case "ROOKIE":
      return "ROTATION";
    case "ROTATION":
      return "ROTATION";
    case "STARTER":
      return "STARTER";
    case "ALL_STAR":
    case "SUPERSTAR":
      return "STAR";
    case "VETERAN":
      return "STARTER";
    default:
      return "ROTATION";
  }
}
