import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";

const typeRamp: { token: string; className: string; sample: string }[] = [
  { token: "display", className: "text-display tracking-display", sample: "display — 76px" },
  { token: "title", className: "text-title tracking-title", sample: "title — 52px" },
  { token: "h1", className: "text-h1 tracking-h1", sample: "h1 — 42px" },
  { token: "h3", className: "text-h3", sample: "h3 — 23px" },
  { token: "lead", className: "text-lead", sample: "lead — 18px" },
  { token: "body", className: "text-body", sample: "body — 14px (a11y floor)" },
  { token: "label", className: "text-label uppercase tracking-eyebrow", sample: "label — 11px" },
  { token: "micro", className: "text-micro uppercase tracking-label", sample: "micro — 10px" },
];

export function TypeSection() {
  return (
    <Section id="type" tone="dark">
      <SectionHeader
        tone="dark"
        eyebrow="02 · Typography"
        title="JetBrains Mono, tuned like an editorial type system."
        intro="Headlines set tight and large; labels set small, uppercase and tracked. Body copy never goes below 14px."
      />
      <div className="grid gap-px overflow-hidden rounded-card border border-[#2d4b28] bg-[#2d4b28]">
        {typeRamp.map((row) => (
          <div key={row.token} className="bg-dark px-6 py-5">
            <p className={`text-light ${row.className}`}>{row.sample}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
