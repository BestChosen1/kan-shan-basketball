import Image from "next/image";
import type { CareerStage, Choice, GameEvent } from "@/game";
import {
  formatChoiceEffects,
  getAvatarSrc,
  TIMELINE_LABEL,
} from "./career-ui";

interface CareerEventProps {
  event: GameEvent;
  stage: CareerStage;
  historyCount: number;
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

export function CareerEvent({
  event,
  stage,
  historyCount,
  disabled,
  onChoose,
}: CareerEventProps) {
  return (
    <section className="magazine-panel animate-fade-up relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full border-[8px] border-orange/10" />
      <div className="pointer-events-none absolute -bottom-8 left-6 h-20 w-20 rounded-full border-[6px] border-ice/15" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ice-deep">生涯事件</span>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {TIMELINE_LABEL[stage]}
          </span>
        </div>
        <span className="text-[11px] tabular-nums text-muted">
          第 {historyCount + 1} 场关键时刻
        </span>
      </div>

      <h3 className="relative mt-2 text-lg font-semibold tracking-tight text-ink sm:text-xl">
        {event.title}
      </h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm leading-6 text-foreground/80 sm:line-clamp-3">
        {event.description}
      </p>

      <div className="relative mt-3 flex gap-2.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-snow">
          <Image
            src={getAvatarSrc(stage)}
            alt="刘看山"
            width={197}
            height={208}
            className="h-full w-full object-contain p-0.5"
          />
        </div>
        <div className="relative min-w-0 flex-1 rounded-xl rounded-tl-md border border-border bg-[#f4f8fc] px-3 py-2">
          <p className="text-[11px] font-semibold text-ice-deep">刘看山</p>
          <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-ink">
            “{event.kanShanDialogue}”
          </p>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {event.choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            index={index}
            disabled={disabled}
            onChoose={onChoose}
          />
        ))}
      </div>
    </section>
  );
}

function ChoiceButton({
  choice,
  index,
  disabled,
  onChoose,
}: {
  choice: Choice;
  index: number;
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}) {
  const hints = formatChoiceEffects(choice.effects);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChoose(choice.id)}
      className="group flex min-h-[88px] flex-col items-start justify-between rounded-xl border border-border bg-[#f7fafc] px-3 py-2.5 text-left transition-all duration-200 hover:border-orange/45 hover:bg-white hover:shadow-[0_8px_18px_rgba(232,93,4,0.1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-border disabled:hover:bg-[#f7fafc] disabled:hover:shadow-none disabled:active:scale-100"
    >
      <div>
        <span className="text-[10px] font-semibold tracking-wide text-muted group-hover:text-orange">
          选项 {String.fromCharCode(65 + index)}
        </span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-ink">
          {choice.text}
        </span>
      </div>
      <span className="mt-2 max-h-0 overflow-hidden text-[10px] leading-4 text-muted opacity-0 transition-all duration-200 group-hover:max-h-12 group-hover:opacity-100">
        {hints.length > 0 ? hints.join(" · ") : "影响待结算"}
      </span>
    </button>
  );
}
