import { getTranslations } from "next-intl/server";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });
  return {
    title: t("connectionTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function OfflinePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });

  const networkMotif = (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      className="text-muted-foreground opacity-50"
      aria-hidden="true"
    >
      <circle cx="80" cy="100" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="160" cy="60" r="4" fill="currentColor" opacity="0.4" />
      <path
        d="M80 100 L160 60"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.4"
      />
    </svg>
  );

  return (
    <ErrorPage
      eyebrow={t("connectionEyebrow")}
      headline={t("connectionTitle")}
      description={t("connectionDescription")}
      primaryAction={
        <Button href={`/${locale}/`} variant="default">
          {t("retryConnection")}
        </Button>
      }
      secondaryAction={
        <Button href={`/${locale}/`} variant="outline">
          {t("backToHome")}
        </Button>
      }
      tone="light"
      motif={networkMotif}
      locale={locale}
    />
  );
}
