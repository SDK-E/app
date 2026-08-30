import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ActivityFeed } from "@sdk-e/portal-shell/components/portal/users/ActivityFeed";
import { ClientInviteCards } from "@sdk-e/portal-companies/components/users/client/ClientInviteCards";
import { ClientInvitationsTable } from "@sdk-e/portal-companies/components/users/client/ClientInvitationsTable";
import { ClientMembersTable } from "@sdk-e/portal-companies/components/users/client/ClientMembersTable";
import { ClientRequestsTable } from "@sdk-e/portal-companies/components/users/client/ClientRequestsTable";
import { SearchInput } from "@sdk-e/portal-shell/components/portal/users/SearchInput";
import { UsersTabNav } from "@sdk-e/portal-shell/components/portal/users/UsersTabNav";
import { getClientMembership } from "@sdk-e/auth/authorization";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { parseUsersListQuery, usersListHref } from "@sdk-e/users/list-links";
import { getClientTeamView, listUserManagementActivity } from "@sdk-e/users";

export const metadata: Metadata = {
  title: "Team | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function CompanyUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; companyId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, companyId }, rawSearch, principal] = await Promise.all([
    params,
    searchParams,
    getCurrentPrincipal(),
  ]);
  if (!principal || principal.kind !== "client") return null;
  const myRole = (() => {
    try {
      return getClientMembership(principal, companyId).role;
    } catch {
      return null;
    }
  })();
  if (!myRole || !["OWNER", "ADMINISTRATOR"].includes(myRole)) {
    redirect(`/${locale}/app/companies/${companyId}`);
  }

  const [t, query] = await Promise.all([
    getTranslations({ locale, namespace: "portal.users" }),
    Promise.resolve(parseUsersListQuery(rawSearch)),
  ]);
  const basePath = `/${locale}/app/companies/${companyId}/users`;
  const canGrantAdministrator = myRole === "OWNER";
  const [view, activity] = await Promise.all([
    getClientTeamView(principal, companyId, query.tab, {
      query: query.q,
      sort: query.sort,
      dir: query.dir,
      cursor: query.cursor,
      back: query.back,
    }),
    query.tab === "requests" ? listUserManagementActivity({ companyId }, 10) : [],
  ]);

  const tabs = [
    { key: "members" as const, label: t("tabMembers"), count: view.counts.members },
    { key: "invitations" as const, label: t("tabInvitations"), count: view.counts.invitations },
    { key: "requests" as const, label: t("tabRequests"), count: view.counts.requests },
  ].map((tab) => ({ ...tab, href: usersListHref(basePath, { ...query, tab: tab.key }) }));

  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">
        {t("teamTitle", { company: view.company.name })}
      </h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>

      <ClientInviteCards
        locale={locale}
        companyId={companyId}
        accessCode={view.company.accessCode}
        canGrantAdministrator={canGrantAdministrator}
      />

      <UsersTabNav tabs={tabs} active={query.tab} />

      <div className="mt-5">
        <SearchInput placeholder={t("searchPlaceholder")} />
      </div>

      <div className="mt-6">
        {query.tab === "members" ? (
          <ClientMembersTable
            locale={locale}
            companyId={companyId}
            rows={view.members.rows}
            nextCursor={view.members.nextCursor}
            prevCursor={view.members.prevCursor}
            basePath={basePath}
            query={query}
            canGrantAdministrator={canGrantAdministrator}
          />
        ) : null}
        {query.tab === "invitations" ? (
          <ClientInvitationsTable
            locale={locale}
            companyId={companyId}
            rows={view.invitations.rows}
            nextCursor={view.invitations.nextCursor}
            prevCursor={view.invitations.prevCursor}
            basePath={basePath}
            query={query}
          />
        ) : null}
        {query.tab === "requests" ? (
          <>
            <ClientRequestsTable
              locale={locale}
              companyId={companyId}
              rows={view.requests.rows}
              nextCursor={view.requests.nextCursor}
              prevCursor={view.requests.prevCursor}
              basePath={basePath}
              query={query}
              canGrantAdministrator={canGrantAdministrator}
            />
            <div className="mt-12">
              <h2 className="text-h3 font-extrabold">{t("activityTitle")}</h2>
              <div className="mt-5">
                <ActivityFeed
                  locale={locale}
                  events={activity}
                  labels={{
                    emptyTitle: t("activityEmpty"),
                    roleChanged: t("actRoleChanged"),
                    membershipRemoved: t("actMembershipRemoved"),
                    membershipAssigned: t("actMembershipAssigned"),
                    invitationCreated: t("actInvitationCreated"),
                    invitationRenewed: t("actInvitationRenewed"),
                    invitationRevoked: t("actInvitationRevoked"),
                    invitationAccepted: t("actInvitationAccepted"),
                    requestApproved: t("actRequestApproved"),
                    requestDeclined: t("actRequestDeclined"),
                    activeChanged: t("actActiveChanged"),
                  }}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
