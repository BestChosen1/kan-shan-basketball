import Image from "next/image";
import type { CareerStage } from "@/game";

/** 彩色透明四视图拼图（前→左→右→后），仅作角色参考 */
export const KANSHAN_SHEETS = {
  standard: "/assets/kanshan/raw/png/刘看山四视图.png",
  scarf: "/assets/kanshan/raw/png/刘看山围脖四视图.png",
} as const;

export const KANSHAN_ASSETS = {
  /** 圆形头像：正方形透明底，按白身躯光学居中 */
  avatar: "/assets/kanshan/web/kanshan-avatar.png",
  avatarScarf: "/assets/kanshan/web/kanshan-avatar-scarf.png",
  /** 档案大立绘：透明正面单帧 */
  figure: "/assets/kanshan/processed/standard/kanshan-front.png",
  figureScarf: "/assets/kanshan/processed/scarf/kanshan-front.png",
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
 * 使用已居中的透明正面单帧，避免四视图裁切导致的偏左。
 */
export function KanshanFigure({
  stage = "CUBA",
  variant,
  className = "",
  priority = false,
  alt = "刘看山",
}: KanshanFigureProps) {
  const src =
    variant === "scarf"
      ? KANSHAN_ASSETS.figureScarf
      : variant === "standard"
        ? KANSHAN_ASSETS.figure
        : stage === "NORTH_POLE" || stage === "SCHOOL"
          ? KANSHAN_ASSETS.figureScarf
          : KANSHAN_ASSETS.figure;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <Image
        src={src}
        alt={alt}
        width={256}
        height={256}
        priority={priority}
        className="h-full w-full select-none object-contain object-center"
        sizes="(max-width: 768px) 50vw, 280px"
      />
    </div>
  );
}
