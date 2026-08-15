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
    <section className="magazine-panel rounded-2xl px-3 py-2.5 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-ink">生涯轨迹</h3>
        <p className="text-[10px] text-muted">北极 → 退役</p>
      </div>

      <ol className="flex w-full items-start justify-between gap-0.5">
        {CAREER_STAGE_ORDER.map((stage, index) => {
          const isCurrent = stage === currentStage;
          const isDone = completedStages.has(stage) && !isCurrent;
          const isFuture = !isCurrent && !isDone;

          return (
            <li
              key={stage}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 text-center ${
                isFuture ? "opacity-35" : "opacity-100"
              }`}
            >
              {index < CAREER_STAGE_ORDER.length - 1 ? (
                <span
                  className={`pointer-events-none absolute left-[calc(50%+8px)] top-[7px] h-px w-[calc(100%-16px)] ${
                    isDone || isCurrent ? "bg-ice/50" : "bg-border"
                  }`}
                  aria-hidden
                />
              ) : null}

              <span
                className={`relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${
                  isCurrent
                    ? "h-4 w-4 bg-orange text-white ring-2 ring-orange/25"
                    : isDone
                      ? "bg-ice-deep text-white"
                      : "bg-[#dce6f0] text-transparent"
                }`}
              >
                {isDone ? "✓" : ""}
              </span>
              <span
                className={`max-w-full truncate text-[10px] font-medium sm:text-[11px] ${
                  isCurrent ? "text-orange" : "text-ink"
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
