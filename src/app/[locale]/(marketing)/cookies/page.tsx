import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LegalH2,
  LegalIntro,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/siteConfig";
import { breadcrumbListJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });
  const title = t("title");
  const description = t("intro");

  return {
    title: `${title} — ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `/${locale}/cookies`,
      languages: {
        en: "/en/cookies",
        fr: "/fr/cookies",
      },
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      url: `/${locale}/cookies`,
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
          { name: title, url: "/cookies" },
        ])
      ),
    },
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{t("whatIsTitle")}</LegalH2>
      <LegalParagraph>{t("whatIs")}</LegalParagraph>

      <LegalH2>{t("thisSiteTitle")}</LegalH2>
      <LegalParagraph>{t("thisSite")}</LegalParagraph>

      <LegalH2>{t("consentBannerTitle")}</LegalH2>
      <LegalParagraph>{t("consentBanner")}</LegalParagraph>

      <LegalH2>{t("browserSettingsTitle")}</LegalH2>
      <LegalParagraph>{t("browserSettings")}</LegalParagraph>
    </LegalPage>
  );
}
