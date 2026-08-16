import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import SiteFooter from "@/components/marketing/SiteFooter";

const NAV_LINKS = [
  { labelKey: "services", href: "/services" },
  { labelKey: "work", href: "/work" },
  { labelKey: "process", href: "/how-we-work" },
  { labelKey: "about", href: "/about" },
];

export async function LegalPage({ locale, children }: { locale: string; children: ReactNode }) {
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="flex min-h-screen flex-col bg-paper text-dark">
      <Header
        links={NAV_LINKS.map((link) => ({
          label: t(link.labelKey),
          href: `/${locale}${link.href}`,
        }))}
        cta={{ label: t("discussProject"), href: `/${locale}/start-a-project` }}
        secondaryCta={{ label: t("signIn"), href: `/${locale}/login` }}
        translationsNamespace="nav"
        locale={locale}
      />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-6 py-14 sm:px-8 md:py-16">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
