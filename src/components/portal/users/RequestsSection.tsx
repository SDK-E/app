import { getTranslations } from "next-intl/server";

import {
  approveAccessRequestAction,
  declineAccessRequestAction,
} from "@/app/[locale]/(app)/app/users/access-request-actions";
import {
  resendInvitationAction,
  revokeInvitationAction,
} from "@/app/[locale]/(app)/app/users/actions";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { fieldClass } from "@/components/portal/users/styles";
import type { UserManagementData } from "@/lib/users";

export async function RequestsSection({
  locale,
  companyId,
  data,
  clientRoles,
}: {
  locale: string;
  companyId?: string | null;
  data: UserManagementData;
  clientRoles: string[];
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  return (
    <>
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
                action={approveAccessRequestAction.bind(null, locale, companyId ?? null)}
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
                action={declineAccessRequestAction.bind(null, locale, companyId ?? null)}
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
                  action={resendInvitationAction.bind(null, locale, companyId ?? null)}
                  label={t("resend")}
                >
                  <input type="hidden" name="invitationId" value={invitation.id} />
                </UserActionForm>
                <UserActionForm
                  action={revokeInvitationAction.bind(null, locale, companyId ?? null)}
                  label={t("revoke")}
                  variant="destructive"
                >
                  <input type="hidden" name="invitationId" value={invitation.id} />
                </UserActionForm>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
