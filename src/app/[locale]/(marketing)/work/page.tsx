import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import EngagementsSection from "@/components/marketing/EngagementsSection";
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
    title: t("workTitle"),
    description: t("workDescription"),
    path: "/work",
    locale,
  });
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workPage" });
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
        <EngagementsSection locale={locale} />
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("engagementsEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("engagementsHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("engagementsBody")}</p>
        </Section>
        <Section tone="dark">
          <p className="text-micro font-bold uppercase tracking-eyebrow text-fog">{t("lookForEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("lookForHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-fog">{t("lookForBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("lookFor1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("lookFor1Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("lookFor2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("lookFor2Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("lookFor3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("lookFor3Body")}</p>
            </div>
          </div>
        </Section>
        <Section>
          <p className="text-micro font-bold uppercase tracking-eyebrow text-muted-foreground">{t("fitEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("fitHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("fitBody")}</p>
          <div className="mt-8">
            <ArrowLink href="/start-a-project">{t("cta")} →</ArrowLink>
          </div>
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
