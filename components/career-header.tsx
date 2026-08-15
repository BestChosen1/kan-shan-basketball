import { CAREER_STAGE_ORDER, type CareerStage } from "@/game";
import { TIMELINE_LABEL } from "./career-ui";

interface CareerHeaderProps {
  stage: CareerStage;
}

export function CareerHeader({ stage }: CareerHeaderProps) {
  return (
    <header className="glass-panel flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
          看山篮球生涯模拟器
        </h1>
        <p className="text-sm text-ice/80">从北极到篮球世界之巅</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">当前阶段</span>
        <div className="flex flex-wrap gap-1.5">
          {CAREER_STAGE_ORDER.map((item) => {
            const active = item === stage;
            return (
              <span
                key={item}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-orange text-white shadow-[0_0_16px_rgba(255,122,41,0.35)]"
                    : "bg-white/5 text-muted"
                }`}
              >
                {TIMELINE_LABEL[item]}
              </span>
            );
          })}
        </div>
      </div>
    </header>
  );
}
