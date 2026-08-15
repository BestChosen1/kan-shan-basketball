import type { PlayerState } from "@/game";
import { SKILL_DISPLAY } from "./career-ui";

interface PlayerStatsProps {
  player: PlayerState;
  highlightKeys?: string[];
}

export function PlayerStats({ player, highlightKeys = [] }: PlayerStatsProps) {
  const highlight = new Set(highlightKeys);

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-ice">核心属性</h3>
        <p className="text-xs text-muted">实时读取 PlayerState</p>
      </div>

      <ul className="space-y-3">
        {SKILL_DISPLAY.map((stat) => {
          const value = player[stat.key];
          const percent = Math.max(0, Math.min(100, (value / stat.max) * 100));
          const active = highlight.has(stat.key);

          return (
            <li key={stat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className={active ? "text-orange-soft" : "text-foreground/90"}>
                  {stat.label}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    active ? "text-orange-soft" : "text-white"
                  }`}
                >
                  {value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
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
