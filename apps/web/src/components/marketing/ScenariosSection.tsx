import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

import type { ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";

import { ScenarioStudy } from "@/components/marketing/ScenarioStudy";

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

interface ScenariosSectionProps {
  t: NamespaceTranslator;
  scenarios: ScenarioStudyItem[];
}

export function ScenariosSection({ t, scenarios }: ScenariosSectionProps) {
  return (
    <Section id="scenarios">
      <SectionHeader
        eyebrow={t("scenarios.eyebrow")}
        title={t("scenarios.heading")}
        intro={t("scenarios.intro")}
      />
      {scenarios.map((scenario) => (
        <ScenarioStudy
          key={scenario.number}
          item={scenario}
          labels={{
            signals: t("scenarios.labels.signals"),
            questions: t("scenarios.labels.questions"),
            deliverables: t("scenarios.labels.deliverables"),
          }}
        />
      ))}
    </Section>
  );
}
