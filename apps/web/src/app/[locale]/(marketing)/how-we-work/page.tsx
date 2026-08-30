import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { PageHero } from "@/components/marketing/PageHero";
import {
  ProblemNavigator,
  type ProblemNavigatorItem,
} from "@/components/marketing/ProblemNavigator";
import { ProcessTimeline, type ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@sdk-e/i18n";
import { buildMetadata } from "@sdk-e/marketing/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata({
    title: t("howWeWorkTitle"),
    description: t("howWeWorkDescription"),
    path: "/how-we-work",
    locale,
  });
}

export default async function HowWeWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "howWeWorkPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const entryPaths = (t.raw("entryPaths.items") as ProblemNavigatorItem[]).map((item) => ({
    ...item,
    href: "#process",
  }));
  const process = t.raw("process.items") as ProcessTimelineItem[];
  const responsibility = t.raw("responsibility.items") as QualityFrameworkItem[];
  const quality = t.raw("quality.items") as QualityFrameworkItem[];
  const scopeSteps = t.raw("scope.steps") as string[];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        links={[
          { label: tNav("services"), href: "/services" },
          { label: tNav("work"), href: "/work" },
          { label: tNav("process"), href: "/how-we-work" },
          { label: tNav("about"), href: "/about" },
        ]}
        cta={{ label: tNav("discussProject"), href: "/start-a-project" }}
        secondaryCta={{ label: tNav("signIn"), href: `/${locale}/login` }}
        activeLabel={tNav("process")}
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
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#process" }}
          signals={t.raw("hero.signals") as string[]}
        />

        <Section>
          <ProblemNavigator
            heading={t("entryPaths.heading")}
            intro={t("entryPaths.intro")}
            items={entryPaths}
          />
        </Section>

        <Section id="process" tone="dark">
          <SectionHeader
            eyebrow={t("process.eyebrow")}
            title={t("process.heading")}
            intro={t("process.intro")}
          />
          <ProcessTimeline
            items={process}
            labels={{ output: t("process.labels.output"), decision: t("process.labels.decision") }}
          />
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("responsibility.eyebrow")}
            title={t("responsibility.heading")}
            intro={t("responsibility.body")}
          />
          <QualityFramework items={responsibility} />
        </Section>

        <Section tone="dark">
          <SectionHeader
            eyebrow={t("quality.eyebrow")}
            title={t("quality.heading")}
            intro={t("quality.intro")}
          />
          <QualityFramework items={quality} />
        </Section>

        <Section>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-[70px]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow">
                {t("scope.eyebrow")}
              </p>
              <h2 className="mt-4 max-w-[17ch] text-[36px] font-extrabold tracking-title md:text-title">
                {t("scope.heading")}
              </h2>
              <p className="mt-5 max-w-[58ch] text-body text-section-muted">{t("scope.body")}</p>
            </div>
            <ol className="border-t-2 border-current">
              {scopeSteps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[48px_1fr] border-b border-line py-5 text-body"
                >
                  <span className="text-label font-bold text-section-muted">0{index + 1}</span>
                  <span className="font-bold">{step}</span>
                </li>
              ))}
            </ol>
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
