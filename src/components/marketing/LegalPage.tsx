import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import SiteFooter from "@/components/marketing/SiteFooter";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/#about" },
];

export function LegalPage({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper text-dark">
      <Header
        links={NAV_LINKS}
        cta={{ label: "Discuss a project", href: "/#about" }}
        secondaryCta={{ label: "Sign in", href: "/login" }}
      />
      <main className="mx-auto w-full max-w-[1220px] px-6 py-14 sm:px-8 md:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
