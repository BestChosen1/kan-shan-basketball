import Image from "next/image";
import type { PlayerState } from "@/game";
import { KANSHAN_ASSETS, TIMELINE_LABEL } from "./career-ui";

interface PlayerCardProps {
  player: PlayerState;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <section className="magazine-panel relative overflow-hidden rounded-2xl p-3 sm:p-3.5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-center">
        <div className="hero-shadow court-scene relative overflow-hidden rounded-xl">
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            看山 · 生涯档案
          </div>
          <div className="relative mx-auto h-[168px] w-full max-w-[220px] sm:h-[190px] lg:h-[200px]">
            <Image
              src={KANSHAN_ASSETS.hero}
              alt="刘看山"
              fill
              sizes="(max-width: 768px) 60vw, 220px"
              className="object-contain object-center p-2"
              priority
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
              {player.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              {TIMELINE_LABEL[player.stage]} · {player.team}
            </p>
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
      <dd className="truncate text-xs font-semibold text-ink sm:text-sm">{value}</dd>
    </div>
  );
}
