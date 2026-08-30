import type { Metadata } from "next";

import { getCurrentPrincipal } from "@platform/auth/identity";
import { Locale, locales } from "@platform/i18n";
import { buildMetadata } from "@platform/marketing/seo";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";

import { InlineThemeScript } from "@/components/layout/InlineThemeScript";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("siteDescription");

  return buildMetadata({
    title,
    description,
    path: "/",
    locale,
  });
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <InlineThemeScript initialTheme={principal?.preferredTheme ?? "system"} />
        {children}
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
