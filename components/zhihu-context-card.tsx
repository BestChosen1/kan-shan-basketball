"use client";

import type {
  CareerAgentClientOutput,
  ZhihuCardStatus,
} from "@/lib/career-agent-types";

interface ZhihuContextCardProps {
  status: ZhihuCardStatus;
  result: CareerAgentClientOutput | null;
}

export function ZhihuContextCard({ status, result }: ZhihuContextCardProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <section
      aria-live="polite"
      className="magazine-panel zhihu-panel animate-fade-up relative w-full max-w-full overflow-hidden rounded-2xl p-3 sm:p-4"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full border-[8px] border-ice/10" />
      <div className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full border-[6px] border-orange/10" />

      <div className="relative flex flex-wrap items-center gap-2">
        <span className="text-sm" aria-hidden>
          📰
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-ink sm:text-base">
          知乎现场
        </h3>
        <span className="rounded-full bg-ice/10 px-2 py-0.5 text-[10px] font-semibold text-ice-deep">
          基于知乎相关讨论
        </span>
      </div>

      {status === "loading" ? (
        <div className="relative mt-3 flex items-center gap-2.5 text-sm text-muted">
          <span className="zhihu-loading-dot" aria-hidden />
          <p>正在查看知乎上的相关讨论…</p>
        </div>
      ) : null}

      {status === "empty" ? (
        <p className="relative mt-3 text-sm leading-6 text-foreground/80">
          暂时没有找到与这次生涯事件高度相关的讨论。
        </p>
      ) : null}

      {status === "error" ? (
        <div className="relative mt-3 space-y-1.5">
          <p className="text-sm leading-6 text-foreground/85">
            知乎讨论暂时无法获取。
          </p>
          <p className="text-xs leading-5 text-muted">
            这不会影响看山的比赛与生涯进程。
          </p>
        </div>
      ) : null}

      {status === "success" && result ? (
        <div className="relative mt-3 space-y-3">
          <div>
            <h4 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
              {result.headline}
            </h4>
            <p className="mt-1.5 text-sm leading-6 text-foreground/80">
              {result.summary}
            </p>
          </div>

          <ul className="space-y-2.5">
            {result.sources.slice(0, 3).map((source) => (
              <li
                key={`${source.url}-${source.title}`}
                className="rounded-xl border border-border/80 bg-[#f7fafc]/90 px-3 py-2.5 transition-[border-color,box-shadow] duration-200 hover:border-ice/35 hover:shadow-[0_0_0_1px_rgba(91,143,184,0.12)]"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block min-w-0"
                >
                  <p className="line-clamp-2 break-words text-sm font-semibold text-ink">
                    {source.title}
                  </p>
                  {source.author ? (
                    <p className="mt-1 text-[11px] font-medium text-ice-deep">
                      {source.author}
                    </p>
                  ) : null}
                  <p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-muted">
                    {source.excerpt}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-orange">
                    知乎 · 查看原文 →
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
