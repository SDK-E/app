"use client";

import type { Metadata } from "next";

import { useLocale } from "next-intl";
import { useEffect } from "react";

import { ErrorFooter } from "@/components/Error/ErrorFooter";
import { ErrorHeader } from "@/components/Error/ErrorHeader";
import { ErrorMain } from "@/components/Error/ErrorMain";

export const generateMetadata = async (): Promise<Pick<Metadata, "robots" | "title">> => ({
  title: {
    default: "Something went wrong",
    template: `%s — SDK Enterprises`,
  },
  robots: { index: false, follow: false },
});

export default function LocaleError({
  error,
  reset,
}: {
  error: { digest?: string } & Error;
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background text-foreground">
      <ErrorHeader locale={locale} />
      <ErrorMain
        locale={locale}
        reset={reset}
      />
      <ErrorFooter />
    </div>
  );
}
