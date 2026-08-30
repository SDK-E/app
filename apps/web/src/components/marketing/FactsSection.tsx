import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

interface Fact {
  label: string;
  value: string;
}

interface FactsSectionProps {
  t: NamespaceTranslator;
  items: Fact[];
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function FactsSection({ t, items }: FactsSectionProps) {
  return (
    <Section>
      <SectionHeader
        eyebrow={t("facts.eyebrow")}
        title={t("facts.heading")}
      />
      <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((fact) => (
          <div
            key={fact.label}
            className="bg-paper p-6"
          >
            <dt className="text-label font-bold uppercase tracking-eyebrow text-dark">
              {fact.label}
            </dt>
            <dd className="mt-3 break-words text-body text-dark">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
