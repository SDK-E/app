export function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
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
          <p className="mt-5 max-w-[65ch] text-body text-section-muted md:text-lead">{intro}</p>
        ) : null}
      </div>
    </div>
  );
}
