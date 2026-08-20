"use server";

import { revalidatePath } from "next/cache";

import { reviewProviderService } from "@/lib/providers/services/review";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { serviceReviewDecisionSchema } from "@/lib/providers/services/schemas";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function reviewProviderServiceAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = serviceReviewDecisionSchema.safeParse({
    decision: formData.get("decision"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await reviewProviderService(principal, formData.get("serviceId") as string, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}
