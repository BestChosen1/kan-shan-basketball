"use client";

import Image from "next/image";
import type { PlayerState } from "@/game";
import { CAREER_TIER_LABEL } from "@/game";
import { getAvatarSrc, TIMELINE_LABEL } from "./career-ui";

interface CareerEndingCeremonyProps {
  player: PlayerState;
  onContinue: () => void;
}

export function CareerEndingCeremony({
  player,
  onContinue,
}: CareerEndingCeremonyProps) {
  const tierLabel = player.careerTier
    ? CAREER_TIER_LABEL[player.careerTier]
    : "未评定";

  return (
    <div className="ending-ceremony fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-4">
      <div className="ending-ceremony-bg absolute inset-0" />
      <div className="ending-particles pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="ending-avatar relative mb-6 h-24 w-24 overflow-hidden rounded-full border border-white/25 shadow-[0_0_40px_rgba(255,138,61,0.35)] sm:h-28 sm:w-28">
          <Image
            src={getAvatarSrc(player.stage)}
            alt="刘看山"
            fill
            sizes="112px"
            className="object-cover object-center"
            priority
          />
        </div>

        <p className="ending-eyebrow text-[11px] font-semibold tracking-[0.28em] text-orange-soft">
          CAREER FINALE
        </p>

        <h1 className="ending-title mt-3 text-[1.85rem] font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          刘看山的篮球生涯
        </h1>

        <div className="ending-rule mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-orange-soft to-transparent" />

        <p className="ending-sub mt-4 max-w-sm text-sm leading-6 text-white/75">
          {player.age} 岁退役 · {TIMELINE_LABEL[player.stage]}
          {player.nbaSeason > 0 ? ` · NBA ${player.nbaSeason} 季` : ""}
          <br />
          生涯评级 {tierLabel} · OVR {player.overall}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="ending-cta mt-8 inline-flex min-w-[12rem] items-center justify-center rounded-2xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(232,93,4,0.4)] transition-all hover:bg-orange/90 active:scale-[0.98]"
        >
          查看生涯档案
        </button>
      </div>
    </div>
  );
}
