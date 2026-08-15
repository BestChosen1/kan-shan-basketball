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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040b14]/70 px-4 backdrop-blur-sm">
      <div className="animate-stage-flash glass-panel max-w-md rounded-3xl px-8 py-10 text-center">
        <p className="text-sm text-ice">{eyebrow}</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
