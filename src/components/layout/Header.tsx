"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";

export type HeaderLink = { label: string; href: string };

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
}) {
  const t = useTranslations(translationsNamespace);
  const [open, setOpen] = useState(false);

  const navLinkClass = (label: string) =>
    `text-label font-bold uppercase tracking-eyebrow transition-opacity motion-reduce:transition-none hover:opacity-70 ${
      activeLabel === label ? "text-accent" : "text-dark"
    }`;

  return (
    <header className="border-b border-line bg-light">
      <Container>
        <div className="flex h-[78px] items-center justify-between">
          <Link
            href="/"
            aria-label={ariaHome ?? t("home")}
            className="block leading-none"
          >
            <Image
              src="/brand/sdk-logo-light.png"
              alt="SDK Enterprises logo"
              title="SDK Enterprises"
              width={1429}
              height={495}
              className="h-[26px] w-auto md:h-[30px]"
              priority
              unoptimized
            />
          </Link>

          <nav aria-label={ariaMain ?? t("main")} className="hidden items-center gap-[26px] md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.label)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {secondaryCta || cta ? (
              <>
                {secondaryCta ? (
                  <Button href={secondaryCta.href} variant="outline">
                    {secondaryCta.label}
                  </Button>
                ) : null}
                {cta ? (
                  <Button href={cta.href} variant="dark">
                    {cta.label} →
                  </Button>
                ) : null}
              </>
            ) : null}
            {locale && <LanguageSwitcher />}
          </div>

          <button
            type="button"
            aria-label={ariaToggleMenu ?? t("toggleMenu")}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="rounded-nav p-2 text-dark transition-colors motion-reduce:transition-none hover:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark md:hidden"
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
      </Container>

      {open ? (
        <div className="border-t border-line bg-light md:hidden">
          <Container>
            <nav aria-label={ariaMain ?? t("main")} className="flex flex-col gap-4 py-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(link.label)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {locale && (
                <div className="pt-2">
                  <LanguageSwitcher />
                </div>
              )}
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  variant="outline"
                  className="mt-2"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
              {cta ? (
                <Button href={cta.href} variant="dark" className="mt-2">
                  {cta.label} →
                </Button>
              ) : null}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
