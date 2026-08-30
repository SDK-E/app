import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, Locale } from "@sdk-e/i18n";
import { getSiteUrl } from "@sdk-e/marketing/seo";
import { siteConfig } from "@sdk-e/config/site";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { InlineThemeScript } from "@/components/layout/InlineThemeScript";
import { Toaster } from "sonner";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("siteDescription");

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
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
      siteName: siteConfig.name,
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
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const principal = await getCurrentPrincipal();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <InlineThemeScript initialTheme={principal?.preferredTheme ?? "system"} />
        {children}
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
