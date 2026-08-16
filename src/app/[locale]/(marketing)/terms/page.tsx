import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { LegalH2, LegalIntro, LegalParagraph, LegalTitle } from "@/components/marketing/LegalText";
import { siteConfig } from "@/lib/siteConfig";
import { getTranslations } from "next-intl/server";
import { breadcrumbListJsonLd } from "@/lib/seo";

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
    title: `${title} — ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `/${locale}/terms`,
      languages: {
        en: "/en/terms",
        fr: "/fr/terms",
      },
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      url: `/${locale}/terms`,
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
          { name: title, url: "/terms" },
        ])
      ),
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
