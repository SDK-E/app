"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function AccountMenu({
  locale,
  name,
  email,
  avatarUrl,
  profileLabel,
  logoutLabel,
  languageLabel,
  updateLocale,
}: {
  locale: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profileLabel: string;
  logoutLabel: string;
  languageLabel: string;
  updateLocale: (locale: string) => Promise<{ ok: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-3 rounded-control px-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-label text-primary-foreground">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:block">
          <span className="block text-body font-semibold">{name}</span>
          <span className="block text-micro text-muted-foreground">{email}</span>
        </span>
        <span aria-hidden>⌄</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-card border border-line bg-paper p-3 text-dark shadow-sm"
        >
          <p className="px-2 py-2 text-micro uppercase tracking-eyebrow text-dark">
            {languageLabel}
          </p>
          <LanguageSwitcher updateLocale={updateLocale} />
          <div className="my-3 border-t border-line" />
          <Link
            role="menuitem"
            href={`/${locale}/app/profile`}
            onClick={() => setOpen(false)}
            className="block min-h-11 rounded-nav px-3 py-3 text-label font-extrabold uppercase tracking-eyebrow hover:bg-line/40"
          >
            {profileLabel}
          </Link>
          <a
            role="menuitem"
            href="/auth/logout"
            className="block min-h-11 rounded-nav px-3 py-3 text-label font-extrabold uppercase tracking-eyebrow hover:bg-line/40"
          >
            {logoutLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}
