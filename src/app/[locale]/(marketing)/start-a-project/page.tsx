import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EnquiryForm } from "@/components/marketing/EnquiryForm";
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
  const t = await getTranslations({ locale, namespace: "enquiry" });
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
          <SectionHeader title={t("title")} intro={t("subtitle")} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-[70px]">
            <div>
              <p className="max-w-[65ch] text-body text-muted-foreground">
                {t("body")}
              </p>
              <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">
                {t("body2")}
              </p>
            </div>
            <div>
              <EnquiryForm />
            </div>
          </div>
        </Section>
        <Section tone="dark">
          <p className="text-micro font-bold uppercase tracking-eyebrow text-fog">{t("nextStepsEyebrow")}</p>
          <h2 className="mt-4 text-title tracking-title">{t("nextStepsHeading")}</h2>
          <p className="mt-4 max-w-[65ch] text-body text-fog">{t("nextStepsBody")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("nextStep1Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("nextStep1Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("nextStep2Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("nextStep2Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("nextStep3Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("nextStep3Body")}</p>
            </div>
            <div className="rounded-card border border-[#2f4d2b] bg-paper p-6 text-dark">
              <h3 className="text-h3">{t("nextStep4Title")}</h3>
              <p className="mt-3 text-body text-muted-foreground">{t("nextStep4Body")}</p>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
