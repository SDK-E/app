"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";

export type HeaderLink = { label: string; href: string };

export function Header({
  links,
  cta,
  activeLabel,
}: {
  links: HeaderLink[];
  cta?: { label: string; href: string };
  activeLabel?: string;
}) {
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
            aria-label="SDK Enterprises home"
            className="text-[26px] font-extrabold text-dark"
          >
            SDK<span className="text-accent">.</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-[26px] md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.label)}>
                {link.label}
              </Link>
            ))}
          </nav>

          {cta ? (
            <div className="hidden md:block">
              <Button href={cta.href} variant="dark">
                {cta.label} →
              </Button>
            </div>
          ) : null}

          <button
            type="button"
            aria-label="Toggle menu"
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
            <nav aria-label="Main" className="flex flex-col gap-4 py-6">
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
