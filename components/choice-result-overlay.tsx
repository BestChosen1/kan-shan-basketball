import type { StatDelta } from "./career-ui";

interface ChoiceResultOverlayProps {
  choiceText: string;
  deltas: StatDelta[];
}

export function ChoiceResultOverlay({
  choiceText,
  deltas,
}: ChoiceResultOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="animate-delta-pop glass-panel max-w-lg rounded-2xl px-5 py-4 shadow-2xl">
        <p className="text-xs text-muted">选择反馈</p>
        <p className="mt-1 text-sm font-medium text-white">{choiceText}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {deltas.length === 0 ? (
            <li className="text-sm text-muted">状态已更新</li>
          ) : (
            deltas.map((item) => (
              <li
                key={item.key}
                className={`rounded-full px-3 py-1 text-sm font-medium tabular-nums ${
                  item.delta > 0
                    ? "bg-success/15 text-success"
                    : "bg-danger/15 text-danger"
                }`}
              >
                {item.label} {item.delta > 0 ? `+${item.delta}` : item.delta}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
