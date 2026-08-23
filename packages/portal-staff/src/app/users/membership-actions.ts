"use server";

import { revalidatePath } from "next/cache";

import { idSchema, membershipUpdateSchema, staffUpdateSchema } from "@sdk-e/schemas/userManagement";
import { removeMembership, updateMembershipRole, updateStaffUser } from "@sdk-e/users";
import type { UserActionState } from "./actions-common";
import { errorMessage, principalOrThrow } from "./actions-common";

export type { UserActionState };

function usersPath(locale: string, companyId?: string | null) {
  return companyId ? `/${locale}/app/companies/${companyId}/users` : `/${locale}/app/users`;
}

function revalidateUserViews(locale: string, companyId?: string | null) {
  revalidatePath(usersPath(locale, companyId));
  revalidatePath(`/${locale}/app/users/[userId]`, "page");
}

export async function updateMembershipAction(
  locale: string,
  companyId: string | null,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = membershipUpdateSchema.safeParse({
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await updateMembershipRole(
      await principalOrThrow(),
      parsed.data.membershipId,
      parsed.data.role,
      companyId ?? undefined
    );
    revalidateUserViews(locale, companyId);
    return { success: "Role updated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function removeMembershipAction(
  locale: string,
  companyId: string | null,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("membershipId"));
  if (!id.success) return { error: "Invalid membership." };
  try {
    await removeMembership(await principalOrThrow(), id.data, companyId ?? undefined);
    revalidateUserViews(locale, companyId);
    return { success: "Access removed." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function updateStaffAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = staffUpdateSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role") || undefined,
    isActive: formData.get("isActive") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await updateStaffUser(await principalOrThrow(), parsed.data.userId, {
      role: parsed.data.role,
      isActive: parsed.data.isActive,
    });
    revalidateUserViews(locale, null);
    return { success: "User updated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
