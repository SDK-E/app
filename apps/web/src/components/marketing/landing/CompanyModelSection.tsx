import { getTranslations } from "next-intl/server";

import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { ArrowLink } from "@sdk-e/ui/ArrowLink";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import { localizePath } from "@sdk-e/i18n";

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
