import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import ProcessSection from "@/components/marketing/ProcessSection";
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
    title: t("howWeWorkTitle"),
    description: t("howWeWorkDescription"),
    path: "/how-we-work",
    locale,
  });
}

export default async function HowWeWorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howWeWorkPage" });
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
        </Section>
        <ProcessSection locale={locale} />
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("expectEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("expectHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("expectIntro")}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: t("understandTitle"), body: t("understandBody") },
              { title: t("designTitle"), body: t("designBody") },
              { title: t("buildTitle"), body: t("buildBody") },
              { title: t("handoverTitle"), body: t("handoverBody") },
            ].map((step) => (
              <div key={step.title} className="rounded-card border border-line bg-paper p-6">
                <h3 className="text-h3">{step.title}</h3>
                <p className="mt-3 text-body text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section tone="dark">
          <p className="text-micro font-bold uppercase tracking-eyebrow text-fog">{t("deliverablesEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("deliverablesHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-fog">{t("deliverablesBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("deliverable1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("deliverable1Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("deliverable2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("deliverable2Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6">
              <h3 className="text-h3">{t("deliverable3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("deliverable3Body")}</p>
            </div>
          </div>
        </Section>
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("principlesEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("principlesHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("principlesBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("principle1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("principle1Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("principle2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("principle2Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("principle3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("principle3Body")}</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <h3 className="text-h3">{t("principle4Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("principle4Body")}</p>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
