import { getTranslations } from "next-intl/server";

import { ActivityFeed } from "@sdk-e/portal-shell/components/portal/users/ActivityFeed";
import { FilterSelect } from "@sdk-e/portal-shell/components/portal/users/FilterSelect";
import { SearchInput } from "@sdk-e/portal-shell/components/portal/users/SearchInput";
import { UsersTabNav } from "@sdk-e/portal-shell/components/portal/users/UsersTabNav";
import { ClientInviteCards } from "@sdk-e/portal-companies/components/users/client/ClientInviteCards";
import { ClientInvitationsTable } from "@sdk-e/portal-companies/components/users/client/ClientInvitationsTable";
import { ClientMembersTable } from "@sdk-e/portal-companies/components/users/client/ClientMembersTable";
import { ClientRequestsTable } from "@sdk-e/portal-companies/components/users/client/ClientRequestsTable";
import { StaffInviteCards } from "@sdk-e/portal-staff/components/users/staff/StaffInviteCards";
import { StaffInvitationsTable } from "@sdk-e/portal-staff/components/users/staff/StaffInvitationsTable";
import { StaffMembersTable } from "@sdk-e/portal-staff/components/users/staff/StaffMembersTable";
import { StaffRequestsTable } from "@sdk-e/portal-staff/components/users/staff/StaffRequestsTable";
import { UserIdentityCard } from "@sdk-e/portal-staff/components/users/staff/UserIdentityCard";
import { UserMembershipsCard } from "@sdk-e/portal-staff/components/users/staff/UserMembershipsCard";
import type { UsersListQuery } from "@sdk-e/users/list-links";
import {
  activityEvents,
  clientInvitationRows,
  clientMemberRows,
  clientRequestRows,
  fixtureUserDetail,
  invitationRows,
  requestRows,
  staffMemberRows,
} from "./portal-users-fixtures";

const QUERY: UsersListQuery = { tab: "members" };

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-12">
      <h3 className="text-h3 font-extrabold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export async function PortalUsersSection() {
  const t = await getTranslations({ locale: "en", namespace: "portal.users" });
  const basePath = "/en/design-system";
  return (
    <section id="portal-users">
      <p className="text-label font-extrabold uppercase tracking-eyebrow">Portal · Users</p>
      <h2 className="mt-3 text-title font-extrabold">User management surfaces</h2>
      <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">
        The real dashboard components with fixture data. Rendered here so the contrast audit covers
        authenticated-only screens.
      </p>

      <SectionBlock title="Directory chrome">
        <UsersTabNav
          active="members"
          tabs={[
            { key: "members", label: t("tabMembers"), count: 128, href: "#portal-users" },
            { key: "invitations", label: t("tabInvitations"), count: 2, href: "#portal-users" },
            { key: "requests", label: t("tabRequests"), count: 1, href: "#portal-users" },
          ]}
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SearchInput placeholder={t("searchPlaceholder")} />
          <FilterSelect
            paramName="company"
            ariaLabel={t("filterCompany")}
            options={[
              { value: "", label: t("filterAllCompanies") },
              { value: "company-1", label: "Acme Industries" },
              { value: "company-2", label: "Northwind Ltd" },
            ]}
          />
        </div>
      </SectionBlock>

      <SectionBlock title="Invite cards">
        <div className="grid gap-6 xl:grid-cols-2">
          <StaffInviteCards
            locale="en"
            companies={[
              { id: "company-1", name: "Acme Industries" },
              { id: "company-2", name: "Northwind Ltd" },
            ]}
          />
          <ClientInviteCards
            locale="en"
            companyId="company-1"
            accessCode="A3F8-91C2"
            canGrantAdministrator
          />
        </div>
      </SectionBlock>

      <SectionBlock title="Staff members table">
        <StaffMembersTable
          locale="en"
          rows={staffMemberRows}
          nextCursor={null}
          prevCursor={null}
          basePath={basePath}
          query={QUERY}
        />
      </SectionBlock>

      <SectionBlock title="Staff invitations table">
        <StaffInvitationsTable
          locale="en"
          rows={invitationRows}
          nextCursor={null}
          prevCursor={null}
          basePath={basePath}
          query={{ ...QUERY, tab: "invitations" }}
        />
      </SectionBlock>

      <SectionBlock title="Access requests (staff)">
        <StaffRequestsTable
          locale="en"
          rows={requestRows}
          nextCursor={null}
          prevCursor={null}
          basePath={basePath}
          query={{ ...QUERY, tab: "requests" }}
        />
      </SectionBlock>

      <SectionBlock title="Client team tables">
        <ClientMembersTable
          locale="en"
          companyId="company-1"
          rows={clientMemberRows}
          nextCursor={null}
          prevCursor={null}
          basePath={basePath}
          query={QUERY}
          canGrantAdministrator
        />
        <div className="mt-8">
          <ClientInvitationsTable
            locale="en"
            companyId="company-1"
            rows={clientInvitationRows}
            nextCursor={null}
            prevCursor={null}
            basePath={basePath}
            query={{ ...QUERY, tab: "invitations" }}
          />
        </div>
        <div className="mt-8">
          <ClientRequestsTable
            locale="en"
            companyId="company-1"
            rows={clientRequestRows}
            nextCursor={null}
            prevCursor={null}
            basePath={basePath}
            query={{ ...QUERY, tab: "requests" }}
            canGrantAdministrator
          />
        </div>
      </SectionBlock>

      <SectionBlock title="User detail cards">
        <UserIdentityCard locale="en" detail={fixtureUserDetail} />
        <div className="mt-6">
          <UserMembershipsCard locale="en" detail={fixtureUserDetail} />
        </div>
      </SectionBlock>

      <SectionBlock title="Activity feed">
        <ActivityFeed
          locale="en"
          events={activityEvents}
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
            nameCorrected: t("actNameCorrected"),
            staffRoleChanged: t("actStaffRoleChanged"),
            accessCodeRegenerated: t("actAccessCodeRegenerated"),
          }}
        />
      </SectionBlock>
    </section>
  );
}
