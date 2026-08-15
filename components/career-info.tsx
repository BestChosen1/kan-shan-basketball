import type { PlayerState } from "@/game";
import { formatMoney } from "./career-ui";

interface CareerInfoProps {
  player: PlayerState;
}

const INFO_ROWS = [
  { key: "age", label: "年龄", format: (p: PlayerState) => `${p.age} 岁` },
  { key: "team", label: "球队", format: (p: PlayerState) => p.team },
  { key: "potential", label: "潜力", format: (p: PlayerState) => String(p.potential) },
  { key: "mental", label: "心态", format: (p: PlayerState) => String(p.mental) },
  { key: "fame", label: "名气", format: (p: PlayerState) => String(p.fame) },
  {
    key: "zhihuReputation",
    label: "知乎声望",
    format: (p: PlayerState) => String(p.zhihuReputation),
  },
  { key: "money", label: "资金", format: (p: PlayerState) => formatMoney(p.money) },
] as const;

export function CareerInfo({ player }: CareerInfoProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-ice">生涯信息</h3>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {INFO_ROWS.map((row) => (
          <div
            key={row.key}
            className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
          >
            <dt className="text-xs text-muted">{row.label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-white">
              {row.format(player)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
