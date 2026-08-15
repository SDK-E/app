import { Header } from "@/components/layout/Header";
import ContactSection from "@/components/marketing/ContactSection";
import EngagementsSection from "@/components/marketing/EngagementsSection";
import Hero from "@/components/marketing/Hero";
import ProcessSection from "@/components/marketing/ProcessSection";
import ServicesSection from "@/components/marketing/ServicesSection";
import SiteFooter from "@/components/marketing/SiteFooter";
import WhySdkSection from "@/components/marketing/WhySdkSection";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = `${t("title")} — ${t("siteDescription").split(".")[0]}`;
  const description = t("siteDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/`,
      languages: {
        en: "/en/",
        fr: "/fr/",
      },
    },
    openGraph: {
      title,
      description,
      siteName: t("title"),
      url: `/${locale}/`,
      images: [{ url: "/brand/sdk-thumbnail-light.png", width: 1200, height: 628 }],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/sdk-thumbnail-light.png"],
    },
    other: {
      "script:ld+json": JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="bg-light text-dark">
      <Header
        links={[
          { label: t("services"), href: "#services" },
          { label: t("work"), href: "#work" },
          { label: t("process"), href: "#process" },
          { label: t("about"), href: "#about" },
        ]}
        cta={{ label: t("discussProject"), href: "#about" }}
        secondaryCta={{ label: t("signIn"), href: `/${locale}/login` }}
        translationsNamespace="nav"
        locale={locale}
      />
      <main>
        <Hero locale={locale} />
        <ServicesSection locale={locale} />
        <WhySdkSection locale={locale} />
        <EngagementsSection locale={locale} />
        <ProcessSection locale={locale} />
        <ContactSection locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}