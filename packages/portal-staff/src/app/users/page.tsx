import type { Metadata } from "next";

import { getCurrentPrincipal } from "@platform/auth/identity";
import { FilterSelect } from "@platform/portal-shell/components/portal/users/FilterSelect";
import { SearchInput } from "@platform/portal-shell/components/portal/users/SearchInput";
import { UsersTabNav } from "@platform/portal-shell/components/portal/users/UsersTabNav";
import { StaffInvitationsTable } from "@platform/portal-staff/components/users/staff/StaffInvitationsTable";
import { StaffInviteCards } from "@platform/portal-staff/components/users/staff/StaffInviteCards";
import { StaffMembersTable } from "@platform/portal-staff/components/users/staff/StaffMembersTable";
import { StaffRequestsTable } from "@platform/portal-staff/components/users/staff/StaffRequestsTable";
import { getStaffDirectoryView } from "@platform/users";
import { parseUsersListQuery, usersListHref } from "@platform/users/list-links";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Users | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, rawSearch, principal] = await Promise.all([
    params,
    searchParams,
    getCurrentPrincipal(),
  ]);
  if (!principal || principal.kind !== "sdk-staff") return null;

  const [t, query] = await Promise.all([
    getTranslations({ locale, namespace: "portal.users" }),
    Promise.resolve(parseUsersListQuery(rawSearch)),
  ]);
  const basePath = `/${locale}/app/users`;
  const view = await getStaffDirectoryView(principal, query.tab, {
    query: query.q,
    sort: query.sort,
    dir: query.dir,
    cursor: query.cursor,
    back: query.back,
    companyId: query.company,
    status: query.status === "active" || query.status === "inactive" ? query.status : undefined,
  });

  const tabs = [
    { key: "members" as const, label: t("tabMembers"), count: view.counts.members },
    { key: "invitations" as const, label: t("tabInvitations"), count: view.counts.invitations },
    { key: "requests" as const, label: t("tabRequests"), count: view.counts.requests },
  ].map((tab) => ({ ...tab, href: usersListHref(basePath, { ...query, tab: tab.key }) }));

  const page = (() => {
    switch (query.tab) {
      case "members":
        return view.members;
      case "invitations":
        return view.invitations;
      default:
        return view.requests;
    }
  })();

  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>

      <StaffInviteCards
        locale={locale}
        companies={view.companies}
      />

      <UsersTabNav
        tabs={tabs}
        active={query.tab}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SearchInput placeholder={t("searchPlaceholder")} />
        <FilterSelect
          paramName="company"
          ariaLabel={t("filterCompany")}
          options={[
            { value: "", label: t("filterAllCompanies") },
            ...view.companies.map((company) => ({ value: company.id, label: company.name })),
          ]}
        />
        {query.tab === "members" ? (
          <FilterSelect
            paramName="status"
            ariaLabel={t("filterStatus")}
            options={[
              { value: "", label: t("filterAllStatuses") },
              { value: "active", label: t("active") },
              { value: "inactive", label: t("inactive") },
            ]}
          />
        ) : null}
      </div>

      <div className="mt-6">
        {query.tab === "members" ? (
          <StaffMembersTable
            locale={locale}
            rows={view.members.rows}
            nextCursor={page.nextCursor}
            prevCursor={page.prevCursor}
            basePath={basePath}
            query={query}
          />
        ) : null}
        {query.tab === "invitations" ? (
          <StaffInvitationsTable
            locale={locale}
            rows={view.invitations.rows}
            nextCursor={page.nextCursor}
            prevCursor={page.prevCursor}
            basePath={basePath}
            query={query}
          />
        ) : null}
        {query.tab === "requests" ? (
          <StaffRequestsTable
            locale={locale}
            rows={view.requests.rows}
            nextCursor={page.nextCursor}
            prevCursor={page.prevCursor}
            basePath={basePath}
            query={query}
          />
        ) : null}
      </div>
    </section>
  );
}
