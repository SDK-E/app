import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import SiteFooter from "@/components/marketing/SiteFooter";
import { localizePath } from "@sdk-e/i18n";
import { siteConfig } from "@sdk-e/config/site";
import { buildMetadata } from "@sdk-e/marketing/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "/about",
    locale,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "aboutPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const modelItems = t.raw("model.items") as QualityFrameworkItem[];
  const selectionItems = t.raw("selection.items") as QualityFrameworkItem[];
  const responsibilities = t.raw("responsibility.items") as string[];
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
      <Header
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
        <Section id="company-model" tone="dark">
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
        <Section tone="dark">
          <SectionHeader
            eyebrow={t("responsibility.eyebrow")}
            title={t("responsibility.heading")}
            intro={t("responsibility.body")}
          />
          <ul className="grid gap-px overflow-hidden rounded-card border border-dark-deep bg-dark-deep sm:grid-cols-2 lg:grid-cols-3">
            {responsibilities.map((item, index) => (
              <li key={item} className="min-h-32 bg-dark p-6">
                <span className="text-label font-bold text-brand">0{index + 1}</span>
                <p className="mt-5 text-body font-bold text-light">{item}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section>
          <SectionHeader eyebrow={t("facts.eyebrow")} title={t("facts.heading")} />
          <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-paper p-6">
                <dt className="text-label font-bold uppercase tracking-eyebrow text-dark">
                  {fact.label}
                </dt>
                <dd className="mt-3 break-words text-body text-dark">{fact.value}</dd>
              </div>
            ))}
          </dl>
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
