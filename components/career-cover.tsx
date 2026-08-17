"use client";

import Image from "next/image";

const COVER_SRC = "/assets/kanshan/web/kanshan_profiled.jpeg";

interface CareerCoverProps {
  onStart: () => void;
}

export function CareerCover({ onStart }: CareerCoverProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#dfe8f2]">
      <div className="absolute inset-0">
        <Image
          src={COVER_SRC}
          alt="看山篮球生涯模拟器"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[42%_45%] sm:object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1b2d]/72 via-[#0f1b2d]/15 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0f1b2d]/25 via-transparent to-[#0f1b2d]/35" />
      </div>

      <div className="relative z-10 flex min-h-full flex-1 flex-col justify-end px-5 pb-10 pt-16 sm:px-10 sm:pb-14 lg:px-16">
        <div className="ml-auto w-full max-w-md animate-fade-up text-right">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-soft">
            KANSHAN CAREER SIM
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white drop-shadow-[0_8px_24px_rgba(15,27,45,0.35)] sm:text-4xl lg:text-[2.75rem]">
            看山篮球生涯模拟器
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
            你的选择，决定下一站
          </p>

          <div className="mt-7 flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={onStart}
              className="cover-cta inline-flex min-w-[11rem] items-center justify-center rounded-2xl bg-orange px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_rgba(232,93,4,0.35)] transition-all hover:bg-orange/90 hover:shadow-[0_16px_36px_rgba(232,93,4,0.45)] active:scale-[0.98]"
            >
              开启生涯
            </button>
            <p className="max-w-xs text-xs leading-5 text-white/55">
              从北极冰原起步，一路走向校园、CUBA、CBA、NBA 与国家队。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
