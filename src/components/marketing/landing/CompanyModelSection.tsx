import { getTranslations } from "next-intl/server";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import { localizePath } from "@/i18n";

export async function CompanyModelSection({
  locale,
  items,
}: {
  locale: string;
  items: QualityFrameworkItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  return (
    <Section>
      <SectionHeader
        eyebrow={t("companyModel.eyebrow")}
        title={t("companyModel.heading")}
        intro={t("companyModel.intro")}
      />
      <QualityFramework items={items} />
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/about")}>{t("companyModel.link")}</ArrowLink>
      </div>
    </Section>
  );
}
