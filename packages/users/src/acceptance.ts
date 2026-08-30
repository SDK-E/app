import { getPrisma } from "@sdk-e/db";
import { hashInvitationToken, normalizeEmail, forbidden } from "@sdk-e/users/shared";

export async function acceptInvitation(input: { token: string; userId: string; email: string }) {
  return getPrisma().$transaction(async (db) => {
    const invitation = await db.invitation.findUnique({
      where: { tokenHash: hashInvitationToken(input.token) },
    });
    if (!invitation)
      forbidden(
        "This invitation link is not valid. Ask the person who invited you to send a new one."
      );
    if (invitation.revokedAt)
      forbidden(
        "This invitation has been revoked. Ask the person who invited you to send a new one."
      );
    if (invitation.acceptedAt) forbidden("This invitation has already been used.");
    if (invitation.expiresAt <= new Date())
      forbidden("This invitation has expired. Ask the person who invited you to send a new one.");
    if (normalizeEmail(invitation.email) !== normalizeEmail(input.email))
      forbidden("Sign in with the email address that received this invitation.");
    const user = await db.user.findUniqueOrThrow({
      where: { id: input.userId },
    });
    if (user.sdkStaffRole)
      forbidden("This account is SDK staff and cannot accept client invitations.");
    const matches = await db.user.findMany({
      where: { email: { equals: normalizeEmail(invitation.email), mode: "insensitive" } },
      select: { id: true },
    });
    if (matches.length > 1)
      forbidden(
        "This invitation email is linked to more than one account. Sign in with the account that registered it and request a new invitation."
      );
    const claimed = await db.invitation.updateMany({
      where: { id: invitation.id, acceptedAt: null, revokedAt: null },
      data: { acceptedAt: new Date(), acceptedBy: user.id },
    });
    if (claimed.count === 0) forbidden("This invitation has already been used.");
    if (invitation.kind === "CLIENT" && invitation.companyId && invitation.clientRole) {
      const company = await db.company.findFirst({
        where: { id: invitation.companyId, isActive: true },
        select: { id: true },
      });
      if (!company) forbidden("The company is no longer active.");
      const existing = await db.membership.findFirst({
        where: { userId: user.id, companyId: invitation.companyId },
        select: { id: true },
      });
      if (existing) forbidden("This account is already a member of this company.");
      const membership = await db.membership.create({
        data: {
          userId: user.id,
          companyId: invitation.companyId,
          role: invitation.clientRole,
          invitedBy: invitation.invitedBy,
          invitedAt: invitation.createdAt,
          joinedAt: new Date(),
        },
      });
      await db.auditEvent.create({
        data: {
          companyId: invitation.companyId,
          actorId: user.id,
          actorKind: "USER",
          action: "invitation.accepted",
          targetType: "invitation",
          targetId: invitation.id,
          toState: invitation.clientRole,
          metadata: { membershipId: membership.id, userId: user.id, kind: "CLIENT" },
        },
      });
    } else if (invitation.kind === "SDK_STAFF" && invitation.sdkStaffRole) {
      await db.user.update({
        where: { id: user.id },
        data: { sdkStaffRole: invitation.sdkStaffRole },
      });
      await db.auditEvent.create({
        data: {
          actorId: user.id,
          actorKind: "USER",
          action: "invitation.accepted",
          targetType: "invitation",
          targetId: invitation.id,
          toState: invitation.sdkStaffRole,
          metadata: { userId: user.id, kind: "SDK_STAFF" },
        },
      });
    } else forbidden("This invitation has an invalid target.");
    const updated = await db.invitation.findUnique({
      where: { id: invitation.id },
      include: { company: true },
    });
    return updated;
  });
}
