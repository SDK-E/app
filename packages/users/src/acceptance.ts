import { getPrisma } from "@platform/db";
import {
  applySdkStaffRole,
  createClientMembership,
  validateInvitation,
} from "@platform/users/acceptance-helpers";
import { forbidden } from "@platform/users/shared";

export async function acceptInvitation(input: { token: string; userId: string; email: string }) {
  return getPrisma().$transaction(async (db) => {
    const { invitation, user, companyId, clientRole, sdkStaffRole } = await validateInvitation(
      db,
      input.token,
      input.userId,
      input.email,
    );

    if (invitation.kind === "CLIENT" && companyId && clientRole) {
      await createClientMembership(db, invitation, user, companyId, clientRole);
    } else if (invitation.kind === "SDK_STAFF" && sdkStaffRole) {
      await applySdkStaffRole(db, invitation, user, sdkStaffRole);
    } else {
      forbidden("This invitation has an invalid target.");
    }

    return await db.invitation.findUnique({
      where: { id: invitation.id },
      include: { company: true },
    });
  });
}
