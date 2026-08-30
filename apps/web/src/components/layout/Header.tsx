"use client";

import { localizePath } from "@platform/i18n";
import { Button } from "@platform/ui/Button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { HeaderDesktopActions } from "./HeaderDesktopActions";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export interface HeaderLink {
  label: string;
  href: string;
}

export function Header({
  links,
  cta,
  secondaryCta,
  activeLabel,
  translationsNamespace = "nav",
  ariaHome,
  ariaMain,
  ariaToggleMenu,
  locale,
  isAuthenticated,
}: {
  links: HeaderLink[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  activeLabel?: string;
  translationsNamespace?: string;
  ariaHome?: string;
  ariaMain?: string;
  ariaToggleMenu?: string;
  locale?: string;
  isAuthenticated?: boolean;
}) {
  const t = useTranslations(translationsNamespace);
  const [open, setOpen] = useState(false);
  const resolvedSecondaryCta = isAuthenticated
    ? { label: t("openPortal"), href: "/app" }
    : secondaryCta;

  return (
    <header className="border-b border-line bg-[var(--header-bg)] text-[var(--header-fg)]">
      <div className="flex h-[78px] items-center justify-between">
        <Link
          href={locale ? `/${locale}/` : "/"}
          aria-label={ariaHome ?? t("home")}
          className="block leading-none"
        >
          <Image
            src="/brand/sdk-logo-light.png"
            alt="SDK Enterprises logo"
            title="SDK Enterprises"
            width={300}
            height={104}
            sizes="(max-width: 768px) 156px, 180px"
            className="h-[26px] w-auto dark:hidden md:h-[30px]"
            priority
          />
          <Image
            src="/brand/sdk-logo-dark.png"
            alt=""
            title="SDK Enterprises"
            width={300}
            height={104}
            sizes="(max-width: 768px) 156px, 180px"
            className="hidden h-[26px] w-auto dark:block md:h-[30px]"
            aria-hidden
            priority
          />
        </Link>

        <nav
          aria-label={ariaMain ?? t("main")}
          className="hidden items-center gap-[26px] md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={locale ? localizePath(locale, link.href) : link.href}
              className={navLinkClass(activeLabel, link.label)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderDesktopActions
          cta={cta}
          resolvedSecondaryCta={resolvedSecondaryCta}
          locale={locale}
        />

        <button
          type="button"
          aria-label={ariaToggleMenu ?? t("toggleMenu")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded-nav p-2 transition-colors motion-reduce:transition-none hover:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-[var(--header-bg)] text-[var(--header-fg)] md:hidden">
          <nav
            aria-label={ariaMain ?? t("main")}
            className="flex flex-col gap-4 py-6"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={locale ? localizePath(locale, link.href) : link.href}
                className={navLinkClass(activeLabel, link.label)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeSwitcher />
              {locale && <LanguageSwitcher />}
            </div>
            {resolvedSecondaryCta ? (
              <Button
                href={
                  locale
                    ? localizePath(locale, resolvedSecondaryCta.href)
                    : resolvedSecondaryCta.href
                }
                variant="outline"
                className="mt-2"
              >
                {resolvedSecondaryCta.label}
              </Button>
            ) : null}
            {cta ? (
              <Button
                href={locale ? localizePath(locale, cta.href) : cta.href}
                variant="dark"
                className="mt-2"
              >
                {cta.label} →
              </Button>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}

function navLinkClass(activeLabel: string | undefined, label: string) {
  return `text-label font-bold uppercase tracking-eyebrow transition-opacity motion-reduce:transition-none hover:opacity-70 ${
    activeLabel === label ? "border-b-2 border-brand" : ""
  }`;
}
