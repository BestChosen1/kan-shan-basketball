import Image from "next/image";
import type { PlayerState } from "@/game";
import { getAvatarSrc, KanshanFigure, TIMELINE_LABEL } from "./career-ui";

interface CareerSummaryProps {
  player: PlayerState;
  onRestart: () => void;
}

export function CareerSummary({ player, onRestart }: CareerSummaryProps) {
  const honors =
    player.trophies.length > 0
      ? player.trophies.join(" · ")
      : player.fame >= 40
        ? "生涯高光已写入历史"
        : "暂无奖杯收录";

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
          <div className="relative z-10 mx-auto mt-1 flex h-[220px] w-full max-w-[220px] items-end justify-center sm:h-[260px]">
            <KanshanFigure
              stage="RETIRED"
              priority
              className="h-full w-auto drop-shadow-[0_16px_28px_rgba(21,42,72,0.2)]"
            />
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
            从 12 岁北极启程，到 {player.age}{" "}
            岁退役。共经历 {player.careerHistory.length} 个关键时刻。
          </p>

          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <SummaryItem
              label="最终 OVR"
              value={String(player.overall)}
              emphasize
            />
            <SummaryItem
              label="生涯阶段"
              value={stagesTouched || TIMELINE_LABEL.RETIRED}
            />
            <SummaryItem label="球队" value={player.team} />
            <SummaryItem label="主要荣誉" value={honors} />
            <SummaryItem label="名气" value={String(player.fame)} />
            <SummaryItem
              label="知乎声望"
              value={String(player.zhihuReputation)}
            />
          </dl>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-[#f7fafc] p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-transparent">
              <Image
                src={getAvatarSrc("RETIRED")}
                alt="刘看山"
                width={197}
                height={207}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">角色档案</p>
              <p className="mt-0.5 text-xs text-muted">
                透明立绘 · 北极狐看山
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange/90 active:scale-[0.98]"
          >
            重新开始
          </button>
        </div>
      </div>
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
