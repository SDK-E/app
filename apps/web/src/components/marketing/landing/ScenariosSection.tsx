import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section, sectionToneStyles } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { ScenarioStudy, type ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";

export async function ScenariosSection({
  locale,
  items,
}: {
  locale: string;
  items: ScenarioStudyItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tWork = await getTranslations({ locale, namespace: "workPage" });
  return (
    <Section tone="dark">
      <SectionHeader
        eyebrow={t("scenarios.eyebrow")}
        title={t("scenarios.heading")}
        intro={t("scenarios.intro")}
      />
      <div
        style={sectionToneStyles.light}
        className="rounded-card p-6 md:p-8"
      >
        {items.map((scenario) => (
          <ScenarioStudy
            key={scenario.number}
            item={scenario}
            labels={{
              signals: tWork("scenarios.labels.signals"),
              questions: tWork("scenarios.labels.questions"),
              deliverables: tWork("scenarios.labels.deliverables"),
            }}
          />
        ))}
      </div>
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/work")}>{t("scenarios.link")}</ArrowLink>
      </div>
    </Section>
  );
}
