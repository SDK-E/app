"use client";

import type { Metadata } from "next";

import { RootErrorFooter } from "@/components/Error/RootErrorFooter";
import { RootErrorHeader } from "@/components/Error/RootErrorHeader";
import { RootErrorMain } from "@/components/Error/RootErrorMain";

/**
 * Root error boundary. It renders outside `[locale]/layout.tsx`, so no
 * `NextIntlClientProvider` (and no server-only `getTranslations`) is
 * available here. Copy is the English fallback from
 * `packages/i18n/src/locales/en/shared.json` (`errors` + `footer`).
 */
export const generateMetadata = async (): Promise<Pick<Metadata, "robots" | "title">> => ({
  title: "Something went wrong",
  robots: { index: false, follow: false },
});

export default function RootError({
  reset,
}: {
  error: { digest?: string } & Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <RootErrorHeader />
      <RootErrorMain reset={reset} />
      <RootErrorFooter />
    </div>
  );
}
