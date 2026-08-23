"use server";

import { revalidatePath } from "next/cache";

import {
  getProviderApplication,
  getProviderApplicationsForReview,
  reviewProviderApplication,
  saveProviderApplicationDraft,
  submitProviderApplication,
} from "@sdk-e/providers";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import {
  providerDraftSchema,
  providerReviewDecisionSchema,
  providerSubmissionSchema,
} from "@sdk-e/providers/schemas";

export interface ProviderActionState {
  error?: string;
  success?: boolean;
}

export interface ProviderReviewActionState extends ProviderActionState {
  success?: boolean;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function saveProviderApplicationAction(
  _state: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = providerDraftSchema.safeParse({
    professionalTitle: formData.get("professionalTitle"),
    biography: formData.get("biography"),
    cvStorageKey: formData.get("cvStorageKey"),
    portfolioUrl: formData.get("portfolioUrl"),
    yearsOfExperience: formData.get("yearsOfExperience"),
    languages: String(formData.get("languages") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
    expectedRateMin: formData.get("expectedRateMin"),
    expectedRateMax: formData.get("expectedRateMax"),
    linkedinUrl: formData.get("linkedinUrl"),
    githubUrl: formData.get("githubUrl"),
    websiteUrl: formData.get("websiteUrl"),
    businessLegalInfo: formData.get("businessLegalInfo"),
    vatInfo: formData.get("vatInfo"),
    preferredProjectTypes: String(formData.get("preferredProjectTypes") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await saveProviderApplicationDraft(principal, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers");
  return {};
}

export async function submitProviderApplicationAction(
  _state: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = providerSubmissionSchema.safeParse({
    professionalTitle: formData.get("professionalTitle"),
    biography: formData.get("biography"),
    cvStorageKey: formData.get("cvStorageKey"),
    portfolioUrl: formData.get("portfolioUrl"),
    yearsOfExperience: formData.get("yearsOfExperience"),
    languages: String(formData.get("languages") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
    expectedRateMin: formData.get("expectedRateMin"),
    expectedRateMax: formData.get("expectedRateMax"),
    linkedinUrl: formData.get("linkedinUrl"),
    githubUrl: formData.get("githubUrl"),
    websiteUrl: formData.get("websiteUrl"),
    businessLegalInfo: formData.get("businessLegalInfo"),
    vatInfo: formData.get("vatInfo"),
    preferredProjectTypes: String(formData.get("preferredProjectTypes") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
    businessName: formData.get("businessName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await saveProviderApplicationDraft(principal, parsed.data);
    await submitProviderApplication(principal);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers");
  return { success: true };
}

export async function reviewProviderApplicationAction(
  _state: ProviderReviewActionState,
  formData: FormData
): Promise<ProviderReviewActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = providerReviewDecisionSchema.safeParse({
    decision: formData.get("decision"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await reviewProviderApplication(principal, formData.get("providerId") as string, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers");
  return { success: true };
}

export async function getProviderApplicationAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;
  return getProviderApplication(principal);
}

export async function getProviderApplicationsForReviewAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getProviderApplicationsForReview(principal);
}
