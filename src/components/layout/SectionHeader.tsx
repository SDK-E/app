import type { SectionTone } from "./Section";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  tone = "light",
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: SectionTone;
}) {
  const secondary =
    tone === "dark" ? "text-fog" : tone === "brand" ? "text-dark" : "text-muted-foreground";
  return (
    <div className="mb-9 grid min-w-0 gap-10 md:grid-cols-[0.65fr_1.35fr] md:gap-[50px]">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-label font-bold uppercase tracking-eyebrow">{eyebrow}</p>
        ) : null}
      </div>
      <div className="min-w-0">
        {title ? <h2 className="text-[36px] tracking-title md:text-title">{title}</h2> : null}
        {intro ? (
          <p className={`mt-5 max-w-[65ch] text-body md:text-lead ${secondary}`}>{intro}</p>
        ) : null}
      </div>
    </div>
  );
}
