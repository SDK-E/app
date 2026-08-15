import Link from "next/link";
import { Container } from "@/components/layout/Container";

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/legal/mentions-legales" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-dark py-6 text-micro text-fog">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span>© SDK Enterprises</span>
          <span>AI · Software · Cloud · Systems Engineering</span>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fog"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
