import Image from "next/image";
import type { CareerStage } from "@/game";

/** 彩色透明四视图拼图（前→左→右→后），仅裁切「前」视图用于展示 */
export const KANSHAN_SHEETS = {
  standard: "/assets/kanshan/raw/png/刘看山四视图.png",
  scarf: "/assets/kanshan/raw/png/刘看山围脖四视图.png",
} as const;

export const KANSHAN_ASSETS = {
  /** 头像：透明单帧 */
  avatar: "/assets/kanshan/processed/standard/kanshan-front.png",
  avatarScarf: "/assets/kanshan/processed/scarf/kanshan-front.png",
  /** 不再使用白底 JPG / 四视图档案条 */
  hero: KANSHAN_SHEETS.standard,
  reference: KANSHAN_SHEETS.standard,
} as const;

export function getAvatarSrc(stage: CareerStage): string {
  if (stage === "NORTH_POLE" || stage === "SCHOOL") {
    return KANSHAN_ASSETS.avatarScarf;
  }
  return KANSHAN_ASSETS.avatar;
}

export function getHeroSheet(stage: CareerStage): string {
  if (stage === "NORTH_POLE" || stage === "SCHOOL") {
    return KANSHAN_SHEETS.scarf;
  }
  return KANSHAN_SHEETS.standard;
}

interface KanshanFigureProps {
  stage?: CareerStage;
  /** scarf | standard；若提供 stage 则按阶段自动选择 */
  variant?: "standard" | "scarf";
  className?: string;
  priority?: boolean;
  alt?: string;
}

/**
 * 从透明四视图 PNG 裁切「正面」一格并放大显示，避免白底 JPG。
 */
export function KanshanFigure({
  stage = "CUBA",
  variant,
  className = "",
  priority = false,
  alt = "刘看山",
}: KanshanFigureProps) {
  const sheet =
    variant === "scarf"
      ? KANSHAN_SHEETS.scarf
      : variant === "standard"
        ? KANSHAN_SHEETS.standard
        : getHeroSheet(stage);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: "197 / 208" }}
    >
      <Image
        src={sheet}
        alt={alt}
        width={787}
        height={208}
        priority={priority}
        className="absolute left-0 top-0 h-full w-auto max-w-none select-none"
        sizes="(max-width: 768px) 50vw, 280px"
      />
    </div>
  );
}
