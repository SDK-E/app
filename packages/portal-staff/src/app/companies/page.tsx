import type { Metadata } from "next";

import { hasPermission } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { listCompaniesForManagement } from "@platform/companies";
import { Badge } from "@platform/ui/Badge";
import { Card } from "@platform/ui/Card";
import { EmptyState } from "@platform/ui/EmptyState";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Companies | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function CompaniesDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  if (principal.kind === "client") {
    const first = principal.memberships[0];
    if (!first) redirect(`/${locale}/app`);
    redirect(`/${locale}/app/companies/${first.companyId}`);
  }
  const [t, companies] = await Promise.all([
    getTranslations({ locale, namespace: "portal.companies" }),
    listCompaniesForManagement(principal),
  ]);
  const canCreate = hasPermission(principal, "company:create");
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
          <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>
        </div>
        {canCreate ? (
          <Link
            href={`/${locale}/app/companies/new`}
            className="inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-label font-extrabold uppercase tracking-eyebrow text-dark"
          >
            {t("create")}
          </Link>
        ) : null}
      </div>
      <div className="mt-10 space-y-4">
        {companies.map((company) => (
          <Card
            key={company.id}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-h3 font-extrabold">{company.name}</h2>
                <Badge tone={company.isActive ? "live" : "neutral"}>
                  {company.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
              <p className="mt-2 text-body">
                {company._count.memberships === 1
                  ? t("membersOne")
                  : t("membersMany", { count: company._count.memberships })}
                {" · "}
                {t("created", {
                  date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                    company.createdAt,
                  ),
                })}
              </p>
            </div>
            <Link
              href={`/${locale}/app/companies/${company.id}/manage`}
              className="text-label font-extrabold uppercase tracking-eyebrow underline underline-offset-4"
            >
              {t("manageCompany")}
            </Link>
          </Card>
        ))}
        {!companies.length ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyBody")}
          />
        ) : null}
      </div>
    </section>
  );
}
