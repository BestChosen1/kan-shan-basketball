import Image from "next/image";
import type { Choice, EventVisualType } from "@/game";
import { formatChoiceEffects } from "@/components/career-ui";
import {
  EVENT_VISUAL_ALT,
  getEventVisualSrc,
} from "@/lib/event-visuals";

interface EventVisualProps {
  visualType: EventVisualType;
  title: string;
  description: string;
  dialogue: string;
  stageLabel: string;
  choices: readonly Choice[];
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

/**
 * 重大事件全屏视觉弹层：图片铺满视觉区，玩家在此做出选择。
 */
export function EventVisual({
  visualType,
  title,
  description,
  dialogue,
  stageLabel,
  choices,
  disabled,
  onChoose,
}: EventVisualProps) {
  const src = getEventVisualSrc(visualType);
  if (!src) {
    return null;
  }

  const alt = EVENT_VISUAL_ALT[visualType] ?? `刘看山 · ${title}`;
  const isChampion = visualType === "CHAMPION";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#07111f]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 背景图：完整入画，object-contain 避免裁切角色 */}
      <div className="relative min-h-0 flex-1">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-contain object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/35 to-[#07111f]/20" />

        {isChampion ? (
          <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
            <span className="rounded-full bg-orange px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
              🏆 决赛时刻
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {stageLabel}
            </span>
          </div>
        ) : (
          <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {stageLabel}
            </span>
          </div>
        )}
      </div>

      {/* 底部决策区 */}
      <div className="relative z-10 shrink-0 border-t border-white/10 bg-[#0b1628]/95 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/75 sm:line-clamp-3">
            {description}
          </p>
          <p className="mt-2 text-sm italic text-ice/90">
            刘看山：「{dialogue}」
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {choices.map((choice, index) => (
              <ModalChoiceButton
                key={choice.id}
                choice={choice}
                index={index}
                disabled={disabled}
                onChoose={onChoose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalChoiceButton({
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
      className="group flex min-h-[76px] flex-col items-start justify-between rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left transition-all hover:border-orange/60 hover:bg-white/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <div>
        <span className="text-[10px] font-semibold tracking-wide text-white/55 group-hover:text-orange-soft">
          选项 {String.fromCharCode(65 + index)}
        </span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-white">
          {choice.text}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] leading-4 text-white/45">
        {hints.length > 0 ? hints.join(" · ") : ""}
      </span>
    </button>
  );
}
