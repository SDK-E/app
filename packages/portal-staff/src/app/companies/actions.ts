"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { regenerateCompanyAccessCode, setCompanyActive } from "@sdk-e/companies";
import type { UserActionState } from "@sdk-e/portal-staff/app/users/actions-common";
import { errorMessage, principalOrThrow } from "@sdk-e/portal-staff/app/users/actions-common";

export type { UserActionState };

function companiesPath(locale: string, companyId: string) {
  return companyId ? `/${locale}/app/companies/${companyId}/manage` : `/${locale}/app/companies`;
}

export async function setCompanyActiveAction(
  locale: string,
  companyId: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const active = z.enum(["true", "false"]).safeParse(formData.get("isActive"));
  if (!active.success) return { error: "Choose an action." };
  try {
    await setCompanyActive(await principalOrThrow(), companyId, active.data === "true");
    revalidatePath(companiesPath(locale, companyId));
    revalidatePath(`/${locale}/app/companies`);
    return { success: active.data === "true" ? "Company activated." : "Company deactivated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function regenerateAccessCodeAction(
  locale: string,
  companyId: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  void formData;
  try {
    await regenerateCompanyAccessCode(await principalOrThrow(), companyId);
    revalidatePath(companiesPath(locale, companyId));
    revalidatePath(`/${locale}/app/companies`);
    return { success: "Access code regenerated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
