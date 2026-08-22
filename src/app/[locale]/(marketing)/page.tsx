import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { CtaSection } from "@/components/marketing/landing/CtaSection";
import { CompanyModelSection } from "@/components/marketing/landing/CompanyModelSection";
import { EngagementsSection } from "@/components/marketing/landing/EngagementsSection";
import { FitSection } from "@/components/marketing/landing/FitSection";
import { OpeningSection } from "@/components/marketing/landing/OpeningSection";
import { ProcessSection } from "@/components/marketing/landing/ProcessSection";
import { QualitySection } from "@/components/marketing/landing/QualitySection";
import { ScenariosSection } from "@/components/marketing/landing/ScenariosSection";
import { StartingPointsSection } from "@/components/marketing/landing/StartingPointsSection";
import { SystemSection } from "@/components/marketing/landing/SystemSection";
import type { EngagementOption } from "@/components/marketing/EngagementComparison";
import type { HomeSystemMapItem } from "@/components/marketing/HomeSystemMap";
import { PageHero } from "@/components/marketing/PageHero";
import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import type { QualityFrameworkItem } from "@/components/marketing/QualityFramework";
import type { ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@/i18n";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/marketing/seo";

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
      "script:ld+json": JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
    },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tNav, tServices, tWork, tProcess, tAbout] = await Promise.all([
    getTranslations({ locale, namespace: "homePage" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "servicesPage" }),
    getTranslations({ locale, namespace: "workPage" }),
    getTranslations({ locale, namespace: "howWeWorkPage" }),
    getTranslations({ locale, namespace: "aboutPage" }),
  ]);

  const serviceAnchors = [
    "/services#modernization",
    "/services#platforms",
    "/services#ai-automation",
    "/services#production-systems",
    "/services#engagements",
  ].map((path) => localizePath(locale, path));
  const startingPoints = (tServices.raw("navigator.items") as ProblemNavigatorItem[]).map(
    (item, index) => ({ ...item, href: serviceAnchors[index] })
  );
  const openingPrinciples = t.raw("opening.principles") as QualityFrameworkItem[];
  const systemItems = t.raw("system.items") as HomeSystemMapItem[];
  const scenarios = tWork.raw("scenarios.items") as ScenarioStudyItem[];
  const companyModel = tAbout.raw("model.items") as QualityFrameworkItem[];
  const engagementOptions = tServices.raw("engagements.options") as EngagementOption[];
  const processItems = tProcess.raw("process.items") as ProcessTimelineItem[];
  const qualityItems = tProcess.raw("quality.items") as QualityFrameworkItem[];

  return (
    <div className="bg-background text-foreground">
      <Header
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

        <StartingPointsSection locale={locale} items={startingPoints} />
        <OpeningSection locale={locale} items={openingPrinciples} />
        <SystemSection locale={locale} items={systemItems} />
        <ScenariosSection locale={locale} items={scenarios} />
        <CompanyModelSection locale={locale} items={companyModel} />
        <EngagementsSection locale={locale} options={engagementOptions} />
        <ProcessSection locale={locale} items={processItems} />
        <QualitySection locale={locale} items={qualityItems} />
        <FitSection locale={locale} />
        <CtaSection locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
