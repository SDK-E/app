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
  title: "Mentions légales — SDK Enterprises",
  description: "Legal notices (mentions légales) for the SDK Enterprises website.",
};

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.mentionsLegales" });
  const lang = locale === "fr" ? "fr" : "en";
  const section = t.raw(lang) as Record<string, string | string[]>;

  const domain = siteConfig.name.toLowerCase().replace(/\s+/g, ".");

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{section[lang === "fr" ? "editorTitle" : "publisherTitle"] as string}</LegalH2>
      <LegalParagraph>
        {(section[lang === "fr" ? "editorWebsite" : "publisherWebsite"] as string)
          .replace("{domain}", domain)
          .replace("{company}", siteConfig.contact.company)
          .replace("{name}", siteConfig.name)}
      </LegalParagraph>
      <LegalList
        items={[
          (section.siren as string).replace("{siren}", siteConfig.contact.siren),
          (section.siret as string).replace("{siret}", siteConfig.contact.siret),
          (section.registeredOffice as string).replace("{address}", siteConfig.contact.address),
          section.legalForm as string,
          (section.registration as string).replace("{siren}", siteConfig.contact.siren),
        ]}
      />
      <LegalH2>{section.directorTitle as string}</LegalH2>
      <LegalParagraph>{section.director as string}</LegalParagraph>
      <LegalH2>{section.hostingTitle as string}</LegalH2>
      <LegalParagraph>{section.hosting as string}</LegalParagraph>
      <LegalH2>{section.contactTitle as string}</LegalH2>
      <LegalParagraph>
        {(section.contact as string)
          .replace("{email}", siteConfig.contact.email)
          .replace("{phone}", siteConfig.contact.phone)}
      </LegalParagraph>
      <LegalH2>{section.intellectualPropertyTitle as string}</LegalH2>
      <LegalParagraph>{section.intellectualProperty as string}</LegalParagraph>
      <LegalH2>{section.legalFrameworkTitle as string}</LegalH2>
      <LegalParagraph>{section.legalFramework as string}</LegalParagraph>
    </LegalPage>
  );
}
