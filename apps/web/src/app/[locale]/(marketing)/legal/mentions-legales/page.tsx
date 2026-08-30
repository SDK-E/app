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
  const t = await getTranslations({ locale, namespace: "legal.mentionsLegales" });
  const title = t("title");
  const description = t("intro");

  return {
    ...buildMetadata({
      title: `${title} — ${siteConfig.name}`,
      description,
      path: "/legal/mentions-legales",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "Home", url: "/" },
          { name: title, url: "/legal/mentions-legales" },
        ]),
        organizationJsonLd(),
      ]),
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
