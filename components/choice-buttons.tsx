import type { Choice } from "@/game";

interface ChoiceButtonsProps {
  choices: readonly Choice[];
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

export function ChoiceButtons({
  choices,
  disabled,
  onChoose,
}: ChoiceButtonsProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-ice">做出选择</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(choice.id)}
            className="group flex min-h-[88px] flex-col items-start justify-center rounded-xl border border-border bg-white/5 px-4 py-3 text-left transition-all duration-200 hover:border-ice/60 hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-border disabled:hover:bg-white/5 disabled:active:scale-100"
          >
            <span className="text-[11px] font-medium tracking-wide text-muted group-hover:text-ice">
              选项 {index + 1}
            </span>
            <span className="mt-1 text-sm font-medium leading-6 text-white">
              {choice.text}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
