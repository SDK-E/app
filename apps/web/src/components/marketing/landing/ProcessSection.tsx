import { getTranslations } from "next-intl/server";

import { Section, sectionToneStyles } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { ArrowLink } from "@sdk-e/ui/ArrowLink";
import { ProcessTimeline, type ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import { localizePath } from "@sdk-e/i18n";

export async function ProcessSection({
  locale,
  items,
}: {
  locale: string;
  items: ProcessTimelineItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tProcess = await getTranslations({ locale, namespace: "howWeWorkPage" });
  return (
    <Section>
      <SectionHeader
        eyebrow={t("process.eyebrow")}
        title={t("process.heading")}
        intro={t("process.intro")}
      />
      <div
        style={sectionToneStyles.dark}
        className="rounded-card border border-dark-deep px-6 py-4 md:px-8"
      >
        <ProcessTimeline
          items={items}
          labels={{
            output: tProcess("process.labels.output"),
            decision: tProcess("process.labels.decision"),
          }}
        />
      </div>
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/how-we-work")}>{t("process.link")}</ArrowLink>
      </div>
    </Section>
  );
}
