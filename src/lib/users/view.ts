import { requireCompanyPageContext, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { canManageUsers, forbidden } from "@/lib/users/shared";
import type { AppPrincipal } from "@/types";

export type UserManagementData = Awaited<ReturnType<typeof getUserManagementData>>;

export async function getUserManagementData(principal: AppPrincipal, companyId?: string) {
  const db = getPrisma();
  if (principal.kind !== "sdk-staff") {
    const context = requireCompanyPageContext(principal, companyId ?? "", "membership:view");
    if (!canManageUsers(context.principal, context.companyId))
      forbidden("User management is not available for this role.");
    const [memberships, invitations, accessRequests, company] = await Promise.all([
      db.membership.findMany({
        where: { companyId: context.companyId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      }),
      db.invitation.findMany({
        where: { companyId: context.companyId, acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      }),
      db.companyAccessRequest.findMany({
        where: { companyId: context.companyId, status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          company: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.company.findUnique({ where: { id: context.companyId } }),
    ]);
    return {
      kind: "client" as const,
      company,
      memberships,
      invitations,
      accessRequests,
      pendingInvitationCount: invitations.length,
    };
  }
  if (principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  requireSdkStaff(principal, ["ADMIN"]);
  const [users, companies, invitations, pendingInvitationCount, accessRequests] = await Promise.all(
    [
      db.user.findMany({
        include: { memberships: { include: { company: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      db.invitation.findMany({
        where: { acceptedAt: null, revokedAt: null },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.invitation.count({ where: { acceptedAt: null, revokedAt: null } }),
      db.companyAccessRequest.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          company: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]
  );
  return {
    kind: "staff" as const,
    users,
    companies,
    invitations,
    accessRequests,
    pendingInvitationCount,
  };
}
