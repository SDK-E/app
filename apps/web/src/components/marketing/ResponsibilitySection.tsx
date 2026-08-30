import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

interface ResponsibilitySectionProps {
  t: NamespaceTranslator;
  items: string[];
}

export function ResponsibilitySection({ t, items }: ResponsibilitySectionProps) {
  return (
    <Section tone="dark">
      <SectionHeader
        eyebrow={t("responsibility.eyebrow")}
        title={t("responsibility.heading")}
        intro={t("responsibility.body")}
      />
      <ul className="grid gap-px overflow-hidden rounded-card border border-dark-deep bg-dark-deep sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={item}
            className="min-h-32 bg-dark p-6"
          >
            <span className="text-label font-bold text-brand">0{index + 1}</span>
            <p className="mt-5 text-body font-bold text-light">{item}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
