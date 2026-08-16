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
import { breadcrumbListJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.mentionsLegales" });
  const title = t("title");
  const description = t("intro");

  return {
    title: `${title} — ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `/${locale}/legal/mentions-legales`,
      languages: {
        en: "/en/legal/mentions-legales",
        fr: "/fr/legal/mentions-legales",
      },
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      url: `/${locale}/legal/mentions-legales`,
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
          { name: title, url: "/legal/mentions-legales" },
        ])
      ),
    },
  };
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.mentionsLegales" });

  return (
    <LegalPage locale={locale}>
      <LegalTitle>{t("title")}</LegalTitle>
      <LegalIntro>{t("intro")}</LegalIntro>

      <LegalH2>{t("publisherTitle")}</LegalH2>
      <LegalParagraph>
        {t("publisherWebsite", {
          domain: siteConfig.name.toLowerCase().replace(/\s+/g, "."),
          company: siteConfig.contact.company,
          name: siteConfig.name,
        })}
      </LegalParagraph>
      <LegalList
        items={[
          t("siren", { siren: siteConfig.contact.siren }),
          t("siret", { siret: siteConfig.contact.siret }),
          t("registeredOffice", { address: siteConfig.contact.address }),
          t("legalForm"),
          t("registration", { siren: siteConfig.contact.siren }),
        ]}
      />
      <LegalH2>{t("directorTitle")}</LegalH2>
      <LegalParagraph>{t("director")}</LegalParagraph>
      <LegalH2>{t("hostingTitle")}</LegalH2>
      <LegalParagraph>{t("hosting")}</LegalParagraph>
      <LegalH2>{t("contactTitle")}</LegalH2>
      <LegalParagraph>
        {t("contact", { email: siteConfig.contact.email, phone: siteConfig.contact.phone })}
      </LegalParagraph>
      <LegalH2>{t("intellectualPropertyTitle")}</LegalH2>
      <LegalParagraph>{t("intellectualProperty")}</LegalParagraph>
      <LegalH2>{t("legalFrameworkTitle")}</LegalH2>
      <LegalParagraph>{t("legalFramework")}</LegalParagraph>
    </LegalPage>
  );
}
