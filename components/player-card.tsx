import Image from "next/image";
import type { PlayerState } from "@/game";
import { getStageCharacterSrc } from "@/lib/event-visuals";
import { getAvatarSrc, KanshanFigure, TIMELINE_LABEL } from "./career-ui";

interface PlayerCardProps {
  player: PlayerState;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const stagePortrait = getStageCharacterSrc(player.stage);

  return (
    <section className="magazine-panel relative overflow-hidden rounded-2xl p-3 sm:p-3.5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-center">
        <div className="hero-shadow court-scene relative overflow-hidden rounded-xl">
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            看山 · 生涯档案
          </div>
          {stagePortrait ? (
            <div className="relative mx-auto flex h-[200px] w-full items-center justify-center sm:h-[220px] lg:h-[240px]">
              <Image
                src={stagePortrait}
                alt={
                  player.stage === "NATIONAL_TEAM"
                    ? "刘看山国家队造型"
                    : "刘看山职业篮球造型"
                }
                width={900}
                height={1200}
                sizes="(max-width: 768px) 70vw, 320px"
                className="h-full w-auto max-w-full object-contain object-center"
                priority
              />
            </div>
          ) : (
            <div className="relative mx-auto flex h-[180px] w-full items-end justify-center sm:h-[200px] lg:h-[220px]">
              <KanshanFigure
                stage={player.stage}
                priority
                className="h-[95%] w-auto drop-shadow-[0_12px_24px_rgba(21,42,72,0.18)]"
              />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-transparent">
              <Image
                src={getAvatarSrc(player.stage)}
                alt=""
                width={197}
                height={208}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
                {player.name}
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                {TIMELINE_LABEL[player.stage]} · {player.team}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-1.5">
            <Meta label="阶段" value={TIMELINE_LABEL[player.stage]} />
            <Meta label="年龄" value={`${player.age} 岁`} />
            <div className="col-span-2">
              <Meta label="球队" value={player.team} />
            </div>
          </dl>

          <div className="flex items-center justify-between rounded-xl bg-ink px-3 py-2.5 text-white">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-orange-soft">
                OVR
              </p>
              <p className="text-xs text-white/65">综合评分</p>
            </div>
            <p className="text-4xl font-semibold tabular-nums leading-none sm:text-5xl">
              {player.overall}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-snow/90 px-2.5 py-1.5">
      <dt className="text-[10px] text-muted">{label}</dt>
      <dd className="truncate text-xs font-semibold text-ink sm:text-sm">
        {value}
      </dd>
    </div>
  );
}
