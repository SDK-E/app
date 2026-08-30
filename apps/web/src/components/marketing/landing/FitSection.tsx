import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { FitMatrix } from "@/components/marketing/FitMatrix";

export async function FitSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tWork = await getTranslations({ locale, namespace: "workPage" });
  return (
    <Section>
      <SectionHeader
        eyebrow={t("fit.eyebrow")}
        title={t("fit.heading")}
        intro={t("fit.intro")}
      />
      <FitMatrix
        fitTitle={tWork("fit.fitTitle")}
        notFitTitle={tWork("fit.notFitTitle")}
        fitItems={tWork.raw("fit.fitItems") as string[]}
        notFitItems={tWork.raw("fit.notFitItems") as string[]}
      />
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/work")}>{t("fit.link")}</ArrowLink>
      </div>
    </Section>
  );
}
