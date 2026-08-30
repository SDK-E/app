"use server";

import { regenerateCompanyAccessCode } from "@platform/companies";
import { sendAccessRequestResolvedNotification } from "@platform/email";
import {
  approveAccessRequestSchema,
  declineAccessRequestSchema,
  idSchema,
} from "@platform/schemas/userManagement";
import { approveCompanyAccessRequest, declineCompanyAccessRequest } from "@platform/users";
import { revalidatePath } from "next/cache";

import type { UserActionState } from "./actions-common";

import { errorMessage, principalOrThrow } from "./actions-common";

export type { UserActionState };

export async function approveAccessRequestAction(
  locale: string,
  companyId: null | string,
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const parsed = approveAccessRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const { request } = await approveCompanyAccessRequest(principal, parsed.data.requestId, {
      role: parsed.data.role,
    });
    await sendAccessRequestResolvedNotification({
      to: request.user.email,
      recipientName: request.user.name,
      companyName: request.company.name,
      outcome: "APPROVED",
      role: parsed.data.role.replaceAll("_", " ").toLowerCase(),
    });
    revalidateUserViews(locale, companyId);
    return { success: "Access request approved." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function declineAccessRequestAction(
  locale: string,
  companyId: null | string,
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const parsed = declineAccessRequestSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const request = await declineCompanyAccessRequest(principal, parsed.data.requestId);
    await sendAccessRequestResolvedNotification({
      to: request.user.email,
      recipientName: request.user.name,
      companyName: request.company.name,
      outcome: "DECLINED",
    });
    revalidateUserViews(locale, companyId);
    return { success: "Access request declined." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function regenerateAccessCodeAction(
  locale: string,
  companyId: null | string,
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const id = idSchema.safeParse(formData.get("companyId") || companyId || undefined);
  if (!id.success) return { error: "Invalid company." };
  try {
    await regenerateCompanyAccessCode(await principalOrThrow(), id.data);
    revalidateUserViews(locale, id.data);
    return { success: "Access code regenerated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

function revalidateUserViews(locale: string, companyId?: null | string) {
  revalidatePath(usersPath(locale, companyId));
  revalidatePath(`/${locale}/app/users/[userId]`, "page");
}

function usersPath(locale: string, companyId?: null | string) {
  return companyId ? `/${locale}/app/companies/${companyId}/users` : `/${locale}/app/users`;
}
