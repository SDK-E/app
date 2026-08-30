import type { Metadata } from "next";

import { localizePath } from "@platform/i18n";
import { breadcrumbListJsonLd, buildMetadata, organizationJsonLd } from "@platform/marketing/seo";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { FitMatrix } from "@/components/marketing/FitMatrix";
import { getWorkPageData } from "@/components/marketing/getWorkPageData";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import { ScenariosSection } from "@/components/marketing/ScenariosSection";
import SiteFooter from "@/components/marketing/SiteFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...buildMetadata({
      title: t("workTitle"),
      description: t("workDescription"),
      path: "/work",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        breadcrumbListJsonLd([
          { name: "SDK Enterprises", url: "/" },
          { name: t("workTitle"), url: "/work" },
        ]),
        organizationJsonLd(),
      ]),
    },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t, tNav, scenarios } = await getWorkPageData(locale);

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
        activeLabel={tNav("work")}
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
          secondaryCta={{ label: t("hero.secondaryCta"), href: "#scenarios" }}
          signals={t.raw("hero.signals") as string[]}
        />
        <ScenariosSection
          t={t}
          scenarios={scenarios}
        />
        <Section tone="dark">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-[70px]">
            <p className="text-label font-bold uppercase tracking-eyebrow text-section-accent">
              {t("principle.eyebrow")}
            </p>
            <div>
              <h2 className="max-w-[18ch] text-[36px] font-extrabold tracking-title md:text-title">
                {t("principle.heading")}
              </h2>
              <p className="mt-5 max-w-[65ch] text-body text-section-muted md:text-lead">
                {t("principle.body")}
              </p>
            </div>
          </div>
        </Section>
        <Section>
          <SectionHeader
            eyebrow={t("fit.eyebrow")}
            title={t("fit.heading")}
            intro={t("fit.intro")}
          />
          <FitMatrix
            fitTitle={t("fit.fitTitle")}
            notFitTitle={t("fit.notFitTitle")}
            fitItems={t.raw("fit.fitItems") as string[]}
            notFitItems={t.raw("fit.notFitItems") as string[]}
          />
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
