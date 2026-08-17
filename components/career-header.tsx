import Image from "next/image";
import type { CareerStage } from "@/game";
import { getAvatarSrc, TIMELINE_LABEL } from "./career-ui";

interface CareerHeaderProps {
  stage: CareerStage;
}

export function CareerHeader({ stage }: CareerHeaderProps) {
  return (
    <header className="magazine-panel flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-transparent">
          <Image
            src={getAvatarSrc(stage)}
            alt="刘看山"
            width={256}
            height={256}
            className="h-full w-full object-cover object-center"
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
            看山篮球生涯模拟器
          </h1>
          <p className="truncate text-xs text-muted">从北极到篮球世界之巅</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-xs text-muted sm:inline">当前阶段</span>
        <span className="rounded-full bg-orange px-3 py-1 text-xs font-semibold text-white sm:text-sm">
          {TIMELINE_LABEL[stage]}
        </span>
      </div>
    </header>
  );
}
