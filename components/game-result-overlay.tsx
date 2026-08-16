"use client";

import type { AwardId, DraftTier, GameOutcome, TrophyId } from "@/game";
import type { StatDelta } from "./career-ui";

type MatchOutcome = Extract<GameOutcome, { kind: "MATCH" }>;
type DraftOutcome = Extract<GameOutcome, { kind: "DRAFT" }>;

export type PendingGameResult =
  | {
      kind: "MATCH";
      choiceText: string;
      deltas: StatDelta[];
      outcome: MatchOutcome;
    }
  | {
      kind: "DRAFT";
      choiceText: string;
      deltas: StatDelta[];
      outcome: DraftOutcome;
    };

/** UI 展示用中文（不写入 game/） */
export const UI_TROPHY_LABEL: Record<TrophyId, string> = {
  CUBA_CHAMPION: "CUBA 冠军",
  CBA_CHAMPION: "CBA 冠军",
  NBA_CHAMPION: "NBA 冠军",
  ASIA_GOLD: "亚洲赛场金牌",
  WORLD_MEDAL: "国际大赛奖牌",
};

export const UI_AWARD_LABEL: Record<AwardId, string> = {
  FMVP: "总决赛最佳球员",
  MVP_LIKE: "最有价值球员",
  DPOY_LIKE: "最佳防守球员",
  ALL_STAR_LIKE: "全明星",
};

const UI_DRAFT_TIER: Record<DraftTier, string> = {
  LOTTERY: "乐透区",
  FIRST_ROUND: "首轮",
  SECOND_ROUND: "次轮",
  UNDRAFTED: "落选",
};

interface GameResultOverlayProps {
  pending: PendingGameResult;
  onContinue: () => void;
}

export function GameResultOverlay({
  pending,
  onContinue,
}: GameResultOverlayProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#0f1b2d]/40 px-3 pb-4 pt-16 backdrop-blur-[2px] sm:items-center sm:px-4 sm:pb-0 sm:pt-0">
      <div className="animate-result-in magazine-panel max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl">
        {pending.kind === "MATCH" ? (
          <MatchResultBody pending={pending} />
        ) : (
          <DraftResultBody pending={pending} />
        )}

        {pending.deltas.length > 0 ? (
          <div className="border-t border-border px-4 py-3 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              属性变化
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {pending.deltas.map((item) => (
                <li
                  key={item.key}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                    item.delta > 0
                      ? "bg-success/12 text-success"
                      : "bg-danger/12 text-danger"
                  }`}
                >
                  {item.label}{" "}
                  {item.delta > 0 ? `+${item.delta}` : item.delta}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange/90 active:scale-[0.98]"
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchResultBody({
  pending,
}: {
  pending: Extract<PendingGameResult, { kind: "MATCH" }>;
}) {
  const { result, awards } = pending.outcome;
  const won = result.won;

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ice-deep">
        比赛结束
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h2
          className={`text-2xl font-semibold tracking-tight sm:text-3xl ${
            won ? "text-success" : "text-danger"
          }`}
        >
          {won ? "胜利" : "惜败"}
        </h2>
        <p className="text-3xl font-semibold tabular-nums text-ink sm:text-4xl">
          {result.playerScore}
          <span className="mx-1.5 text-lg text-muted">–</span>
          {result.opponentScore}
        </p>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink">{result.highlight}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Meta label="看山表现" value={String(result.performance)} />
        <Meta label="名气" value={formatSigned(result.fameDelta)} />
        <Meta label="选秀行情" value={formatSigned(result.draftStockDelta)} />
      </dl>

      {awards.trophies.length > 0 || awards.awards.length > 0 ? (
        <div className="mt-4 space-y-2">
          {awards.trophies.length > 0 ? (
            <HonorRow
              title="奖杯"
              items={awards.trophies.map(
                (trophy) => UI_TROPHY_LABEL[trophy.id],
              )}
            />
          ) : null}
          {awards.awards.length > 0 ? (
            <HonorRow
              title="个人荣誉"
              items={awards.awards.map((award) => UI_AWARD_LABEL[award.id])}
            />
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted">选择：{pending.choiceText}</p>
    </div>
  );
}

function DraftResultBody({
  pending,
}: {
  pending: Extract<PendingGameResult, { kind: "DRAFT" }>;
}) {
  const draft = pending.outcome.result;
  const { contract } = pending.outcome.contract;
  const undrafted = draft.tier === "UNDRAFTED";

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ice-deep">
        {draft.league} 选秀
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {undrafted ? "遗憾落选" : `第 ${draft.pick} 顺位`}
      </h2>
      <p className="mt-1 text-base font-semibold text-orange">
        {draft.teamName}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{draft.message}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <Meta label="档位" value={UI_DRAFT_TIER[draft.tier]} />
        <Meta
          label="选秀评分"
          value={String(draft.draftValue)}
          muted
        />
      </dl>

      <div className="mt-4 rounded-xl border border-border bg-[#f7fafc] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          合同
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {pending.outcome.contract.summary}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          <Meta label="年限" value={`${contract.years} 年`} />
          <Meta label="年薪" value={String(contract.annualSalary)} />
          <Meta label="签字费" value={String(contract.signingBonus)} />
        </dl>
      </div>

      <p className="mt-3 text-xs text-muted">选择：{pending.choiceText}</p>
    </div>
  );
}

function Meta({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-snow/90 px-2.5 py-1.5">
      <dt className="text-[10px] text-muted">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-semibold tabular-nums ${
          muted ? "text-muted" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function HonorRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
