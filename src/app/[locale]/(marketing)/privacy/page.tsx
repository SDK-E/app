import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalList,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { siteConfig } from "@/lib/siteConfig";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Privacy policy — SDK Enterprises",
  description: "Privacy policy (RGPD / GDPR) for the SDK Enterprises website.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const lang = locale === "fr" ? "fr" : "en";
  const section = t.raw(lang) as Record<string, string | string[]>;
  const processors = t.raw("processors") as Array<{ name: string; role: string }>;

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{section.controllerTitle as string}</LegalH2>
      <LegalParagraph>
        {(section.controller as string)
          .replace("{company}", siteConfig.contact.company)
          .replace("{name}", siteConfig.name)
          .replace("{address}", siteConfig.contact.address)
          .replace("{email}", siteConfig.contact.email)}
      </LegalParagraph>

      <LegalH2>{section.collectedDataTitle as string}</LegalH2>
      <LegalParagraph>{section.collectedData as string}</LegalParagraph>
      <LegalList items={section.collectedDataItems as string[]} />

      <LegalH2>{section.purposesTitle as string}</LegalH2>
      <LegalParagraph>{section.purposesNote as string}</LegalParagraph>
      <LegalList items={section.purposeItems as string[]} />

      <LegalH2>{section.recipientsTitle as string}</LegalH2>
      <LegalParagraph>{section.recipientsNote as string}</LegalParagraph>
      <LegalList
        items={processors.map((processor) => (
          <span key={processor.name}>
            <strong>{processor.name}</strong> — {processor.role}
          </span>
        ))}
      />

      <LegalH2>{section.transfersTitle as string}</LegalH2>
      <LegalParagraph>{section.transfers as string}</LegalParagraph>

      <LegalH2>{section.retentionTitle as string}</LegalH2>
      <LegalParagraph>{section.retention as string}</LegalParagraph>

      <LegalH2>{section.rightsTitle as string}</LegalH2>
      <LegalParagraph>{section.rightsNote as string}</LegalParagraph>
      <LegalParagraph>
        {(section.rightsContact as string).replace("{email}", siteConfig.contact.email)}
      </LegalParagraph>

      <LegalH2>{section.childrenTitle as string}</LegalH2>
      <LegalParagraph>{section.children as string}</LegalParagraph>

      <LegalH2>{section.automatedTitle as string}</LegalH2>
      <LegalParagraph>{section.automated as string}</LegalParagraph>

      <LegalH2>{section.securityTitle as string}</LegalH2>
      <LegalParagraph>{section.security as string}</LegalParagraph>

      <LegalH2>{section.registerTitle as string}</LegalH2>
      <LegalParagraph>{section.register as string}</LegalParagraph>
    </LegalPage>
  );
}
