import type { Metadata } from "next";

import {
  breadcrumbListJsonLd,
  buildMetadata,
  contactPageJsonLd,
  organizationJsonLd,
} from "@platform/marketing/seo";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { EnquirySection } from "@/components/marketing/EnquirySection";
import { getStartAProjectPageData } from "@/components/marketing/getStartAProjectPageData";
import { PageHero } from "@/components/marketing/PageHero";
import { QualityFramework } from "@/components/marketing/QualityFramework";
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
      title: t("startAProjectTitle"),
      description: t("startAProjectDescription"),
      path: "/start-a-project",
      locale,
    }),
    other: {
      [`script:ld+json`]: JSON.stringify([
        contactPageJsonLd(),
        organizationJsonLd(),
        breadcrumbListJsonLd([
          { name: "SDK Enterprises", url: "/" },
          { name: t("startAProjectTitle"), url: "/start-a-project" },
        ]),
      ]),
    },
  };
}

export default async function StartAProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t, tNav, reasons, nextSteps } = await getStartAProjectPageData(locale);

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
        activeLabel={tNav("discussProject")}
        translationsNamespace="nav"
        locale={locale}
      />
      <main>
        <PageHero
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("subtitle")}
          primaryCta={{ label: t("form.submit"), href: "#project-form" }}
          signals={t.raw("heroSignals") as string[]}
        />
        <Section>
          <SectionHeader
            eyebrow={t("reasonsEyebrow")}
            title={t("reasonsHeading")}
            intro={t("reasonsIntro")}
          />
          <QualityFramework items={reasons} />
        </Section>
        <EnquirySection t={t} />
        <Section>
          <SectionHeader
            eyebrow={t("nextStepsEyebrow")}
            title={t("nextStepsHeading")}
            intro={t("nextStepsBody")}
          />
          <QualityFramework items={nextSteps} />
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
