"use client";

import { useTranslations } from "next-intl";

import { PortalErrorPage } from "@sdk-e/portal-shell/PortalErrorPage";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("portal.states");
  const tFooter = useTranslations("footer");

  return (
    <PortalErrorPage
      copyright={tFooter("copyright")}
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
