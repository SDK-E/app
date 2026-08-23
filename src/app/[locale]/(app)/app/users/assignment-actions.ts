"use server";

import { revalidatePath } from "next/cache";

import { sendMembershipAssignedNotification } from "@/lib/email";
import {
  accountActiveSchema,
  directAssignmentSchema,
  userNameUpdateSchema,
} from "@/lib/schemas/userManagement";
import { assignCompanyMemberDirectly, setAccountActive, updateUserName } from "@/lib/users";
import type { UserActionState } from "./actions-common";
import { errorMessage, principalOrThrow } from "./actions-common";

function revalidateUserViews(locale: string, companyId?: string) {
  revalidatePath(`/${locale}/app/users`);
  if (companyId) revalidatePath(`/${locale}/app/companies/${companyId}/users`);
}

export async function assignUserToCompanyAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = directAssignmentSchema.safeParse({
    userId: formData.get("userId"),
    companyId: formData.get("companyId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const result = await assignCompanyMemberDirectly(principal, parsed.data);
    try {
      await sendMembershipAssignedNotification({
        to: result.user.email,
        recipientName: result.user.name,
        companyName: result.company.name,
        role: parsed.data.role.replaceAll("_", " ").toLowerCase(),
      });
    } catch {
      // Assignment stands; notification is best-effort.
    }
    revalidatePath(`/${locale}/app/users/${parsed.data.userId}`);
    revalidateUserViews(locale, parsed.data.companyId);
    return { success: "User assigned to company." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function updateUserNameAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = userNameUpdateSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await updateUserName(await principalOrThrow(), parsed.data.userId, parsed.data.name);
    revalidatePath(`/${locale}/app/users/${parsed.data.userId}`);
    revalidateUserViews(locale);
    return { success: "Name updated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setAccountActiveAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = accountActiveSchema.safeParse({
    userId: formData.get("userId"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await setAccountActive(await principalOrThrow(), parsed.data.userId, parsed.data.isActive);
    revalidatePath(`/${locale}/app/users/${parsed.data.userId}`);
    revalidateUserViews(locale);
    return { success: parsed.data.isActive ? "Account activated." : "Account deactivated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
