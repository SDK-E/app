"use client";

import { PortalErrorPage } from "@platform/portal-shell/PortalErrorPage";
import { useTranslations } from "next-intl";

export default function AppError({
  reset,
}: {
  error: { digest?: string } & Error;
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
        <button
          type="button"
          className="underline"
          onClick={reset}
        >
          {t("tryAgain")}
        </button>
      }
    />
  );
}
