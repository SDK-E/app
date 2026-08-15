import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Cookie policy — SDK Enterprises",
  description: "Cookie policy for the SDK Enterprises website.",
};

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });
  const lang = locale === "fr" ? "fr" : "en";
  const section = t.raw(lang) as Record<string, string>;

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{section.whatIsTitle as string}</LegalH2>
      <LegalParagraph>{section.whatIs as string}</LegalParagraph>

      <LegalH2>{section.thisSiteTitle as string}</LegalH2>
      <LegalParagraph>{section.thisSite as string}</LegalParagraph>

      <LegalH2>{section.consentBannerTitle as string}</LegalH2>
      <LegalParagraph>{section.consentBanner as string}</LegalParagraph>

      <LegalH2>{section.browserSettingsTitle as string}</LegalH2>
      <LegalParagraph>{section.browserSettings as string}</LegalParagraph>
    </LegalPage>
  );
}
