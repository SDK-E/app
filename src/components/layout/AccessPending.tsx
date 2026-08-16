import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { createCompanyAction } from "@/app/[locale]/(app)/app/company/actions";
import { CompanyCreationForm } from "@/components/portal/CompanyCreationForm";
import type { UnassignedPrincipal } from "@/types";

export async function AccessPending({ principal, locale }: { principal: UnassignedPrincipal; locale: string }) {
  const t = await getTranslations({ locale, namespace: "portal.onboarding" });
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-card border border-line bg-paper p-8 md:p-12">
        <Image
          src="/brand/sdk-logo-light.png"
          alt="SDK Enterprises"
          width={140}
          height={43}
          priority
          className="h-auto w-[140px]"
        />
        <p className="mt-12 text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
        <p className="mt-6 max-w-[60ch] text-body text-muted-foreground">
          {t("intro", { email: principal.email })}
        </p>
        <CompanyCreationForm action={createCompanyAction.bind(null, locale)} label={t("create")} nameLabel={t("name")} />
        <p className="mt-6 text-body text-muted-foreground">{t("alternative")}</p>
        <Link
          href="/auth/logout"
          className="mt-8 inline-flex rounded-control bg-dark px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-light hover:bg-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
        >
          {t("logout")}
        </Link>
      </section>
    </main>
  );
}
