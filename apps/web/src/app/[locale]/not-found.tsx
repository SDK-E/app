import { getTranslations } from "next-intl/server";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export default async function LocaleNotFound({ params }: { params?: Promise<{ locale: string }> }) {
  const resolvedParams = params ? await params : { locale: "en" };
  const { locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: "errors" });

  const routeMotif = (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      className="text-muted-foreground opacity-50"
      aria-hidden="true"
    >
      <path d="M40 120 L100 120 L120 100 L200 100" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="100" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="120" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );

  return (
    <ErrorPage
      eyebrow={t("pageNotFoundEyebrow")}
      headline={t("pageNotFoundHeadline")}
      description={t("pageNotFoundDescription")}
      primaryAction={
        <Button href={`/${locale}/`} variant="default">
          {t("backToHome")}
        </Button>
      }
      tone="light"
      motif={routeMotif}
      locale={locale}
    />
  );
}
