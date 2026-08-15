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
