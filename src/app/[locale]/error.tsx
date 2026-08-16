"use client";

import type { Metadata } from "next";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Something went wrong — SDK Enterprises",
  robots: { index: false, follow: false },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-light px-6 text-center">
      <h1 className="text-h1">{t("somethingWentWrong")}</h1>
      <p className="text-body text-muted-foreground">{t("contactSupport")}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-control bg-brand px-4 py-2 text-label font-semibold uppercase tracking-eyebrow text-dark transition-colors hover:bg-brand/90"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
