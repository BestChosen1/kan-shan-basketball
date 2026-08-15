import type { PlayerState } from "@/game";
import { formatMoney, TIMELINE_LABEL } from "./career-ui";

interface CareerSummaryProps {
  player: PlayerState;
  onRestart: () => void;
}

export function CareerSummary({ player, onRestart }: CareerSummaryProps) {
  const honors =
    player.trophies.length > 0
      ? player.trophies.join(" · ")
      : player.fame >= 40
        ? "生涯高光已写入历史（奖杯数据待后续扩展）"
        : "暂无奖杯收录";

  return (
    <section className="glass-panel animate-fade-up rounded-2xl p-6 sm:p-8">
      <p className="text-xs font-medium tracking-[0.18em] text-ice/80">CAREER COMPLETE</p>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
        《刘看山的篮球生涯》
      </h2>
      <p className="mt-2 text-sm text-muted">
        从{TIMELINE_LABEL.NORTH_POLE}启程，最终停在{TIMELINE_LABEL.RETIRED}。
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryItem label="最终 OVR" value={String(player.overall)} emphasize />
        <SummaryItem label="最终球队" value={player.team} />
        <SummaryItem label="生涯年龄" value={`${player.age} 岁`} />
        <SummaryItem
          label="关键事件"
          value={`${player.careerHistory.length} 次选择`}
        />
        <SummaryItem label="主要荣誉" value={honors} />
        <SummaryItem label="名气" value={String(player.fame)} />
        <SummaryItem label="知乎声望" value={String(player.zhihuReputation)} />
        <SummaryItem label="资金" value={formatMoney(player.money)} />
      </dl>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange/90 active:scale-[0.98]"
      >
        重新开始
      </button>
    </section>
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
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium ${
          emphasize ? "text-2xl text-orange-soft" : "text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
