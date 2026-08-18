"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getServerEnv } from "@/lib/env";
import { sendInvitationNotification } from "@/lib/email";
import {
  clientInvitationSchema,
  idSchema,
  staffInvitationSchema,
} from "@/lib/schemas/userManagement";
import {
  createClientInvitation,
  createStaffInvitation,
  markInvitationDelivery,
  renewInvitation,
  restoreInvitationDelivery,
  revokeInvitation,
} from "@/lib/users";
import { errorMessage, principalOrThrow } from "./actions-common";
import type { UserActionState } from "./actions-common";

export type { UserActionState };

function usersPath(locale: string, companyId?: string | null) {
  return companyId ? `/${locale}/app/companies/${companyId}/users` : `/${locale}/app/users`;
}

async function origin() {
  const configured = getServerEnv().AUTH0_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const values = await headers();
  return `${values.get("x-forwarded-proto") ?? "http"}://${values.get("host")}`;
}

async function deliver(
  locale: string,
  token: string,
  invitation: {
    id: string;
    email: string;
    expiresAt: Date;
    clientRole: string | null;
    sdkStaffRole: string | null;
    company?: { name: string } | null;
  },
  inviterName: string
) {
  const destination = invitation.company?.name ?? "SDK Enterprises workspace";
  const sent = await sendInvitationNotification({
    email: invitation.email,
    inviterName,
    destination,
    role: (invitation.clientRole ?? invitation.sdkStaffRole ?? "member")
      .replaceAll("_", " ")
      .toLowerCase(),
    acceptUrl: `${await origin()}/${locale}/invite/${token}`,
    expiresAt: invitation.expiresAt,
  });
  await markInvitationDelivery(invitation.id, sent);
  return sent;
}

export async function inviteClientAction(
  locale: string,
  companyId: string | null,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = clientInvitationSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    companyId: formData.get("companyId") || companyId || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const targetCompanyId = String(formData.get("companyId") || "") || companyId || undefined;
    if (!targetCompanyId) throw new Error("A company is required.");
    const created = await createClientInvitation(
      principal,
      { email: parsed.data.email, role: parsed.data.role },
      targetCompanyId
    );
    const sent = await deliver(locale, created.token, created.invitation, principal.name);
    revalidatePath(usersPath(locale, targetCompanyId));
    return {
      success: sent
        ? "Invitation sent."
        : "Invitation saved, but email delivery failed. You can resend it.",
    };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function inviteStaffAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = staffInvitationSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const created = await createStaffInvitation(principal, parsed.data);
    const sent = await deliver(locale, created.token, created.invitation, principal.name);
    revalidatePath(`/${locale}/app/users`);
    return {
      success: sent
        ? "Invitation sent."
        : "Invitation saved, but email delivery failed. You can resend it.",
    };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function revokeInvitationAction(
  locale: string,
  companyId: string | null,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("invitationId"));
  if (!id.success) return { error: "Invalid invitation." };
  try {
    await revokeInvitation(await principalOrThrow(), id.data, companyId ?? undefined);
    revalidatePath(usersPath(locale, companyId));
    return { success: "Invitation revoked." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function resendInvitationAction(
  locale: string,
  companyId: string | null,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("invitationId"));
  if (!id.success) return { error: "Invalid invitation." };
  try {
    const principal = await principalOrThrow();
    const renewed = await renewInvitation(principal, id.data, companyId ?? undefined);
    let sent: boolean;
    try {
      sent = await deliver(locale, renewed.token, renewed.invitation, principal.name);
    } catch {
      await restoreInvitationDelivery(id.data, {
        tokenHash: renewed.previousTokenHash,
        expiresAt: renewed.previousExpiresAt,
      });
      revalidatePath(usersPath(locale, companyId));
      return { error: "The invitation could not be renewed. Your previous link is still valid." };
    }
    if (!sent) {
      await restoreInvitationDelivery(id.data, {
        tokenHash: renewed.previousTokenHash,
        expiresAt: renewed.previousExpiresAt,
      });
      revalidatePath(usersPath(locale, companyId));
      return { error: "The invitation could not be renewed. Your previous link is still valid." };
    }
    revalidatePath(usersPath(locale, companyId));
    return { success: "Invitation resent." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
