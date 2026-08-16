"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getServerEnv } from "@/lib/env";
import { sendInvitationNotification } from "@/lib/email";
import { getCurrentPrincipal } from "@/lib/identity";
import { clientInvitationSchema, idSchema, membershipUpdateSchema, staffInvitationSchema, staffUpdateSchema } from "@/lib/schemas/userManagement";
import {
  createClientInvitation, createStaffInvitation, markInvitationDelivery, removeMembership,
  renewInvitation, revokeInvitation, updateMembershipRole, updateStaffUser,
} from "@/lib/user-management";

export interface UserActionState { error?: string; success?: string }

function errorMessage(error: unknown) { return error instanceof Error ? error.message : "The action could not be completed."; }
async function principalOrThrow() { const principal = await getCurrentPrincipal(); if (!principal) throw new Error("Your session has ended."); return principal; }
async function origin() {
  const configured = getServerEnv().AUTH0_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const values = await headers();
  return `${values.get("x-forwarded-proto") ?? "http"}://${values.get("host")}`;
}
async function deliver(locale: string, token: string, invitation: { id: string; email: string; expiresAt: Date; clientRole: string | null; sdkStaffRole: string | null; company?: { name: string } | null }, inviterName: string) {
  const destination = invitation.company?.name ?? "SDK Enterprises workspace";
  const sent = await sendInvitationNotification({ email: invitation.email, inviterName, destination, role: (invitation.clientRole ?? invitation.sdkStaffRole ?? "member").replaceAll("_", " ").toLowerCase(), acceptUrl: `${await origin()}/${locale}/invite/${token}`, expiresAt: invitation.expiresAt });
  await markInvitationDelivery(invitation.id, sent);
  return sent;
}

export async function inviteClientAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const parsed = clientInvitationSchema.safeParse({ email: formData.get("email"), role: formData.get("role"), companyId: formData.get("companyId") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const created = await createClientInvitation(principal, parsed.data);
    const sent = await deliver(locale, created.token, created.invitation, principal.name);
    revalidatePath(`/${locale}/app/users`);
    return { success: sent ? "Invitation sent." : "Invitation saved, but email delivery failed. You can resend it." };
  } catch (error) { return { error: errorMessage(error) }; }
}

export async function inviteStaffAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const parsed = staffInvitationSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const created = await createStaffInvitation(principal, parsed.data);
    const sent = await deliver(locale, created.token, created.invitation, principal.name);
    revalidatePath(`/${locale}/app/users`);
    return { success: sent ? "Invitation sent." : "Invitation saved, but email delivery failed. You can resend it." };
  } catch (error) { return { error: errorMessage(error) }; }
}

export async function updateMembershipAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const parsed = membershipUpdateSchema.safeParse({ membershipId: formData.get("membershipId"), role: formData.get("role") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try { await updateMembershipRole(await principalOrThrow(), parsed.data.membershipId, parsed.data.role); revalidatePath(`/${locale}/app/users`); return { success: "Role updated." }; }
  catch (error) { return { error: errorMessage(error) }; }
}

export async function removeMembershipAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("membershipId")); if (!id.success) return { error: "Invalid membership." };
  try { await removeMembership(await principalOrThrow(), id.data); revalidatePath(`/${locale}/app/users`); return { success: "Access removed." }; }
  catch (error) { return { error: errorMessage(error) }; }
}

export async function updateStaffAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const parsed = staffUpdateSchema.safeParse({ userId: formData.get("userId"), role: formData.get("role") || undefined, isActive: formData.get("isActive") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try { await updateStaffUser(await principalOrThrow(), parsed.data.userId, { role: parsed.data.role, isActive: parsed.data.isActive }); revalidatePath(`/${locale}/app/users`); return { success: "User updated." }; }
  catch (error) { return { error: errorMessage(error) }; }
}

export async function revokeInvitationAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("invitationId")); if (!id.success) return { error: "Invalid invitation." };
  try { await revokeInvitation(await principalOrThrow(), id.data); revalidatePath(`/${locale}/app/users`); return { success: "Invitation revoked." }; }
  catch (error) { return { error: errorMessage(error) }; }
}

export async function resendInvitationAction(locale: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("invitationId")); if (!id.success) return { error: "Invalid invitation." };
  try { const principal = await principalOrThrow(); const renewed = await renewInvitation(principal, id.data); const sent = await deliver(locale, renewed.token, renewed.invitation, principal.name); revalidatePath(`/${locale}/app/users`); return sent ? { success: "Invitation resent." } : { error: "The invitation was renewed, but email delivery failed." }; }
  catch (error) { return { error: errorMessage(error) }; }
}
