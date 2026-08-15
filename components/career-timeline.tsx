import { CAREER_STAGE_ORDER, type CareerStage } from "@/game";
import { TIMELINE_LABEL } from "./career-ui";

interface CareerTimelineProps {
  currentStage: CareerStage;
  completedStages: Set<CareerStage>;
}

export function CareerTimeline({
  currentStage,
  completedStages,
}: CareerTimelineProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-ice">生涯时间线</h3>
        <p className="text-xs text-muted">当前高亮 · 已完成标记</p>
      </div>

      <ol className="relative flex flex-col gap-0 sm:flex-row sm:items-stretch sm:justify-between">
        {CAREER_STAGE_ORDER.map((stage, index) => {
          const isCurrent = stage === currentStage;
          const isDone = completedStages.has(stage) && !isCurrent;
          const isFuture = !isCurrent && !isDone;

          return (
            <li
              key={stage}
              className="relative flex flex-1 items-center gap-3 py-2 sm:flex-col sm:gap-2 sm:px-1 sm:py-0 sm:text-center"
            >
              {index < CAREER_STAGE_ORDER.length - 1 ? (
                <span
                  className={`pointer-events-none absolute left-[15px] top-8 h-[calc(100%-12px)] w-px sm:left-[calc(50%+14px)] sm:top-[15px] sm:h-px sm:w-[calc(100%-28px)] ${
                    isDone || isCurrent ? "bg-ice/50" : "bg-white/10"
                  }`}
                  aria-hidden
                />
              ) : null}

              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent
                    ? "bg-orange text-white shadow-[0_0_18px_rgba(255,122,41,0.45)]"
                    : isDone
                      ? "bg-ice-deep/80 text-white"
                      : "bg-white/10 text-muted"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>

              <span
                className={`text-sm font-medium ${
                  isCurrent
                    ? "text-orange-soft"
                    : isFuture
                      ? "text-muted/70"
                      : "text-white"
                }`}
              >
                {TIMELINE_LABEL[stage]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
