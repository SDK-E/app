import type { Metadata } from "next";

import { hasPermission } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { CompanyCreateForm } from "@platform/portal-staff/components/portal/companies/CompanyCreateForm";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { createSdkCompanyAction } from "./actions";

export const metadata: Metadata = {
  title: "Create company | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function CreateCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || !hasPermission(principal, "company:create")) {
    redirect(`/${locale}/app/companies`);
  }
  const t = await getTranslations({ locale, namespace: "portal.companies.new" });
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-h1 font-extrabold">{t("title")}</h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>
      <div className="mt-6 max-w-xl">
        <CompanyCreateForm
          action={createSdkCompanyAction.bind(null, locale)}
          backTo={`/${locale}/app/companies`}
          nameLabel={t("name")}
          ownerEmailLabel={t("ownerEmail")}
          ownerEmailHelp={t("ownerEmailHelp")}
          submitLabel={t("submit")}
          workingLabel={t("working")}
        />
      </div>
    </section>
  );
}
