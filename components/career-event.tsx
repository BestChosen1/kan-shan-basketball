import type { GameEvent } from "@/game";

interface CareerEventProps {
  event: GameEvent;
}

export function CareerEvent({ event }: CareerEventProps) {
  return (
    <section className="glass-panel animate-fade-up rounded-2xl p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ice/70">
        当前事件
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {event.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
        {event.description}
      </p>

      <div className="mt-5 flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white/10 text-xl"
          aria-hidden
        >
          🦊
        </div>
        <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-white/10 px-4 py-3">
          <p className="text-xs font-medium text-ice">刘看山</p>
          <p className="mt-1 text-sm leading-6 text-white/95">
            “{event.kanShanDialogue}”
          </p>
        </div>
      </div>
    </section>
  );
}
