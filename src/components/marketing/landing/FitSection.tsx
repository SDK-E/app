import { getTranslations } from "next-intl/server";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { FitMatrix } from "@/components/marketing/FitMatrix";
import { localizePath } from "@/i18n";

export async function FitSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tWork = await getTranslations({ locale, namespace: "workPage" });
  return (
    <Section>
      <SectionHeader eyebrow={t("fit.eyebrow")} title={t("fit.heading")} intro={t("fit.intro")} />
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
