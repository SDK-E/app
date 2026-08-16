"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LOCALES = [
  { code: "en", label: "English", country: "GB" },
  { code: "fr", label: "Français", country: "FR" },
  { code: "de", label: "Deutsch", country: "DE" },
  { code: "es", label: "Español", country: "ES" },
  { code: "pt", label: "Português", country: "PT" },
  { code: "it", label: "Italiano", country: "IT" },
  { code: "nl", label: "Nederlands", country: "NL" },
  { code: "sv", label: "Svenska", country: "SE" },
  { code: "no", label: "Norsk", country: "NO" },
  { code: "da", label: "Dansk", country: "DK" },
  { code: "fi", label: "Suomi", country: "FI" },
  { code: "pl", label: "Polski", country: "PL" },
  { code: "cs", label: "Čeština", country: "CZ" },
  { code: "hu", label: "Magyar", country: "HU" },
  { code: "ro", label: "Română", country: "RO" },
  { code: "bg", label: "Български", country: "BG" },
  { code: "el", label: "Ελληνικά", country: "GR" },
];

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function LanguageSwitcher({ updateLocale }: { updateLocale?: (locale: string) => Promise<{ ok: boolean }> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const locale = pathname.split("/")[1] ?? "en";
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const switchLocale = async (code: string) => {
    if (updateLocale) {
      const result = await updateLocale(code);
      if (!result.ok) return;
    }
    const segments = pathname.split("/");
    segments[1] = code;
    const newPathname = segments.join("/");
    const search = window.location.search;
    router.push(`${newPathname}${search}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-micro font-medium text-dark hover:bg-line/40 transition-colors motion-reduce:transition-none"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={current.label}
      >
        <span className="text-base leading-none">{getFlagEmoji(current.country)}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 max-h-[60vh] overflow-y-auto rounded border border-line bg-light py-1 shadow-sm z-50"
          role="listbox"
          aria-label="Select language"
        >
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => void switchLocale(loc.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-micro transition-colors motion-reduce:transition-none ${
                loc.code === locale
                  ? "bg-dark text-light"
                  : "text-dark hover:bg-line/40"
              }`}
              role="option"
              aria-selected={loc.code === locale}
            >
              <span className="text-base leading-none">{getFlagEmoji(loc.country)}</span>
              <span>{loc.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
