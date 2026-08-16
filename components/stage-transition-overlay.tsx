"use client";

import Image from "next/image";
import type { CareerStage } from "@/game";
import { getStageCharacterSrc } from "@/lib/event-visuals";
import { getAvatarSrc, KANSHAN_ASSETS } from "./career-ui";

interface StageTransitionOverlayProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  toStage: CareerStage;
  onContinue: () => void;
}

export function StageTransitionOverlay({
  eyebrow,
  title,
  subtitle,
  toStage,
  onContinue,
}: StageTransitionOverlayProps) {
  const stagePortrait = getStageCharacterSrc(toStage);
  const avatarSrc =
    toStage === "NORTH_POLE" || toStage === "SCHOOL"
      ? KANSHAN_ASSETS.avatarScarf
      : getAvatarSrc(toStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1b2d]/45 px-3 backdrop-blur-[2px] sm:px-4">
      <div className="animate-stage-in magazine-panel w-full max-w-md overflow-hidden rounded-3xl text-center">
        <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-transparent sm:mt-8">
          {stagePortrait ? (
            <Image
              src={stagePortrait}
              alt=""
              width={200}
              height={260}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Image
              src={avatarSrc}
              alt="刘看山"
              width={197}
              height={208}
              className="h-full w-full object-contain p-2"
            />
          )}
        </div>
        <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-ice-deep">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange/90 active:scale-[0.98]"
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
}
