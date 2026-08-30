import { type ClientRole, Prisma, type SdkStaffRole } from "@platform/db/client";
import { forbidden, hashInvitationToken, normalizeEmail } from "@platform/users/shared";

export interface InvitationValidation {
  invitation: {
    id: string;
    email: string;
    kind: string;
    companyId: null | string;
    clientRole: null | string;
    sdkStaffRole: null | string;
    revokedAt: Date | null;
    acceptedAt: Date | null;
    expiresAt: Date;
    invitedBy: null | string;
    createdAt: Date;
  };
  user: { id: string; sdkStaffRole: null | string };
  companyId: string;
  clientRole: string;
  sdkStaffRole: string;
}

export async function applySdkStaffRole(
  db: Prisma.TransactionClient,
  invitation: InvitationValidation["invitation"],
  user: { id: string },
  sdkStaffRole: string,
) {
  await db.user.update({
    where: { id: user.id },
    data: { sdkStaffRole: sdkStaffRole as null | SdkStaffRole },
  });
  await db.auditEvent.create({
    data: {
      actorId: user.id,
      actorKind: "USER",
      action: "invitation.accepted",
      targetType: "invitation",
      targetId: invitation.id,
      toState: sdkStaffRole,
      metadata: { userId: user.id, kind: "SDK_STAFF" },
    },
  });
}

export async function createClientMembership(
  db: Prisma.TransactionClient,
  invitation: InvitationValidation["invitation"],
  user: { id: string },
  companyId: string,
  clientRole: string,
) {
  const company = await db.company.findFirst({
    where: { id: companyId, isActive: true },
    select: { id: true },
  });
  if (!company) forbidden("The company is no longer active.");

  const existing = await db.membership.findFirst({
    where: { userId: user.id, companyId },
    select: { id: true },
  });
  if (existing) forbidden("This account is already a member of this company.");

  const membership = await db.membership.create({
    data: {
      userId: user.id,
      companyId,
      role: clientRole as ClientRole,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.createdAt,
      joinedAt: new Date(),
    },
  });

  await db.auditEvent.create({
    data: {
      companyId,
      actorId: user.id,
      actorKind: "USER",
      action: "invitation.accepted",
      targetType: "invitation",
      targetId: invitation.id,
      toState: clientRole,
      metadata: { membershipId: membership.id, userId: user.id, kind: "CLIENT" },
    },
  });
}

export async function validateInvitation(
  db: Prisma.TransactionClient,
  token: string,
  userId: string,
  email: string,
): Promise<InvitationValidation> {
  const invitation = await db.invitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
  });
  if (!invitation)
    forbidden(
      "This invitation link is not valid. Ask the person who invited you to send a new one.",
    );
  assertInvitationValid(invitation);
  if (normalizeEmail(invitation.email) !== normalizeEmail(email))
    forbidden("Sign in with the email address that received this invitation.");

  const user = await assertUserEligible(db, userId, invitation.email, email);
  if (user.sdkStaffRole)
    forbidden("This account is SDK staff and cannot accept client invitations.");

  const matches = await assertUniqueUser(db, invitation.email);
  if (matches.length > 1)
    forbidden(
      "This invitation email is linked to more than one account. Sign in with the account that registered it and request a new invitation.",
    );

  const claimed = await db.invitation.updateMany({
    where: { id: invitation.id, acceptedAt: null, revokedAt: null },
    data: { acceptedAt: new Date(), acceptedBy: user.id },
  });
  if (claimed.count === 0) forbidden("This invitation has already been used.");

  return {
    invitation,
    user,
    companyId: invitation.companyId ?? "",
    clientRole: invitation.clientRole ?? "",
    sdkStaffRole: invitation.sdkStaffRole ?? "",
  };
}

function assertInvitationValid(invitation: {
  revokedAt: Date | null;
  acceptedAt: Date | null;
  expiresAt: Date;
}) {
  if (invitation.revokedAt)
    forbidden(
      "This invitation has been revoked. Ask the person who invited you to send a new one.",
    );
  if (invitation.acceptedAt) forbidden("This invitation has already been used.");
  if (invitation.expiresAt <= new Date())
    forbidden("This invitation has expired. Ask the person who invited you to send a new one.");
}

function assertUniqueUser(db: Prisma.TransactionClient, invitationEmail: string) {
  return db.user.findMany({
    where: { email: { equals: normalizeEmail(invitationEmail), mode: "insensitive" } },
    select: { id: true },
  });
}

function assertUserEligible(
  db: Prisma.TransactionClient,
  userId: string,
  invitationEmail: string,
  inputEmail: string,
) {
  if (normalizeEmail(invitationEmail) !== normalizeEmail(inputEmail))
    forbidden("Sign in with the email address that received this invitation.");
  return db.user.findUniqueOrThrow({
    where: { id: userId },
  });
}
