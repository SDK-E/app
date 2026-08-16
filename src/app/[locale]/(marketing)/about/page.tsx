import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import SiteFooter from "@/components/marketing/SiteFooter";
import { siteConfig } from "@/lib/siteConfig";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const facts = [
    { key: "name", value: siteConfig.contact.company },
    { key: "tradingName", value: "SDK Enterprises" },
    { key: "siren", value: siteConfig.contact.siren },
    { key: "siret", value: siteConfig.contact.siret },
    { key: "address", value: siteConfig.contact.address },
    { key: "email", value: siteConfig.contact.email },
    { key: "phone", value: siteConfig.contact.phone },
  ];

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
        translationsNamespace="nav"
        locale={locale}
      />
      <main>
        <Section>
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
          <p className="max-w-[65ch] text-body text-muted-foreground">
            {t("body")}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.key} className="rounded-card border border-line bg-paper p-6">
                <p className="text-label font-bold uppercase tracking-eyebrow text-muted-foreground">
                  {t(`companyFacts.${fact.key}`)}
                </p>
                <p className="mt-3 text-body">{fact.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <ArrowLink href="/start-a-project">{t("cta")} →</ArrowLink>
          </div>
        </Section>
        <Section tone="dark">
          <p className="text-micro font-bold uppercase tracking-eyebrow text-fog">{t("approachEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("approachHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-fog">{t("approachBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("approach1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("approach1Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("approach2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("approach2Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("approach3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("approach3Body")}</p>
            </div>
          </div>
        </Section>
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("beliefsEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("beliefsHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("beliefsBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("belief1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("belief1Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("belief2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("belief2Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("belief3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("belief3Body")}</p>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
