import { getTranslations } from "next-intl/server";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });
  return {
    title: t("accessRestrictedTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AccessRestrictedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations({ locale, namespace: "errors" });

  return (
    <ErrorPage
      eyebrow={t("accessRestrictedEyebrow")}
      headline={t("accessRestrictedTitle")}
      description={t("accessRestrictedDescription")}
      primaryAction={
        <Button href={`/${locale}/`} variant="default">
          {t("backToHome")}
        </Button>
      }
      secondaryAction={
        <Button href={`/${locale}/start-a-project`} variant="outline">
          {t("contactUs")}
        </Button>
      }
      tone="dark"
      locale={locale}
    />
  );
}
