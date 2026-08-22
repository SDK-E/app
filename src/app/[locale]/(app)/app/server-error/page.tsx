import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/ui/ErrorState";

export default async function ServerErrorPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }] = await Promise.all([params]);
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-light px-6">
      <ErrorState
        label="500"
        title={t("somethingWentWrong")}
        description={t("serverErrorDescription")}
        action={
          <Link
            href={`/${locale}`}
            className="text-label font-extrabold uppercase tracking-eyebrow text-brand hover:underline"
          >
            {t("backToHome")}
          </Link>
        }
      />
    </div>
  );
}
