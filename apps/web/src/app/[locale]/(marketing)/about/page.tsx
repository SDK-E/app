import type { Metadata } from "next";

import { siteConfig } from "@platform/config/site";
import { localizePath } from "@platform/i18n";
import {
  aboutPageJsonLd,
  breadcrumbListJsonLd,
  buildMetadata,
  organizationJsonLd,
} from "@platform/marketing/seo";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { FactsSection } from "@/components/marketing/FactsSection";
import { getAboutPageData } from "@/components/marketing/getAboutPageData";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import { QualityFramework } from "@/components/marketing/QualityFramework";
import { ResponsibilitySection } from "@/components/marketing/ResponsibilitySection";
import SiteFooter from "@/components/marketing/SiteFooter";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t, tNav, modelItems, selectionItems, responsibilities } = await getAboutPageData(locale);
  const facts = [
    { label: t("facts.name"), value: siteConfig.contact.company },
    { label: t("facts.tradingName"), value: "SDK Enterprises" },
    { label: t("facts.siren"), value: siteConfig.contact.siren },
    { label: t("facts.siret"), value: siteConfig.contact.siret },
    { label: t("facts.address"), value: siteConfig.contact.address },
    { label: t("facts.email"), value: siteConfig.contact.email },
    { label: t("facts.phone"), value: siteConfig.contact.phone },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader
        links={[
          { label: tNav("services"), href: "/services" },
          { label: tNav("work"), href: "/work" },
          { label: tNav("process"), href: "/how-we-work" },
          { label: tNav("about"), href: "/about" },
        ]}
        cta={{ label: tNav("discussProject"), href: "/start-a-project" }}
        secondaryCta={{ label: tNav("signIn"), href: `/${locale}/login` }}
        activeLabel={tNav("about")}
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
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#company-model" }}
          signals={t.raw("hero.signals") as string[]}
        />
        <Section
          id="company-model"
          tone="dark"
        >
          <SectionHeader
            eyebrow={t("model.eyebrow")}
            title={t("model.heading")}
            intro={t("model.intro")}
          />
          <QualityFramework items={modelItems} />
        </Section>
        <Section>
          <SectionHeader
            eyebrow={t("selection.eyebrow")}
            title={t("selection.heading")}
            intro={t("selection.body")}
          />
          <QualityFramework items={selectionItems} />
        </Section>
        <ResponsibilitySection
          t={t}
          items={responsibilities}
        />
        <FactsSection
          t={t}
          items={facts}
        />
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...buildMetadata({
      title: t("aboutTitle"),
      description: t("aboutDescription"),
      path: "/about",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        aboutPageJsonLd(),
        organizationJsonLd(),
        breadcrumbListJsonLd([
          { name: "SDK Enterprises", url: "/" },
          { name: t("aboutTitle"), url: "/about" },
        ]),
      ]),
    },
  };
}
