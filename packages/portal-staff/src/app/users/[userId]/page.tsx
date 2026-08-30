import type { Metadata } from "next";

import { getCurrentPrincipal } from "@platform/auth/identity";
import { ActivityFeed } from "@platform/portal-shell/components/portal/users/ActivityFeed";
import { UserIdentityCard } from "@platform/portal-staff/components/users/staff/UserIdentityCard";
import { UserMembershipsCard } from "@platform/portal-staff/components/users/staff/UserMembershipsCard";
import { Badge } from "@platform/ui/Badge";
import { Card } from "@platform/ui/Card";
import { getUserDetail } from "@platform/users";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "User | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  const principal = await getCurrentPrincipal();
  if (!principal || principal.kind !== "sdk-staff" || principal.role !== "ADMIN") return null;

  const t = await getTranslations({ locale, namespace: "portal.users" });
  let detail;
  try {
    detail = await getUserDetail(principal, userId);
  } catch {
    notFound();
  }

  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("detailTitle")}</h1>

      <div className="mt-10 space-y-6">
        <UserIdentityCard
          locale={locale}
          detail={detail}
        />
        <UserMembershipsCard
          locale={locale}
          detail={detail}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="text-h3 font-extrabold">{t("pendingInvitations")}</h2>
            <ul className="mt-4 space-y-3">
              {detail.pendingInvitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="rounded-card border border-line px-4 py-3"
                >
                  <p className="text-body font-semibold">
                    {invitation.company?.name ?? t("staffWorkspace")}
                  </p>
                  <p className="mt-1 text-body">
                    {(invitation.clientRole ?? "—").replaceAll("_", " ")} ·{" "}
                    {t("expires", {
                      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                        invitation.expiresAt,
                      ),
                    })}
                  </p>
                  <Badge
                    tone={invitation.deliveryStatus === "SENT" ? "live" : "review"}
                    className="mt-2"
                  >
                    {invitation.deliveryStatus}
                  </Badge>
                </li>
              ))}
              {!detail.pendingInvitations.length ? (
                <li className="text-body text-muted-foreground">{t("invitationsEmpty")}</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <h2 className="text-h3 font-extrabold">{t("requestHistory")}</h2>
            <ul className="mt-4 space-y-3">
              {detail.accessRequests.map((request) => (
                <li
                  key={request.id}
                  className="rounded-card border border-line px-4 py-3"
                >
                  <p className="text-body font-semibold">{request.company.name}</p>
                  <p className="mt-1 text-body">
                    {request.requestedRole.replaceAll("_", " ")} · {request.status}
                  </p>
                </li>
              ))}
              {!detail.accessRequests.length ? (
                <li className="text-body text-muted-foreground">{t("requestsEmpty")}</li>
              ) : null}
            </ul>
          </Card>
        </div>

        <div>
          <h2 className="text-h3 font-extrabold">{t("activityTitle")}</h2>
          <div className="mt-5">
            <ActivityFeed
              locale={locale}
              events={detail.activity}
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
          </div>
        </div>
      </div>
    </section>
  );
}
