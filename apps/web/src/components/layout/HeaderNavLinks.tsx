import { localizePath } from "@platform/i18n";
import Link from "next/link";

import type { HeaderLink } from "@/components/layout/Header";

interface HeaderNavLinksProps {
  links: HeaderLink[];
  locale?: string;
  activeLabel?: string;
  onItemClick?: () => void;
}

export function HeaderNavLinks({ links, locale, activeLabel, onItemClick }: HeaderNavLinksProps) {
  return links.map((link) => (
    <Link
      key={link.href}
      href={locale ? localizePath(locale, link.href) : link.href}
      className={navLinkClass(activeLabel, link.label)}
      onClick={onItemClick}
    >
      {link.label}
    </Link>
  ));
}

function navLinkClass(activeLabel: string | undefined, label: string) {
  return `text-label font-bold uppercase tracking-eyebrow transition-opacity motion-reduce:transition-none hover:opacity-70 ${
    activeLabel === label ? "border-b-2 border-brand" : ""
  }`;
}
