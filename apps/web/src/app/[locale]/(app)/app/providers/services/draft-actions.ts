"use server";

import { revalidatePath } from "next/cache";

import {
  createServiceDraft,
  saveServiceDraft,
  submitServiceForReview,
} from "@sdk-e/providers/services/draft";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { serviceDraftSchema } from "@sdk-e/providers/services/schemas";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function createServiceDraftAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = serviceDraftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    capability: formData.get("capability"),
    categoryTags: String(formData.get("categoryTags") ?? "")
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean),
    pricingModel: formData.get("pricingModel"),
    rateMin: formData.get("rateMin"),
    rateMax: formData.get("rateMax"),
    currency: formData.get("currency"),
    estimatedDuration: formData.get("estimatedDuration"),
    deliverables: formData.get("deliverables"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await createServiceDraft(principal, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}

export async function saveServiceDraftAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = serviceDraftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    capability: formData.get("capability"),
    categoryTags: String(formData.get("categoryTags") ?? "")
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean),
    pricingModel: formData.get("pricingModel"),
    rateMin: formData.get("rateMin"),
    rateMax: formData.get("rateMax"),
    currency: formData.get("currency"),
    estimatedDuration: formData.get("estimatedDuration"),
    deliverables: formData.get("deliverables"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await saveServiceDraft(principal, formData.get("serviceId") as string, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}

export async function submitServiceForReviewAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    await submitServiceForReview(principal, formData.get("serviceId") as string);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}
