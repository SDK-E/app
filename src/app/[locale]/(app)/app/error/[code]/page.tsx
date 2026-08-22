import { getTranslations } from "next-intl/server";

import { PortalErrorPage } from "@/components/layout/PortalErrorPage";

const errorConfig: Record<
  string,
  { label: string; eyebrow?: string; titleKey: string; descriptionKey?: string; backHref: string }
> = {
  "access-not-granted": {
    label: "403",
    eyebrow: "403 / ACCESS RESTRICTED",
    titleKey: "accessRestrictedTitle",
    descriptionKey: "accessRestrictedDescription",
    backHref: "/app",
  },
  "server-error": {
    label: "500",
    eyebrow: "500 / SERVER ERROR",
    titleKey: "serverErrorTitle",
    descriptionKey: "serverErrorDescription",
    backHref: "/",
  },
};

export default async function PortalErrorPageRoute({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const [{ locale, code }] = await Promise.all([params]);
  const config = errorConfig[code] ?? errorConfig["server-error"];
  const t = await getTranslations({ locale, namespace: "errors" });

  return (
    <PortalErrorPage
      locale={locale}
      label={config.label}
      title={t(config.titleKey)}
      description={config.descriptionKey ? t(config.descriptionKey) : undefined}
      action={
        <a
          href={`/${locale}${config.backHref}`}
          className="text-label font-extrabold uppercase tracking-eyebrow underline decoration-brand decoration-2 underline-offset-4 hover:opacity-80"
        >
          {code === "server-error" ? t("backToHome") : t("accessNotGrantedBack")}
        </a>
      }
    />
  );
}
