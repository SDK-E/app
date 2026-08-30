import type { Metadata } from "next";

import { localizePath } from "@platform/i18n";
import {
  breadcrumbListJsonLd,
  buildMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@platform/marketing/seo";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { getLandingPageData } from "@/components/marketing/getLandingPageData";
import { CompanyModelSection } from "@/components/marketing/landing/CompanyModelSection";
import { CtaSection } from "@/components/marketing/landing/CtaSection";
import { EngagementsSection } from "@/components/marketing/landing/EngagementsSection";
import { FitSection } from "@/components/marketing/landing/FitSection";
import { OpeningSection } from "@/components/marketing/landing/OpeningSection";
import { ProcessSection } from "@/components/marketing/landing/ProcessSection";
import { QualitySection } from "@/components/marketing/landing/QualitySection";
import { ScenariosSection } from "@/components/marketing/landing/ScenariosSection";
import { StartingPointsSection } from "@/components/marketing/landing/StartingPointsSection";
import { SystemSection } from "@/components/marketing/landing/SystemSection";
import { PageHero } from "@/components/marketing/PageHero";
import SiteFooter from "@/components/marketing/SiteFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const metadata = buildMetadata({
    title: t("title"),
    description: t("siteDescription"),
    path: "/",
    locale,
  });

  return {
    ...metadata,
    other: {
      [`script:ld+json`]: JSON.stringify([
        organizationJsonLd(),
        websiteJsonLd(),
        breadcrumbListJsonLd([{ name: "SDK Enterprises", url: "/" }]),
      ]),
    },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const {
    t,
    tNav,
    startingPoints,
    openingPrinciples,
    systemItems,
    scenarios,
    companyModel,
    engagementOptions,
    processItems,
    qualityItems,
  } = await getLandingPageData(locale);

  return (
    <div className="bg-background text-foreground">
      <PublicHeader
        links={[
          { label: tNav("services"), href: "/services" },
          { label: tNav("work"), href: "/work" },
          { label: tNav("process"), href: "/how-we-work" },
          { label: tNav("about"), href: "/about" },
        ]}
        cta={{ label: tNav("discussProject"), href: "/start-a-project" }}
        secondaryCta={{ label: tNav("signIn"), href: `/${locale}/login` }}
        translationsNamespace="nav"
        locale={locale}
      />
      <main>
        <PageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          intro={t("hero.intro")}
          primaryCta={{
            label: t("hero.primaryCta"),
            href: localizePath(locale, "/start-a-project"),
          }}
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#starting-points" }}
          signals={t.raw("hero.signals") as string[]}
        />

        <StartingPointsSection
          locale={locale}
          items={startingPoints}
        />
        <OpeningSection
          locale={locale}
          items={openingPrinciples}
        />
        <SystemSection
          locale={locale}
          items={systemItems}
        />
        <ScenariosSection
          locale={locale}
          items={scenarios}
        />
        <CompanyModelSection
          locale={locale}
          items={companyModel}
        />
        <EngagementsSection
          locale={locale}
          options={engagementOptions}
        />
        <ProcessSection
          locale={locale}
          items={processItems}
        />
        <QualitySection
          locale={locale}
          items={qualityItems}
        />
        <FitSection locale={locale} />
        <CtaSection locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
