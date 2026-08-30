"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { locales } from "@sdk-e/i18n";

export function HtmlLang() {
  const pathname = usePathname();
  const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) ?? "en";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
