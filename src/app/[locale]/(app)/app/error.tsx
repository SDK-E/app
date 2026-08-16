"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { useTranslations } from "next-intl";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("portal.states");
  return (
    <ErrorState
      title={t("errorTitle")}
      description={t("errorBody")}
      action={
        <button type="button" className="underline" onClick={reset}>
          {t("tryAgain")}
        </button>
      }
    />
  );
}
