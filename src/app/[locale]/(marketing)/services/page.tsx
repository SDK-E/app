import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  EngagementComparison,
  type EngagementOption,
} from "@/components/marketing/EngagementComparison";
import { PageHero } from "@/components/marketing/PageHero";
import {
  ProblemNavigator,
  type ProblemNavigatorItem,
} from "@/components/marketing/ProblemNavigator";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import { QualityFramework } from "@/components/marketing/QualityFramework";
import { ServiceChapter, type ServiceChapterItem } from "@/components/marketing/ServiceChapter";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@/i18n";
import { buildMetadata } from "@/lib/marketing/seo";

type TeamModelItem = {
  number: string;
  title: string;
  copy: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata({
    title: t("servicesTitle"),
    description: t("servicesDescription"),
    path: "/services",
    locale,
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "servicesPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const serviceAnchors = [
    "#modernization",
    "#platforms",
    "#ai-automation",
    "#production-systems",
    "#engagements",
  ];
  const navigatorItems = (t.raw("navigator.items") as ProblemNavigatorItem[]).map(
    (item, index) => ({ ...item, href: serviceAnchors[index] })
  );
  const capabilityAnchors = [
    "modernization",
    "platforms",
    "ai-automation",
    "production-systems",
    "data-interfaces",
  ];
  const capabilities = (t.raw("capabilities.items") as ServiceChapterItem[]).map((item, index) => ({
    ...item,
    id: capabilityAnchors[index],
  }));
  const engagementOptions = t.raw("engagements.options") as EngagementOption[];
  const teamSteps = t.raw("teamModel.steps") as TeamModelItem[];

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
        activeLabel={tNav("services")}
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

        <Section id="starting-points" tone="dark">
          <div className="[&_a]:text-light [&_h2]:text-light [&_ol]:border-light [&_li]:border-[#2d4b28] [&_span]:text-fog [&_span:nth-child(2)]:text-light">
            <ProblemNavigator
              heading={t("navigator.heading")}
              intro={t("navigator.intro")}
              items={navigatorItems}
            />
          </div>
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("capabilities.eyebrow")}
            title={t("capabilities.heading")}
            intro={t("capabilities.intro")}
          />
          <div>
            {capabilities.map((capability) => (
              <ServiceChapter
                key={capability.id}
                item={capability}
                labels={{
                  investigation: t("capabilities.labels.investigation"),
                  delivery: t("capabilities.labels.delivery"),
                  evidence: t("capabilities.labels.evidence"),
                  firstStep: t("capabilities.labels.firstStep"),
                }}
              />
            ))}
          </div>
        </Section>

        <Section id="engagements" tone="dark">
          <SectionHeader
            eyebrow={t("engagements.eyebrow")}
            title={t("engagements.heading")}
            intro={t("engagements.intro")}
            tone="dark"
          />
          <EngagementComparison
            labels={{
              bestFor: t("engagements.labels.bestFor"),
              output: t("engagements.labels.output"),
              commitment: t("engagements.labels.commitment"),
            }}
            options={engagementOptions}
          />
        </Section>

        <Section>
          <SectionHeader
            eyebrow={t("teamModel.eyebrow")}
            title={t("teamModel.heading")}
            intro={t("teamModel.body")}
          />
          <QualityFramework items={teamSteps} />
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
