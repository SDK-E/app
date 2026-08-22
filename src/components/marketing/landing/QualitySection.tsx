import { getTranslations } from "next-intl/server";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import { localizePath } from "@/i18n";

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
