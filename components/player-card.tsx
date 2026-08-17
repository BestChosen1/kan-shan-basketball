import Image from "next/image";
import type { PlayerState } from "@/game";
import { getStageCharacterSrc } from "@/lib/event-visuals";
import { getAvatarSrc, getNbaArcLabel, KanshanFigure, TIMELINE_LABEL } from "./career-ui";

interface PlayerCardProps {
  player: PlayerState;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const stagePortrait = getStageCharacterSrc(player.stage);
  const nbaArcLabel = getNbaArcLabel(player);

  return (
    <section className="magazine-panel relative overflow-hidden rounded-2xl p-3 sm:p-3.5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-center">
        <div className="hero-shadow relative overflow-hidden rounded-xl">
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            看山 · 生涯档案
          </div>
          {stagePortrait ? (
            /* 不透明球场背景立绘：按相框铺满，避免透明裁切位里的“硬贴图”感 */
            <div className="relative h-[200px] w-full sm:h-[220px] lg:h-[240px]">
              <Image
                src={stagePortrait}
                alt={
                  player.stage === "NATIONAL_TEAM"
                    ? "刘看山国家队造型"
                    : "刘看山职业篮球造型"
                }
                fill
                sizes="(max-width: 768px) 70vw, 320px"
                className="object-cover object-[50%_18%]"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-ink/20" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
            </div>
          ) : (
            <div className="court-scene relative mx-auto flex h-[180px] w-full items-end justify-center sm:h-[200px] lg:h-[220px]">
              <KanshanFigure
                stage={player.stage}
                priority
                className="h-[92%] w-auto drop-shadow-[0_12px_24px_rgba(21,42,72,0.18)]"
              />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-transparent">
              <Image
                src={
                  player.stage === "RETIRED"
                    ? (stagePortrait ?? getAvatarSrc(player.stage))
                    : getAvatarSrc(player.stage)
                }
                alt=""
                width={256}
                height={256}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
                {player.name}
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                {TIMELINE_LABEL[player.stage]}
                {nbaArcLabel ? ` · ${nbaArcLabel}` : ""} · {player.team}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-1.5">
            <Meta
              label="阶段"
              value={
                nbaArcLabel
                  ? `${TIMELINE_LABEL[player.stage]} · ${nbaArcLabel}`
                  : TIMELINE_LABEL[player.stage]
              }
            />
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
