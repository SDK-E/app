"use server";

import type { UserActionState } from "@platform/portal-staff/app/users/actions-common";

import { regenerateCompanyAccessCode, setCompanyActive } from "@platform/companies";
import { errorMessage, principalOrThrow } from "@platform/portal-staff/app/users/actions-common";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type { UserActionState };

export async function regenerateAccessCodeAction(
  locale: string,
  companyId: string,
  _state: UserActionState,
  formData: FormData,
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

export async function setCompanyActiveAction(
  locale: string,
  companyId: string,
  _state: UserActionState,
  formData: FormData,
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

function companiesPath(locale: string, companyId: string) {
  return companyId ? `/${locale}/app/companies/${companyId}/manage` : `/${locale}/app/companies`;
}
