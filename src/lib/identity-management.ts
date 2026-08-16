import { prisma } from "@/lib/db";
import { IdentityError } from "@/lib/identity";
import type { ClientRole, SdkStaffRole } from "@/types";

export async function assignCompanyMembership(input: {
  userId: string;
  companyId: string;
  role: ClientRole;
  invitedBy?: string;
}) {
  return prisma.$transaction(async transaction => {
    const user = await transaction.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { sdkStaffRole: true },
    });
    if (user.sdkStaffRole) {
      throw new IdentityError("IDENTITY_CONFLICT", "SDK staff cannot receive company memberships.");
    }
    return transaction.membership.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        role: input.role,
        invitedBy: input.invitedBy,
        invitedAt: input.invitedBy ? new Date() : null,
        joinedAt: new Date(),
      },
    });
  });
}

export async function assignSdkStaffRole(userId: string, role: SdkStaffRole) {
  return prisma.$transaction(async transaction => {
    const membership = await transaction.membership.findUnique({ where: { userId } });
    if (membership) {
      throw new IdentityError("IDENTITY_CONFLICT", "Company members cannot receive SDK staff roles.");
    }
    return transaction.user.update({ where: { id: userId }, data: { sdkStaffRole: role } });
  });
}
