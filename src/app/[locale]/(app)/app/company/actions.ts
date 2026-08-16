"use server";

import { createOwnedCompany } from "@/lib/companies";
import { getCurrentPrincipal } from "@/lib/identity";
import { companyCreationSchema } from "@/lib/schemas/company";

export interface CompanyCreationState {
  error?: string;
  success?: boolean;
}

export async function createCompanyAction(
  locale: string,
  _state: CompanyCreationState,
  formData: FormData
): Promise<CompanyCreationState> {
  void _state;
  const parsed = companyCreationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    await createOwnedCompany(principal, parsed.data.name);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The company could not be created." };
  }
  return { success: true };
}
