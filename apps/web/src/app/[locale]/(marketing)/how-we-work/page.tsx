import type { Metadata } from "next";

import { localizePath } from "@platform/i18n";
import {
  breadcrumbListJsonLd,
  buildMetadata,
  organizationJsonLd,
  webPageJsonLd,
} from "@platform/marketing/seo";
import { Section } from "@platform/ui/Section";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { getHowWeWorkPageData } from "@/components/marketing/getHowWeWorkPageData";
import { HowWeWorkSections } from "@/components/marketing/HowWeWorkSections";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import SiteFooter from "@/components/marketing/SiteFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, tPage] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "howWeWorkPage" }),
  ]);

  const baseMetadata = buildMetadata({
    title: t("howWeWorkTitle"),
    description: t("howWeWorkDescription"),
    path: "/how-we-work",
    locale,
  });

  const ogImagePath = `/${locale}/opengraph-image`;
  const twitterImagePath = `/${locale}/twitter-image`;

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      images: [{ url: ogImagePath, width: 1200, height: 630 }],
    },
    twitter: {
      ...baseMetadata.twitter,
      images: [twitterImagePath],
    },
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "SDK Enterprises", url: "/" },
          { name: t("howWeWorkTitle"), url: "/how-we-work" },
        ]),
        organizationJsonLd(),
        webPageJsonLd(tPage("hero.title"), tPage("hero.intro")),
      ]),
    },
  };
}

export default async function HowWeWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t, tNav, entryPaths, process, responsibility, quality, scopeSteps } =
    await getHowWeWorkPageData(locale);

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
        secondaryCta={{ label: tNav("signIn"), href: `${locale}/login` }}
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
        <HowWeWorkSections
          t={t}
          entryPaths={entryPaths}
          process={process}
          responsibility={responsibility}
          quality={quality}
          scopeSteps={scopeSteps}
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
