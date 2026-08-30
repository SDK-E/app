import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@sdk-e/ui/Container";
import { localizePath } from "@sdk-e/i18n";

const LEGAL_LINKS = [
  { href: "/legal/mentions-legales", key: "mentionsLegales" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
  { href: "/cookies", key: "cookies" },
];

export default async function SiteFooter({
  locale,
  ariaLegal,
}: {
  locale: string;
  ariaLegal?: string;
}) {
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="bg-dark py-6 text-micro text-fog">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span>{tFooter("copyright")}</span>
          <span>{tFooter("tagline")}</span>
          <nav
            aria-label={ariaLegal ?? tNav("legal")}
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localizePath(locale, link.href)}
                className="transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fog"
              >
                {tNav(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
