import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import ServicesSection from "@/components/marketing/ServicesSection";
import WhySdkSection from "@/components/marketing/WhySdkSection";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Section } from "@/components/layout/Section";
import SiteFooter from "@/components/marketing/SiteFooter";
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
    title: t("servicesTitle"),
    description: t("servicesDescription"),
    path: "/services",
    locale,
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

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
          <p className="max-w-[65ch] text-body text-muted-foreground">
            {t("body")}
          </p>
          <div className="mt-8">
            <ArrowLink href="/start-a-project">{t("cta")} →</ArrowLink>
          </div>
        </Section>
        <ServicesSection locale={locale} />
        <Section tone="dark">
          <WhySdkSection locale={locale} />
        </Section>
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("engagementEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("engagementHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("engagementBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("engagementModel1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("engagementModel1Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("engagementModel2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("engagementModel2Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("engagementModel3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("engagementModel3Body")}</p>
            </div>
          </div>
        </Section>
        <Section tone="dark">
          <p className="text-micro font-bold uppercase tracking-eyebrow text-fog">{t("whatWeDontDoEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("whatWeDontDoHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-fog">{t("whatWeDontDoBody")}</p>
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
