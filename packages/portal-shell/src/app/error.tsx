"use client";

import { PortalErrorPage } from "@sdk-e/portal-shell/PortalErrorPage";
import { useTranslations } from "next-intl";

export default function AppError({
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("portal.states");

  return (
    <PortalErrorPage
      locale="en"
      label="Error"
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
