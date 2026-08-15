import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import SiteFooter from "@/components/marketing/SiteFooter";

const NAV_LINKS = [
  { labelKey: "services", href: "/#services" },
  { labelKey: "work", href: "/#work" },
  { labelKey: "process", href: "/#process" },
  { labelKey: "about", href: "/#about" },
];

export async function LegalPage({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="bg-paper text-dark">
      <Header
        links={NAV_LINKS.map((link) => ({
          label: t(link.labelKey),
          href: link.href,
        }))}
        cta={{ label: t("discussProject"), href: "/#about" }}
        secondaryCta={{ label: t("signIn"), href: "/login" }}
        translationsNamespace="nav"
        locale={locale}
      />
      <main className="mx-auto w-full max-w-[1220px] px-6 py-14 sm:px-8 md:py-16">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
