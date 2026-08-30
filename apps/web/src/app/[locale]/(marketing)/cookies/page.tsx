import type { Metadata } from "next";

import { siteConfig } from "@platform/config/site";
import { breadcrumbListJsonLd, buildMetadata, organizationJsonLd } from "@platform/marketing/seo";
import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/marketing/LegalPage";
import { LegalH2, LegalIntro, LegalParagraph, LegalTitle } from "@/components/marketing/LegalText";

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
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
    ...buildMetadata({
      title: `${title} — ${siteConfig.name}`,
      description,
      path: "/cookies",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "Home", url: "/" },
          { name: title, url: "/cookies" },
        ]),
        organizationJsonLd(),
      ]),
    },
  };
}
