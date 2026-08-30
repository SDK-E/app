import { Button } from "@platform/ui/Button";

export function ProjectCta({
  eyebrow,
  title,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-[70px]">
      <div>
        <p className="text-label font-bold uppercase tracking-eyebrow">{eyebrow}</p>
        <h2 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
          {title}
        </h2>
      </div>
      <div>
        <p className="max-w-[50ch] text-body md:text-lead">{body}</p>
        <Button
          href={cta.href}
          variant="dark"
          className="mt-7"
        >
          {cta.label} →
        </Button>
      </div>
    </div>
  );
}
