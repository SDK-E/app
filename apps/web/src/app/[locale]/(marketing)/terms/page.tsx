import type { Metadata } from "next";

import { siteConfig } from "@platform/config/site";
import { breadcrumbListJsonLd, buildMetadata, organizationJsonLd } from "@platform/marketing/seo";
import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/marketing/LegalPage";
import { LegalH2, LegalIntro, LegalParagraph, LegalTitle } from "@/components/marketing/LegalText";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const title = t("title");
  const description = t("intro");

  return {
    ...buildMetadata({
      title: `${title} — ${siteConfig.name}`,
      description,
      path: "/terms",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "Home", url: "/" },
          { name: title, url: "/terms" },
        ]),
        organizationJsonLd(),
      ]),
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{t("purposeTitle")}</LegalH2>
      <LegalParagraph>{t("purpose", { name: siteConfig.name })}</LegalParagraph>

      <LegalH2>{t("servicesTitle")}</LegalH2>
      <LegalParagraph>{t("services", { name: siteConfig.name })}</LegalParagraph>

      <LegalH2>{t("enquiriesTitle")}</LegalH2>
      <LegalParagraph>{t("enquiries")}</LegalParagraph>

      <LegalH2>{t("intellectualPropertyTitle")}</LegalH2>
      <LegalParagraph>{t("intellectualProperty")}</LegalParagraph>

      <LegalH2>{t("availabilityTitle")}</LegalH2>
      <LegalParagraph>{t("availability")}</LegalParagraph>

      <LegalH2>{t("liabilityTitle")}</LegalH2>
      <LegalParagraph>{t("liability")}</LegalParagraph>

      <LegalH2>{t("changesTitle")}</LegalH2>
      <LegalParagraph>{t("changes")}</LegalParagraph>

      <LegalH2>{t("lawTitle")}</LegalH2>
      <LegalParagraph>{t("law")}</LegalParagraph>

      <LegalH2>{t("contactTitle")}</LegalH2>
      <LegalParagraph>
        {t("contact", { company: siteConfig.contact.company, email: siteConfig.contact.email })}
      </LegalParagraph>
    </LegalPage>
  );
}
