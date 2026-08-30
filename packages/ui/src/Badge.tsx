export type BadgeTone = "live" | "review" | "neutral";

const tones: Record<BadgeTone, string> = {
  live: "bg-brand text-dark",
  review: "border border-current text-current",
  neutral: "border border-current opacity-80",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-control px-2 py-1 text-micro font-extrabold uppercase tracking-widest ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
