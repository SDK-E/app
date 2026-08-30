import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

import type { EngagementOption } from "@/components/marketing/EngagementComparison";
import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ServiceChapterItem } from "@/components/marketing/ServiceChapter";

import { EngagementComparison } from "@/components/marketing/EngagementComparison";
import { ProblemNavigator } from "@/components/marketing/ProblemNavigator";
import { QualityFramework } from "@/components/marketing/QualityFramework";
import { ServiceChapter } from "@/components/marketing/ServiceChapter";

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

interface ServicesCapabilitiesProps {
  t: NamespaceTranslator;
  navigatorItems: ProblemNavigatorItem[];
  capabilities: ({ id: string } & ServiceChapterItem)[];
  engagementOptions: EngagementOption[];
  teamSteps: { number: string; title: string; copy: string }[];
  locale: string;
}

export function ServicesCapabilities({
  t,
  navigatorItems,
  capabilities,
  engagementOptions,
  teamSteps,
  locale,
}: ServicesCapabilitiesProps) {
  void locale;
  return (
    <>
      <Section
        id="starting-points"
        tone="dark"
      >
        <ProblemNavigator
          heading={t("navigator.heading")}
          intro={t("navigator.intro")}
          items={navigatorItems}
        />
      </Section>

      <Section>
        <SectionHeader
          eyebrow={t("capabilities.eyebrow")}
          title={t("capabilities.heading")}
          intro={t("capabilities.intro")}
        />
        <div>
          {capabilities.map((capability) => (
            <ServiceChapter
              key={capability.id}
              item={capability}
              labels={{
                investigation: t("capabilities.labels.investigation"),
                delivery: t("capabilities.labels.delivery"),
                evidence: t("capabilities.labels.evidence"),
                firstStep: t("capabilities.labels.firstStep"),
              }}
            />
          ))}
        </div>
      </Section>

      <Section
        id="engagements"
        tone="dark"
      >
        <SectionHeader
          eyebrow={t("engagements.eyebrow")}
          title={t("engagements.heading")}
          intro={t("engagements.intro")}
        />
        <EngagementComparison
          labels={{
            bestFor: t("engagements.labels.bestFor"),
            output: t("engagements.labels.output"),
            commitment: t("engagements.labels.commitment"),
          }}
          options={engagementOptions}
        />
      </Section>

      <Section>
        <SectionHeader
          eyebrow={t("teamModel.eyebrow")}
          title={t("teamModel.heading")}
          intro={t("teamModel.body")}
        />
        <QualityFramework items={teamSteps} />
      </Section>
    </>
  );
}
