import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FitMatrix } from "@/components/marketing/FitMatrix";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import {
  ScenarioStudy,
  type ScenarioStudyItem,
} from "@/components/marketing/ScenarioStudy";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ title: t("workTitle"), description: t("workDescription"), path: "/work", locale });
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "workPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const scenarios = t.raw("scenarios.items") as ScenarioStudyItem[];

  return (
    <div className="flex min-h-screen flex-col bg-light text-dark">
      <Header
        links={[
          { label: tNav("services"), href: "/services" },
          { label: tNav("work"), href: "/work" },
          { label: tNav("process"), href: "/how-we-work" },
          { label: tNav("about"), href: "/about" },
        ]}
        cta={{ label: tNav("discussProject"), href: "/start-a-project" }}
        secondaryCta={{ label: tNav("signIn"), href: `/${locale}/login` }}
        activeLabel={tNav("work")}
        translationsNamespace="nav"
        locale={locale}
      />
      <main>
        <PageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          intro={t("hero.intro")}
          primaryCta={{ label: t("hero.primaryCta"), href: localizePath(locale, "/start-a-project") }}
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#scenarios" }}
          signals={t.raw("hero.signals") as string[]}
        />
        <Section id="scenarios">
          <SectionHeader eyebrow={t("scenarios.eyebrow")} title={t("scenarios.heading")} intro={t("scenarios.intro")} />
          {scenarios.map((scenario) => (
            <ScenarioStudy
              key={scenario.number}
              item={scenario}
              labels={{ signals: t("scenarios.labels.signals"), questions: t("scenarios.labels.questions"), deliverables: t("scenarios.labels.deliverables") }}
            />
          ))}
        </Section>
        <Section tone="dark">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-[70px]">
            <p className="text-label font-bold uppercase tracking-eyebrow text-brand">{t("principle.eyebrow")}</p>
            <div>
              <h2 className="max-w-[18ch] text-[36px] font-extrabold tracking-title md:text-title">{t("principle.heading")}</h2>
              <p className="mt-5 max-w-[65ch] text-body text-fog md:text-lead">{t("principle.body")}</p>
            </div>
          </div>
        </Section>
        <Section>
          <SectionHeader eyebrow={t("fit.eyebrow")} title={t("fit.heading")} intro={t("fit.intro")} />
          <FitMatrix
            fitTitle={t("fit.fitTitle")}
            notFitTitle={t("fit.notFitTitle")}
            fitItems={t.raw("fit.fitItems") as string[]}
            notFitItems={t.raw("fit.notFitItems") as string[]}
          />
        </Section>
        <Section tone="brand">
          <ProjectCta eyebrow={t("cta.eyebrow")} title={t("cta.title")} body={t("cta.body")} cta={{ label: t("cta.label"), href: localizePath(locale, "/start-a-project") }} />
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
