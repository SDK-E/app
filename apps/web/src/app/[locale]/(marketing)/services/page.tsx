import type { Metadata } from "next";

import { localizePath } from "@platform/i18n";
import {
  breadcrumbListJsonLd,
  buildMetadata,
  organizationJsonLd,
  professionalServiceJsonLd,
} from "@platform/marketing/seo";
import { Section } from "@platform/ui/Section";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { getServicesPageData } from "@/components/marketing/getServicesPageData";
import { PageHero } from "@/components/marketing/PageHero";
import { ProjectCta } from "@/components/marketing/ProjectCta";
import { ServicesCapabilities } from "@/components/marketing/ServicesCapabilities";
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
      title: t("servicesTitle"),
      description: t("servicesDescription"),
      path: "/services",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        professionalServiceJsonLd(),
        organizationJsonLd(),
        breadcrumbListJsonLd([
          { name: "SDK Enterprises", url: "/" },
          { name: t("servicesTitle"), url: "/services" },
        ]),
      ]),
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t, tNav, navigatorItems, capabilities, engagementOptions, teamSteps } =
    await getServicesPageData(locale);

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
        <ServicesCapabilities
          t={t}
          navigatorItems={navigatorItems}
          capabilities={capabilities}
          engagementOptions={engagementOptions}
          teamSteps={teamSteps}
          locale={locale}
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
