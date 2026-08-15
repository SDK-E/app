import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { siteConfig } from "@/lib/siteConfig";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Terms of use — SDK Enterprises",
  description: "Terms of use for the SDK Enterprises website.",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const lang = locale === "fr" ? "fr" : "en";
  const section = t.raw(lang) as Record<string, string>;

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{section.purposeTitle as string}</LegalH2>
      <LegalParagraph>
        {(section.purpose as string).replace("{name}", siteConfig.name)}
      </LegalParagraph>

      <LegalH2>{section.servicesTitle as string}</LegalH2>
      <LegalParagraph>
        {(section.services as string).replace("{name}", siteConfig.name)}
      </LegalParagraph>

      <LegalH2>{section.enquiriesTitle as string}</LegalH2>
      <LegalParagraph>{section.enquiries as string}</LegalParagraph>

      <LegalH2>{section.intellectualPropertyTitle as string}</LegalH2>
      <LegalParagraph>{section.intellectualProperty as string}</LegalParagraph>

      <LegalH2>{section.availabilityTitle as string}</LegalH2>
      <LegalParagraph>{section.availability as string}</LegalParagraph>

      <LegalH2>{section.liabilityTitle as string}</LegalH2>
      <LegalParagraph>{section.liability as string}</LegalParagraph>

      <LegalH2>{section.changesTitle as string}</LegalH2>
      <LegalParagraph>{section.changes as string}</LegalParagraph>

      <LegalH2>{section.lawTitle as string}</LegalH2>
      <LegalParagraph>{section.law as string}</LegalParagraph>

      <LegalH2>{section.contactTitle as string}</LegalH2>
      <LegalParagraph>
        {(section.contact as string)
          .replace("{company}", siteConfig.contact.company)
          .replace("{email}", siteConfig.contact.email)}
      </LegalParagraph>
    </LegalPage>
  );
}
