import type { PlayerState } from "@/game";
import { CORE_STATS } from "./career-ui";

interface PlayerStatsProps {
  player: PlayerState;
  highlightKeys?: string[];
}

export function PlayerStats({ player, highlightKeys = [] }: PlayerStatsProps) {
  const highlight = new Set(highlightKeys);

  return (
    <section className="magazine-panel h-full rounded-2xl p-3 sm:p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">核心属性</h3>
        <span className="text-[10px] text-muted">实时 PlayerState</span>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {CORE_STATS.map((stat) => {
          const value = player[stat.key];
          const percent = Math.max(0, Math.min(100, (value / stat.max) * 100));
          const active = highlight.has(stat.key);

          return (
            <li key={stat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={active ? "font-medium text-orange" : "text-ink/85"}>
                  {stat.label}
                </span>
                <span
                  className={`tabular-nums font-semibold ${
                    active ? "text-orange" : "text-ink"
                  }`}
                >
                  {value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e7eef6]">
                <div
                  className={`h-full rounded-full transition-all duration-400 ${
                    active
                      ? "bg-gradient-to-r from-orange to-orange-soft"
                      : "bg-gradient-to-r from-ice-deep to-ice"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
