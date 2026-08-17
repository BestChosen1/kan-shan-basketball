"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CareerTemplateOutput } from "@/agent/schemas";
import { CAREER_TIER_LABEL, type PlayerState } from "@/game";
import {
  PLAYSTYLE_LABEL,
  TEMPERAMENT_LABEL,
  requestCareerTemplate,
} from "@/lib/career-template-client";
import { getAvatarSrc, TIMELINE_LABEL } from "./career-ui";

interface CareerEndingArchiveProps {
  player: PlayerState;
  onRestart: () => void;
}

export function CareerEndingArchive({
  player,
  onRestart,
}: CareerEndingArchiveProps) {
  const tierLabel = player.careerTier
    ? CAREER_TIER_LABEL[player.careerTier]
    : "未评定";

  const templateKey = [
    player.careerScore,
    player.overall,
    player.nbaSeason,
    player.careerHistory.length,
    player.wins,
    player.losses,
  ].join(":");

  return (
    <div className="ending-ceremony relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div className="ending-ceremony-bg absolute inset-0" />
      <div className="ending-particles pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="animate-fade-up text-center">
          <div className="relative mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border border-white/25 shadow-[0_0_36px_rgba(255,138,61,0.3)] sm:h-24 sm:w-24">
            <Image
              src={getAvatarSrc(player.stage)}
              alt="刘看山"
              fill
              sizes="96px"
              className="object-cover object-center"
              priority
            />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-soft">
            CAREER ARCHIVE
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            刘看山的篮球生涯
          </h1>
          <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-orange-soft to-transparent" />
          <p className="mt-3 text-sm leading-6 text-white/70">
            {player.age} 岁退役 · 生涯评级 {tierLabel} · OVR {player.overall}
            {player.nbaSeason > 0 ? ` · NBA ${player.nbaSeason} 季` : ""}
            <br />
            <span className="text-white/45">
              {TIMELINE_LABEL.NORTH_POLE} 启程 · {player.wins} 胜 {player.losses}{" "}
              负 · {player.careerHistory.length} 个关键时刻
            </span>
          </p>
        </header>

        <div className="mt-8 flex-1">
          <ArchiveTemplateLoader key={templateKey} player={player} />
        </div>

        <footer className="mt-8 flex flex-col items-center gap-3 pb-4 animate-fade-up">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-w-[12rem] items-center justify-center rounded-2xl bg-orange px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(232,93,4,0.4)] transition-all hover:bg-orange/90 active:scale-[0.98]"
          >
            重新开始
          </button>
          <p className="text-xs text-white/40">回到封面，开启下一段生涯</p>
        </footer>
      </div>
    </div>
  );
}

function ArchiveTemplateLoader({ player }: { player: PlayerState }) {
  const [template, setTemplate] = useState<CareerTemplateOutput | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const controller = new AbortController();

    void requestCareerTemplate(player, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.ok) {
          setTemplate(result.data);
          setStatus("ready");
          return;
        }
        setStatus("error");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [player]);

  return <ArchiveTemplatePanel status={status} template={template} />;
}

function ArchiveTemplatePanel({
  status,
  template,
}: {
  status: "loading" | "ready" | "error";
  template: CareerTemplateOutput | null;
}) {
  return (
    <div className="ending-archive-card animate-fade-up rounded-3xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md sm:p-6">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-orange-soft">
        生涯模版 · 知乎讨论
      </p>

      {status === "loading" ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-white/70">
            正在通过知乎检索匹配生涯模版与相关评论…
          </p>
          <div className="flex items-center gap-2">
            <span className="zhihu-loading-dot ending-dot" />
            <span
              className="zhihu-loading-dot ending-dot"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="zhihu-loading-dot ending-dot"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <p className="mt-4 text-sm leading-6 text-white/65">
          暂时无法生成生涯模版或拉取知乎讨论。你可以重新开始，或稍后再试。
        </p>
      ) : null}

      {status === "ready" && template ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {template.playerName}
              </h2>
              <p className="mt-1 text-xs text-white/55">
                {template.league}
                {template.teamHint ? ` · ${template.teamHint}` : ""}
                {template.source === "fallback" ? " · 离线模版" : ""}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-7 text-white/85">
            {template.rationale}
          </p>
          <p className="mt-2 text-xs leading-6 text-white/50">
            {template.profileSummary}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {template.playstyles.map((trait) => (
              <span
                key={`p-${trait}`}
                className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90"
              >
                {PLAYSTYLE_LABEL[trait] ?? trait}
              </span>
            ))}
            {template.temperaments.map((trait) => (
              <span
                key={`t-${trait}`}
                className="rounded-full border border-orange/35 bg-orange/15 px-2.5 py-1 text-[11px] font-semibold text-orange-soft"
              >
                {TEMPERAMENT_LABEL[trait] ?? trait}
              </span>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45">
              知乎相关评论
            </p>

            {template.comments.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {template.comments.map((comment) => (
                  <li
                    key={comment.url}
                    className="rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3"
                  >
                    <a
                      href={comment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-orange-soft underline-offset-2 hover:underline"
                    >
                      {comment.title}
                    </a>
                    {comment.author ? (
                      <span className="text-xs text-white/40">
                        {" "}
                        · {comment.author}
                      </span>
                    ) : null}
                    {comment.excerpt ? (
                      <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-white/55">
                        {comment.excerpt}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs leading-5 text-white/45">
                暂无匹配到的知乎评论（仍保留球员模版）。
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
