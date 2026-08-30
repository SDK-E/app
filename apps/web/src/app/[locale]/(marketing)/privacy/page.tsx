import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalList,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { siteConfig } from "@sdk-e/config/site";
import { getTranslations } from "next-intl/server";
import { breadcrumbListJsonLd } from "@sdk-e/marketing/seo";

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
    title: `${title} — ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        en: "/en/privacy",
        fr: "/fr/privacy",
      },
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      url: `/${locale}/privacy`,
      images: [{ url: "/brand/sdk-thumbnail-light.png", width: 1200, height: 628 }],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${siteConfig.name}`,
      description,
      images: ["/brand/sdk-thumbnail-light.png"],
    },
    other: {
      "script:ld+json": JSON.stringify(
        breadcrumbListJsonLd([
          { name: "Home", url: "/" },
          { name: title, url: "/privacy" },
        ])
      ),
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const processors = t.raw("processors") as Array<{ name: string; role: string }>;

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
