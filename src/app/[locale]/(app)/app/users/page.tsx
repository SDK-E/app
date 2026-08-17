import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  approveAccessRequestAction,
  declineAccessRequestAction,
  inviteClientAction,
  inviteStaffAction,
  regenerateAccessCodeAction,
  removeMembershipAction,
  resendInvitationAction,
  revokeInvitationAction,
  updateMembershipAction,
  updateStaffAction,
} from "@/app/[locale]/(app)/app/users/actions";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getCurrentPrincipal } from "@/lib/identity";
import { getUserManagementData } from "@/lib/user-management";

export const metadata: Metadata = {
  title: "Users | SDK Enterprises",
  robots: { index: false, follow: false },
};

const fieldClass =
  "min-h-11 w-full rounded-control border border-dark/40 bg-paper px-3 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  const [t, data] = await Promise.all([
    getTranslations({ locale, namespace: "portal.users" }),
    getUserManagementData(principal),
  ]);
  const clientRoles =
    principal.kind === "client" && principal.role === "ADMINISTRATOR"
      ? ["PROJECT_MEMBER", "BILLING", "VIEWER"]
      : ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
        {t("eyebrow")}
      </p>
      <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-h3 font-extrabold">{t("inviteClient")}</h2>
          <div className="mt-5">
            <UserActionForm
              action={inviteClientAction.bind(null, locale)}
              label={t("sendInvitation")}
              variant="default"
            >
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("email")}
                <input className={`${fieldClass} mt-2`} name="email" type="email" required />
              </label>
              {data.kind === "staff" ? (
                <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                  {t("company")}
                  <select className={`${fieldClass} mt-2`} name="companyId" required>
                    {data.companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("role")}
                <select
                  className={`${fieldClass} mt-2`}
                  name="role"
                  defaultValue="PROJECT_MEMBER"
                  required
                >
                  {clientRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </UserActionForm>
          </div>
        </Card>
        {data.kind === "staff" ? (
          <Card>
            <h2 className="text-h3 font-extrabold">{t("inviteStaff")}</h2>
            <div className="mt-5">
              <UserActionForm
                action={inviteStaffAction.bind(null, locale)}
                label={t("sendInvitation")}
                variant="default"
              >
                <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                  {t("email")}
                  <input className={`${fieldClass} mt-2`} name="email" type="email" required />
                </label>
                <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                  {t("role")}
                  <select
                    className={`${fieldClass} mt-2`}
                    name="role"
                    defaultValue="DELIVERY"
                    required
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="FINANCE">FINANCE</option>
                  </select>
                </label>
              </UserActionForm>
            </div>
          </Card>
        ) : null}
        {data.kind === "client" && principal.role === "OWNER" && data.company ? (
          <Card>
            <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
            <p className="mt-2 text-body font-mono uppercase tracking-widest">
              {data.company.accessCode}
            </p>
            <p className="mt-2 text-body text-muted-foreground">{t("accessCodeHelp")}</p>
            <div className="mt-4">
              <UserActionForm
                action={regenerateAccessCodeAction.bind(null, locale)}
                label={t("regenerate")}
              >
                <input type="hidden" name="companyId" value={data.company.id} />
              </UserActionForm>
            </div>
          </Card>
        ) : data.kind === "staff" ? (
          <Card>
            <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
            <p className="mt-2 text-body text-muted-foreground">{t("accessCodeHelp")}</p>
            <div className="mt-4">
              <UserActionForm
                action={regenerateAccessCodeAction.bind(null, locale)}
                label={t("regenerate")}
              >
                <select className={fieldClass} name="companyId" required>
                  {data.companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </UserActionForm>
            </div>
          </Card>
        ) : null}
      </div>

      <div className="mt-12">
        <h2 className="text-h3 font-extrabold">
          {data.kind === "client" ? t("team") : t("directory")}
        </h2>
        <div className="mt-5 space-y-4">
          {data.kind === "client"
            ? data.memberships.map((membership) => (
                <Card
                  key={membership.id}
                  className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
                >
                  <div>
                    <p className="text-body font-semibold">{membership.user.name}</p>
                    <p className="text-body text-muted-foreground">{membership.user.email}</p>
                  </div>
                  <UserActionForm
                    action={updateMembershipAction.bind(null, locale)}
                    label={t("updateRole")}
                  >
                    <input type="hidden" name="membershipId" value={membership.id} />
                    <select
                      key={membership.role}
                      className={fieldClass}
                      name="role"
                      defaultValue={membership.role}
                    >
                      {membership.role === "OWNER" ? (
                        <option value="OWNER">OWNER</option>
                      ) : (
                        clientRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.replaceAll("_", " ")}
                          </option>
                        ))
                      )}
                    </select>
                  </UserActionForm>
                  <UserActionForm
                    action={removeMembershipAction.bind(null, locale)}
                    label={t("remove")}
                    variant="destructive"
                  >
                    <input type="hidden" name="membershipId" value={membership.id} />
                  </UserActionForm>
                </Card>
              ))
            : data.users.map((user) => (
                <Card key={user.id} className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-body font-semibold">{user.name}</p>
                      <Badge tone={user.isActive ? "live" : "neutral"}>
                        {user.isActive ? t("active") : t("inactive")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-body text-muted-foreground">{user.email}</p>
                    <p className="mt-2 text-micro uppercase tracking-eyebrow text-muted-foreground">
                      {user.memberships[0]?.company.name ??
                        (user.sdkStaffRole ? "SDK Enterprises" : t("unassigned"))}
                    </p>
                  </div>
                  {user.memberships[0] ? (
                    <>
                      <UserActionForm
                        action={updateMembershipAction.bind(null, locale)}
                        label={t("updateRole")}
                      >
                        <input type="hidden" name="membershipId" value={user.memberships[0].id} />
                        <select
                          key={user.memberships[0].role}
                          className={fieldClass}
                          name="role"
                          defaultValue={user.memberships[0].role}
                        >
                          {user.memberships[0].role === "OWNER" ? (
                            <option value="OWNER">OWNER</option>
                          ) : (
                            clientRoles.map((role) => (
                              <option key={role} value={role}>
                                {role.replaceAll("_", " ")}
                              </option>
                            ))
                          )}
                        </select>
                      </UserActionForm>
                      <UserActionForm
                        action={removeMembershipAction.bind(null, locale)}
                        label={t("remove")}
                        variant="destructive"
                      >
                        <input type="hidden" name="membershipId" value={user.memberships[0].id} />
                      </UserActionForm>
                    </>
                  ) : user.sdkStaffRole ? (
                    <>
                      <UserActionForm
                        action={updateStaffAction.bind(null, locale)}
                        label={t("updateRole")}
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          key={user.sdkStaffRole}
                          className={fieldClass}
                          name="role"
                          defaultValue={user.sdkStaffRole}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="DELIVERY">DELIVERY</option>
                          <option value="FINANCE">FINANCE</option>
                        </select>
                      </UserActionForm>
                      <UserActionForm
                        action={updateStaffAction.bind(null, locale)}
                        label={user.isActive ? t("deactivate") : t("activate")}
                        variant={user.isActive ? "destructive" : "outline"}
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="isActive" value={String(!user.isActive)} />
                      </UserActionForm>
                    </>
                  ) : (
                    <p className="text-body text-muted-foreground">{t("inviteToAssign")}</p>
                  )}
                </Card>
              ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-h3 font-extrabold">{t("accessRequests")}</h2>
        <div className="mt-5 space-y-4">
          {data.accessRequests.map((request) => (
            <Card
              key={request.id}
              className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"
            >
              <div>
                <p className="text-body font-semibold">{request.user.name}</p>
                <p className="mt-1 text-body text-muted-foreground">{request.user.email}</p>
                <p className="mt-1 text-micro uppercase tracking-eyebrow text-muted-foreground">
                  {data.kind === "staff" ? `${request.company.name} · ` : ""}
                  {request.requestedRole.replaceAll("_", " ")} ·{" "}
                  {t("requested", {
                    date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                      request.createdAt
                    ),
                  })}
                </p>
              </div>
              <UserActionForm
                action={approveAccessRequestAction.bind(null, locale)}
                label={t("approve")}
              >
                <input type="hidden" name="requestId" value={request.id} />
                <select className={fieldClass} name="role" defaultValue="VIEWER">
                  {clientRoles
                    .filter((role) => role !== "OWNER")
                    .map((role) => (
                      <option key={role} value={role}>
                        {role.replaceAll("_", " ")}
                      </option>
                    ))}
                </select>
              </UserActionForm>
              <UserActionForm
                action={declineAccessRequestAction.bind(null, locale)}
                label={t("decline")}
                variant="destructive"
              >
                <input type="hidden" name="requestId" value={request.id} />
              </UserActionForm>
            </Card>
          ))}
          {!data.accessRequests.length ? (
            <p className="text-body text-muted-foreground">{t("accessRequestsEmpty")}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-h3 font-extrabold">{t("pendingInvitations")}</h2>
        {data.kind === "staff" && data.pendingInvitationCount > data.invitations.length ? (
          <p className="mt-2 text-body text-muted-foreground">
            {t("morePending", { count: data.pendingInvitationCount - data.invitations.length })}
          </p>
        ) : null}
        <div className="mt-5 space-y-4">
          {data.invitations
            .filter((invitation) => !invitation.acceptedAt && !invitation.revokedAt)
            .map((invitation) => (
              <Card
                key={invitation.id}
                className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"
              >
                <div>
                  <p className="text-body font-semibold">{invitation.email}</p>
                  <p className="mt-1 text-body text-muted-foreground">
                    {invitation.clientRole ?? invitation.sdkStaffRole} ·{" "}
                    {t("expires", {
                      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                        invitation.expiresAt
                      ),
                    })}
                  </p>
                  <Badge tone={invitation.deliveryStatus === "SENT" ? "live" : "review"}>
                    {invitation.deliveryStatus}
                  </Badge>
                </div>
                <UserActionForm
                  action={resendInvitationAction.bind(null, locale)}
                  label={t("resend")}
                >
                  <input type="hidden" name="invitationId" value={invitation.id} />
                </UserActionForm>
                <UserActionForm
                  action={revokeInvitationAction.bind(null, locale)}
                  label={t("revoke")}
                  variant="destructive"
                >
                  <input type="hidden" name="invitationId" value={invitation.id} />
                </UserActionForm>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
