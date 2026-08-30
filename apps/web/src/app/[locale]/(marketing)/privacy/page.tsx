import type { Metadata } from "next";

import { siteConfig } from "@platform/config/site";
import { breadcrumbListJsonLd, buildMetadata, organizationJsonLd } from "@platform/marketing/seo";
import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalList,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const title = t("title");
  const description = t("intro");

  return {
    ...buildMetadata({
      title: `${title} — ${siteConfig.name}`,
      description,
      path: "/privacy",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "Home", url: "/" },
          { name: title, url: "/privacy" },
        ]),
        organizationJsonLd(),
      ]),
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const processors = t.raw("processors") as { name: string; role: string }[];

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{t("controllerTitle")}</LegalH2>
      <LegalParagraph>
        {t("controller", {
          company: siteConfig.contact.company,
          name: siteConfig.name,
          address: siteConfig.contact.address,
          email: siteConfig.contact.email,
        })}
      </LegalParagraph>

      <LegalH2>{t("collectedDataTitle")}</LegalH2>
      <LegalParagraph>{t("collectedData")}</LegalParagraph>
      <LegalList items={t.raw("collectedDataItems") as string[]} />

      <LegalH2>{t("purposesTitle")}</LegalH2>
      <LegalParagraph>{t("purposesNote")}</LegalParagraph>
      <LegalList items={t.raw("purposeItems") as string[]} />

      <LegalH2>{t("recipientsTitle")}</LegalH2>
      <LegalParagraph>{t("recipientsNote")}</LegalParagraph>
      <LegalList
        items={processors.map((processor) => (
          <span key={processor.name}>
            <strong>{processor.name}</strong> — {processor.role}
          </span>
        ))}
      />

      <LegalH2>{t("transfersTitle")}</LegalH2>
      <LegalParagraph>{t("transfers")}</LegalParagraph>

      <LegalH2>{t("retentionTitle")}</LegalH2>
      <LegalParagraph>{t("retention")}</LegalParagraph>

      <LegalH2>{t("rightsTitle")}</LegalH2>
      <LegalParagraph>{t("rightsNote")}</LegalParagraph>
      <LegalParagraph>{t("rightsContact", { email: siteConfig.contact.email })}</LegalParagraph>

      <LegalH2>{t("childrenTitle")}</LegalH2>
      <LegalParagraph>{t("children")}</LegalParagraph>

      <LegalH2>{t("automatedTitle")}</LegalH2>
      <LegalParagraph>{t("automated")}</LegalParagraph>

      <LegalH2>{t("securityTitle")}</LegalH2>
      <LegalParagraph>{t("security")}</LegalParagraph>

      <LegalH2>{t("registerTitle")}</LegalH2>
      <LegalParagraph>{t("register")}</LegalParagraph>
    </LegalPage>
  );
}
