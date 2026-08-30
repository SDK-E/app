import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";

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
