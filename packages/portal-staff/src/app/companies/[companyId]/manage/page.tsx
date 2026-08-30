import type { Metadata } from "next";

import { hasPermission } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { getCompanyForManagement } from "@platform/companies";
import { UserActionForm } from "@platform/portal-shell/components/portal/UserActionForm";
import { Badge } from "@platform/ui/Badge";
import { Card } from "@platform/ui/Card";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { regenerateAccessCodeAction, setCompanyActiveAction } from "../../actions";

export const metadata: Metadata = {
  title: "Company | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function ManageCompanyPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  const [{ locale, companyId }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  if (principal.kind === "client") {
    const first = principal.memberships[0];
    if (!first) redirect(`/${locale}/app`);
    redirect(`/${locale}/app/companies/${first.companyId}`);
  }
  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: "portal.companies.manage" }),
    getCompanyForManagement(principal, companyId),
  ]);
  const canManage = hasPermission(principal, "company:update");
  return (
    <section>
      <Link
        href={`/${locale}/app/companies`}
        className="text-label font-extrabold uppercase tracking-eyebrow underline underline-offset-4"
      >
        {t("back")}
      </Link>
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-extrabold">{company.name}</h1>
          <Badge tone={company.isActive ? "live" : "neutral"}>
            {company.isActive ? t("active") : t("inactive")}
          </Badge>
        </div>
        <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">
          {company._count.memberships === 1
            ? t("memberCountOne")
            : t("memberCountMany", { count: company._count.memberships })}
          {" · "}
          {t("created", {
            date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
              company.createdAt,
            ),
          })}
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-h3 font-extrabold">{t("details")}</h2>
          <dl className="mt-5 space-y-3 text-body">
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt>{t("slug")}</dt>
              <dd className="font-mono">{company.slug}</dd>
            </div>
            {company.accessCode ? (
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt>{t("accessCode")}</dt>
                <dd className="font-mono uppercase tracking-widest">{company.accessCode}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt>{t("createdDate")}</dt>
              <dd>
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(company.createdAt)}
              </dd>
            </div>
          </dl>
        </Card>

        {canManage ? (
          <Card>
            <h2 className="text-h3 font-extrabold">{t("actions")}</h2>
            <div className="mt-5 flex flex-wrap items-end gap-4">
              <UserActionForm
                action={setCompanyActiveAction.bind(null, locale, companyId)}
                label={company.isActive ? t("deactivate") : t("activate")}
                variant={company.isActive ? "destructive" : "outline"}
              >
                <input
                  type="hidden"
                  name="isActive"
                  value={String(!company.isActive)}
                />
              </UserActionForm>
              <UserActionForm
                action={regenerateAccessCodeAction.bind(null, locale, companyId)}
                label={t("regenerate")}
              />
            </div>
            <p className="mt-6 text-body">{t("actionsHelp")}</p>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-h3 font-extrabold">{t("shortcuts")}</h2>
          <div className="mt-5 space-y-3 text-body">
            <Link
              className="block border-t border-line pt-3 font-semibold underline-offset-4 hover:underline"
              href={`/${locale}/app/companies/${company.id}/requests`}
            >
              {t("requests")}
            </Link>
            <Link
              className="block border-t border-line pt-3 font-semibold underline-offset-4 hover:underline"
              href={`/${locale}/app/users`}
            >
              {t("people")}
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
