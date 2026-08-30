import { getTranslations } from "next-intl/server";

import { Button } from "@sdk-e/ui/Button";
import { ErrorPage } from "@/components/layout/ErrorPage";

export default async function UnauthenticatedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations("errors");

  return (
    <ErrorPage
      eyebrow="401 / UNAUTHENTICATED"
      headline={t("unauthenticatedTitle")}
      description={t("unauthenticatedDescription")}
      primaryAction={
        <Button href={`/${locale}/login`} variant="default">
          {t("unauthenticatedSignIn")}
        </Button>
      }
      tone="light"
      locale={locale}
    />
  );
}
