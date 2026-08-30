import { getTranslations } from "next-intl/server";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });
  return {
    title: t("maintenanceTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function MaintenancePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });

  const statusMotif = (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      className="text-fog opacity-60"
      aria-hidden="true"
    >
      <circle cx="120" cy="70" r="8" fill="#2cdb16" />
      <rect x="40" y="110" width="160" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="130" width="100" height="8" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );

  return (
    <ErrorPage
      eyebrow={t("maintenanceEyebrow")}
      headline={t("maintenanceTitle")}
      description={t("maintenanceDescription")}
      primaryAction={
        <Button href={`/${locale}/`} variant="default">
          {t("refreshPage")}
        </Button>
      }
      tone="dark"
      motif={statusMotif}
      locale={locale}
    />
  );
}
