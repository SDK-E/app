import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Page not found — SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-light px-6 text-center">
      <h1 className="text-h1">404</h1>
      <p className="text-body text-muted-foreground">{t("pageNotFound")}</p>
      <Link
        href="/"
        className="text-label font-bold uppercase tracking-eyebrow text-dark underline underline-offset-4"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
