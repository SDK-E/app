import { getTranslations } from "next-intl/server";

import { ErrorState } from "@sdk-e/ui/ErrorState";

export async function PortalErrorPage({
  locale,
  label,
  title,
  description,
  action,
}: {
  locale: string;
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <ErrorState label={label} title={title} description={description} action={action} />
      <footer className="mt-auto pt-8 text-micro text-muted-foreground">
        <span>{t("copyright")}</span>
      </footer>
    </div>
  );
}
