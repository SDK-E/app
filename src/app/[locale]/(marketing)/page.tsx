import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import {
  EngagementComparison,
  type EngagementOption,
} from "@/components/marketing/EngagementComparison";
import { FitMatrix } from "@/components/marketing/FitMatrix";
import {
  HomeSystemMap,
  type HomeSystemMapItem,
} from "@/components/marketing/HomeSystemMap";
import { PageHero } from "@/components/marketing/PageHero";
import {
  ProblemNavigator,
  type ProblemNavigatorItem,
} from "@/components/marketing/ProblemNavigator";
import {
  ProcessTimeline,
  type ProcessTimelineItem,
} from "@/components/marketing/ProcessTimeline";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import {
  ScenarioStudy,
  type ScenarioStudyItem,
} from "@/components/marketing/ScenarioStudy";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@/i18n";
import {
  buildMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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
  const startingPoints = (
    tServices.raw("navigator.items") as ProblemNavigatorItem[]
  ).map((item, index) => ({ ...item, href: serviceAnchors[index] }));
  const openingPrinciples = t.raw("opening.principles") as QualityFrameworkItem[];
  const systemItems = t.raw("system.items") as HomeSystemMapItem[];
  const scenarios = tWork.raw("scenarios.items") as ScenarioStudyItem[];
  const companyModel = tAbout.raw("model.items") as QualityFrameworkItem[];
  const engagementOptions = tServices.raw(
    "engagements.options",
  ) as EngagementOption[];
  const processItems = tProcess.raw("process.items") as ProcessTimelineItem[];
  const qualityItems = tProcess.raw("quality.items") as QualityFrameworkItem[];

  return (
    <div className="bg-light text-dark">
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
          primaryCta={{ label: t("hero.primaryCta"), href: localizePath(locale, "/start-a-project") }}
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#starting-points" }}
          signals={t.raw("hero.signals") as string[]}
        />

        <Section id="starting-points">
          <ProblemNavigator
            heading={tServices("navigator.heading")}
            intro={tServices("navigator.intro")}
            items={startingPoints}
          />
        </Section>

        <Section tone="dark">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-[70px]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow text-brand">
                {t("opening.eyebrow")}
              </p>
              <h2 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
                {t("opening.heading")}
              </h2>
            </div>
            <div>
              <p className="max-w-[65ch] text-body text-fog md:text-lead">
                {t("opening.body")}
              </p>
              <p className="mt-5 max-w-[65ch] text-body text-fog">
                {t("opening.body2")}
              </p>
            </div>
          </div>
          <div className="mt-12">
            <QualityFramework items={openingPrinciples} />
          </div>
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("system.eyebrow")}
            title={t("system.heading")}
            intro={t("system.intro")}
          />
          <HomeSystemMap items={systemItems} />
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/services")}>{tServices("hero.secondaryCta")}</ArrowLink>
          </div>
        </Section>

        <Section tone="dark">
          <SectionHeader
            eyebrow={t("scenarios.eyebrow")}
            title={t("scenarios.heading")}
            intro={t("scenarios.intro")}
            tone="dark"
          />
          <div className="rounded-card bg-light p-6 text-dark md:p-8">
            {scenarios.map((scenario) => (
              <ScenarioStudy
                key={scenario.number}
                item={scenario}
                labels={{
                  signals: tWork("scenarios.labels.signals"),
                  questions: tWork("scenarios.labels.questions"),
                  deliverables: tWork("scenarios.labels.deliverables"),
                }}
              />
            ))}
          </div>
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/work")} className="text-light">
              {t("scenarios.link")}
            </ArrowLink>
          </div>
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("companyModel.eyebrow")}
            title={t("companyModel.heading")}
            intro={t("companyModel.intro")}
          />
          <QualityFramework items={companyModel} />
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/about")}>{t("companyModel.link")}</ArrowLink>
          </div>
        </Section>

        <Section tone="dark">
          <SectionHeader
            eyebrow={t("engagements.eyebrow")}
            title={t("engagements.heading")}
            intro={t("engagements.intro")}
            tone="dark"
          />
          <EngagementComparison
            labels={{
              bestFor: tServices("engagements.labels.bestFor"),
              output: tServices("engagements.labels.output"),
              commitment: tServices("engagements.labels.commitment"),
            }}
            options={engagementOptions}
          />
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/services#engagements")} className="text-light">
              {t("engagements.link")}
            </ArrowLink>
          </div>
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("process.eyebrow")}
            title={t("process.heading")}
            intro={t("process.intro")}
          />
          <div className="rounded-card bg-dark px-6 text-light md:px-8">
            <ProcessTimeline
              items={processItems}
              labels={{
                output: tProcess("process.labels.output"),
                decision: tProcess("process.labels.decision"),
              }}
            />
          </div>
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/how-we-work")}>{t("process.link")}</ArrowLink>
          </div>
        </Section>

        <Section tone="dark">
          <SectionHeader
            eyebrow={t("quality.eyebrow")}
            title={t("quality.heading")}
            intro={t("quality.intro")}
            tone="dark"
          />
          <QualityFramework items={qualityItems} />
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/how-we-work")} className="text-light">
              {t("quality.link")}
            </ArrowLink>
          </div>
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("fit.eyebrow")}
            title={t("fit.heading")}
            intro={t("fit.intro")}
          />
          <FitMatrix
            fitTitle={tWork("fit.fitTitle")}
            notFitTitle={tWork("fit.notFitTitle")}
            fitItems={tWork.raw("fit.fitItems") as string[]}
            notFitItems={tWork.raw("fit.notFitItems") as string[]}
          />
          <div className="mt-8">
            <ArrowLink href={localizePath(locale, "/work")}>{t("fit.link")}</ArrowLink>
          </div>
        </Section>

        <Section tone="brand">
          <ProjectCta
            eyebrow={t("cta.eyebrow")}
            title={t("cta.title")}
            body={t("cta.body")}
            cta={{ label: t("cta.label"), href: localizePath(locale, "/start-a-project") }}
          />
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
