import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { listUserManagementActivity, type ActivityRow } from "@sdk-e/users/activity";

export interface UserDetailMembership {
  id: string;
  role: string;
  joinedAt: Date;
  company: { id: string; name: string; isActive: boolean };
}

export interface UserDetailView {
  kind: "staff-detail";
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    isActive: boolean;
    sdkStaffRole: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  memberships: UserDetailMembership[];
  pendingInvitations: {
    id: string;
    clientRole: string | null;
    expiresAt: Date;
    deliveryStatus: string;
    company: { id: string; name: string } | null;
  }[];
  accessRequests: {
    id: string;
    status: string;
    requestedRole: string;
    createdAt: Date;
    company: { id: string; name: string };
  }[];
  activity: ActivityRow[];
  companies: { id: string; name: string }[];
}

const assignableCompanies = () =>
  getPrisma().company.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

export async function getUserDetail(
  principal: Parameters<typeof requireSdkStaff>[0],
  userId: string
): Promise<UserDetailView> {
  requireSdkStaff(principal, ["ADMIN"]);
  const db = getPrisma();
  const [user, companies] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { company: { select: { id: true, name: true, isActive: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    assignableCompanies(),
  ]);
  if (!user) notFound("User not found.");

  const [pendingInvitations, accessRequests, activity] = await Promise.all([
    db.invitation.findMany({
      where: { email: user.email, acceptedAt: null, revokedAt: null },
      select: {
        id: true,
        clientRole: true,
        expiresAt: true,
        deliveryStatus: true,
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.companyAccessRequest.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        requestedRole: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    listUserManagementActivity({ userId: user.id }, 15),
  ]);

  return {
    kind: "staff-detail",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      sdkStaffRole: user.sdkStaffRole,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      joinedAt: membership.joinedAt ?? membership.createdAt,
      company: {
        id: membership.company.id,
        name: membership.company.name,
        isActive: membership.company.isActive,
      },
    })),
    pendingInvitations,
    accessRequests,
    activity,
    companies,
  };
}
