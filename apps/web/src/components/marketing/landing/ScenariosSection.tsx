import { getTranslations } from "next-intl/server";

import { Section, sectionToneStyles } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { ArrowLink } from "@sdk-e/ui/ArrowLink";
import { ScenarioStudy, type ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";
import { localizePath } from "@sdk-e/i18n";

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
      <div style={sectionToneStyles.light} className="rounded-card p-6 md:p-8">
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
