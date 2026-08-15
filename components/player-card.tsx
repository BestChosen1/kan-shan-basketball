import { STAGE_LABEL, type PlayerState } from "@/game";
import { TIMELINE_LABEL } from "./career-ui";

interface PlayerCardProps {
  player: PlayerState;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-ice-deep/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-orange/20 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="animate-float-soft flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-white/15 to-white/5 text-5xl shadow-inner sm:h-32 sm:w-32">
          <span aria-hidden>🦊</span>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ice/70">主角</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {player.name}
            </h2>
          </div>

          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <dt className="text-muted">年龄</dt>
              <dd className="font-medium text-white">{player.age} 岁</dd>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <dt className="text-muted">球队</dt>
              <dd className="truncate font-medium text-white">{player.team}</dd>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <dt className="text-muted">阶段</dt>
              <dd className="font-medium text-white">
                {TIMELINE_LABEL[player.stage]}
                <span className="ml-1 text-xs text-muted">
                  ({STAGE_LABEL[player.stage]})
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="animate-pulse-glow flex shrink-0 flex-col items-center justify-center rounded-2xl border border-orange/40 bg-gradient-to-b from-orange/25 to-orange/5 px-6 py-4 sm:min-w-[120px]">
          <span className="text-xs font-medium tracking-[0.2em] text-orange-soft">
            OVR
          </span>
          <span className="text-5xl font-semibold tabular-nums text-white">
            {player.overall}
          </span>
        </div>
      </div>
    </section>
  );
}
