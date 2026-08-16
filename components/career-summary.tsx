"use client";

import Image from "next/image";
import {
  CAREER_FLAG_LABEL,
  CAREER_TIER_LABEL,
  type PlayerState,
} from "@/game";
import { CHAMPION_VISUAL_SRC, getStageCharacterSrc } from "@/lib/event-visuals";
import {
  UI_AWARD_LABEL,
  UI_TROPHY_LABEL,
} from "./game-result-overlay";
import { getAvatarSrc, KanshanFigure, TIMELINE_LABEL } from "./career-ui";

interface CareerSummaryProps {
  player: PlayerState;
  onRestart: () => void;
}

export function CareerSummary({ player, onRestart }: CareerSummaryProps) {
  const hasNbaChampion = player.trophies.some(
    (trophy) => trophy.id === "NBA_CHAMPION",
  );
  const heroSrc = hasNbaChampion
    ? CHAMPION_VISUAL_SRC
    : getStageCharacterSrc("NBA");

  const tierLabel = player.careerTier
    ? CAREER_TIER_LABEL[player.careerTier]
    : "未评定";

  const stagesTouched = Array.from(
    new Set(player.careerHistory.map((entry) => TIMELINE_LABEL[entry.stage])),
  ).join(" → ");

  return (
    <section className="magazine-panel animate-fade-up overflow-hidden rounded-2xl">
      <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="arctic-scene relative flex flex-col justify-between p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 court-scene opacity-35" />
          <div className="relative z-10 flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-transparent">
              <Image
                src={getAvatarSrc("RETIRED")}
                alt="刘看山头像"
                width={197}
                height={207}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
              退役 · {player.age} 岁
            </span>
          </div>
          <div className="relative z-10 mx-auto mt-1 flex h-[220px] w-full max-w-[240px] items-end justify-center sm:h-[280px]">
            {heroSrc ? (
              <Image
                src={heroSrc}
                alt={
                  hasNbaChampion
                    ? "刘看山冠军时刻"
                    : "刘看山职业篮球生涯"
                }
                width={900}
                height={1200}
                className="h-full w-auto max-w-full object-contain drop-shadow-[0_16px_28px_rgba(21,42,72,0.2)]"
                priority
              />
            ) : (
              <KanshanFigure
                stage="RETIRED"
                priority
                className="h-full w-auto drop-shadow-[0_16px_28px_rgba(21,42,72,0.2)]"
              />
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-ice-deep">
            CAREER COMPLETE
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            刘看山的篮球生涯
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            从 12 岁北极启程，到 {player.age} 岁退役。共经历{" "}
            {player.careerHistory.length} 个关键时刻。
          </p>

          <div className="mt-4 rounded-xl bg-ink px-4 py-3 text-white">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-orange-soft">
              CAREER TIER
            </p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <p className="text-2xl font-semibold">{tierLabel}</p>
              <p className="text-sm tabular-nums text-white/75">
                {player.careerScore}
                <span className="text-white/45"> / 1000</span>
              </p>
            </div>
          </div>

          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <SummaryItem
              label="最终 OVR"
              value={String(player.overall)}
              emphasize
            />
            <SummaryItem
              label="战绩"
              value={`${player.wins} 胜 · ${player.losses} 负`}
            />
            <SummaryItem
              label="生涯阶段"
              value={stagesTouched || TIMELINE_LABEL.RETIRED}
            />
            <SummaryItem label="名气" value={String(player.fame)} />
          </dl>

          {player.flags.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                生涯轨迹标签
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {player.flags.map((flag) => (
                  <li
                    key={flag}
                    className="rounded-full border border-border bg-[#f7fafc] px-2.5 py-1 text-xs font-semibold text-ink"
                  >
                    {CAREER_FLAG_LABEL[flag]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <HonorList
            title="奖杯"
            empty="暂无奖杯"
            items={player.trophies.map((trophy) => UI_TROPHY_LABEL[trophy.id])}
          />
          <HonorList
            title="个人荣誉"
            empty="暂无个人荣誉"
            items={player.awards.map((award) => UI_AWARD_LABEL[award.id])}
          />

          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              选秀记录
            </p>
            {player.draftHistory.length === 0 ? (
              <p className="mt-1 text-sm text-muted">无</p>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {player.draftHistory.map((draft) => (
                  <li
                    key={`${draft.eventId}-${draft.pick}`}
                    className="text-sm text-ink"
                  >
                    {draft.league} ·{" "}
                    {draft.tier === "UNDRAFTED"
                      ? "落选"
                      : `第 ${draft.pick} 顺位`}{" "}
                    · {draft.teamName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              合同
            </p>
            {player.contracts.length === 0 ? (
              <p className="mt-1 text-sm text-muted">无</p>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {player.contracts.map((contract) => (
                  <li key={contract.id} className="text-sm text-ink">
                    {contract.league} · {contract.teamName} · {contract.years}{" "}
                    年 · 年薪 {contract.annualSalary} · 签字费{" "}
                    {contract.signingBonus}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange/90 active:scale-[0.98]"
          >
            重新开始
          </button>
        </div>
      </div>
    </section>
  );
}

function HonorList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: string[];
}) {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border bg-[#f7fafc] px-2.5 py-1 text-xs font-semibold text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-[#f7fafc] px-3 py-2.5">
      <dt className="text-[10px] text-muted">{label}</dt>
      <dd
        className={`mt-0.5 font-semibold ${
          emphasize ? "text-xl text-orange" : "text-sm text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
