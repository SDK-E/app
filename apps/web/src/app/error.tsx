"use client";

import { useTranslations } from "next-intl";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export default function RootError({
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  const codeMotif = (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      className="text-muted-foreground opacity-50"
      aria-hidden="true"
    >
      <rect x="40" y="30" width="160" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="50" width="120" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="70" width="140" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="110" width="100" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <path d="M40 130 L100 130 L120 110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  return (
    <ErrorPage
      eyebrow={t("serverErrorEyebrow")}
      headline={t("serverErrorTitle")}
      description={t("serverErrorDescription")}
      primaryAction={
        <button
          type="button"
          onClick={reset}
          className="rounded-control bg-brand px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-dark transition-colors motion-reduce:transition-none hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          {t("tryAgain")}
        </button>
      }
      secondaryAction={
        <Button href="/" variant="outline">
          {t("backToHome")}
        </Button>
      }
      tone="light"
      motif={codeMotif}
      locale="en"
    />
  );
}
