import type { ClientRole, SdkStaffRole } from "@platform/types";

import { IdentityError } from "@platform/auth/identity";
import { getPrisma } from "@platform/db";

export async function assignCompanyMembership(input: {
  userId: string;
  companyId: string;
  role: ClientRole;
  invitedBy?: string;
}) {
  return getPrisma().$transaction(async (transaction) => {
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
  return getPrisma().$transaction(async (transaction) => {
    const membership = await transaction.membership.findFirst({ where: { userId } });
    if (membership) {
      throw new IdentityError(
        "IDENTITY_CONFLICT",
        "Company members cannot receive SDK staff roles.",
      );
    }
    return transaction.user.update({ where: { id: userId }, data: { sdkStaffRole: role } });
  });
}
