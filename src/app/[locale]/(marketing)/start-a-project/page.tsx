import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EnquiryForm } from "@/components/marketing/EnquiryForm";
import { PageHero } from "@/components/marketing/PageHero";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";
import SiteFooter from "@/components/marketing/SiteFooter";
import { buildMetadata } from "@/lib/marketing/seo";
import { siteConfig } from "@/lib/marketing/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({
    title: t("startAProjectTitle"),
    description: t("startAProjectDescription"),
    path: "/start-a-project",
    locale,
  });
}

export default async function StartAProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "enquiry" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const reasons = t.raw("reasons") as QualityFrameworkItem[];
  const nextSteps: QualityFrameworkItem[] = [1, 2, 3, 4].map((number) => ({
    number: `0${number}`,
    title: t(`nextStep${number}Title`),
    copy: t(`nextStep${number}Body`),
  }));

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

        <Section id="project-form" tone="dark">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-[70px]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow text-brand">
                {t("formEyebrow")}
              </p>
              <h2 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
                {t("formHeading")}
              </h2>
              <p className="mt-5 max-w-[52ch] text-body text-section-muted">{t("formIntro")}</p>
              <div className="mt-8 border-t border-dark-deep pt-6 text-body text-section-muted">
                <p>{t("body")}</p>
                <p className="mt-4">
                  <a
                    className="font-bold text-light underline underline-offset-4"
                    href={`mailto:${siteConfig.contact.email}`}
                  >
                    {siteConfig.contact.email}
                  </a>
                  <br />
                  <a
                    className="font-bold text-light underline underline-offset-4"
                    href={`tel:${siteConfig.contact.phone.replaceAll(" ", "")}`}
                  >
                    {siteConfig.contact.phone}
                  </a>
                </p>
              </div>
            </div>
            <div className="rounded-card border border-line bg-light p-5 text-dark md:p-8">
              <EnquiryForm />
            </div>
          </div>
        </Section>

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
