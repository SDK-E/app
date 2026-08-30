import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";

export async function QualitySection({
  locale,
  items,
}: {
  locale: string;
  items: QualityFrameworkItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });

  return (
    <Section tone="dark">
      <SectionHeader
        eyebrow={t("quality.eyebrow")}
        title={t("quality.heading")}
        intro={t("quality.intro")}
      />
      <QualityFramework items={items} />
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/how-we-work")}>{t("quality.link")}</ArrowLink>
      </div>
    </Section>
  );
}
