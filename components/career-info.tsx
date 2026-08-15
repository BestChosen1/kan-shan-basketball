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
    <section className="magazine-panel rounded-2xl p-3 sm:p-3.5">
      <h3 className="mb-2.5 text-sm font-semibold text-ink">生涯信息</h3>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {INFO_ROWS.map((row) => (
          <div
            key={row.key}
            className="rounded-lg border border-border bg-[#f7fafc] px-2.5 py-2"
          >
            <dt className="text-[10px] text-muted">{row.label}</dt>
            <dd className="mt-0.5 truncate text-xs font-semibold text-ink sm:text-sm">
              {row.format(player)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
