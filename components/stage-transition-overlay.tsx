import Image from "next/image";
import { KANSHAN_ASSETS } from "./career-ui";

interface StageTransitionOverlayProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function StageTransitionOverlay({
  eyebrow,
  title,
  subtitle,
}: StageTransitionOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1b2d]/45 px-4 backdrop-blur-[2px]">
      <div className="animate-stage-in magazine-panel max-w-md overflow-hidden rounded-3xl text-center">
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-border bg-gradient-to-b from-[#f8fbff] to-[#e8eef6] mt-8">
          <Image
            src={KANSHAN_ASSETS.avatar}
            alt="刘看山"
            width={197}
            height={207}
            className="h-full w-full object-contain p-2"
          />
        </div>
        <div className="px-8 pb-10 pt-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-ice-deep">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
