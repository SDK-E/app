"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createTimeEntry, submitTimeEntry, updateOwnProviderProfile } from "@/lib/data/providers";
import { getCurrentPrincipal } from "@/lib/identity";

export async function updateProviderProfileAction(locale: string, formData: FormData) {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new Error("Authentication is required.");
  await updateOwnProviderProfile(principal, {
    legalName: formData.get("legalName"), tradingName: formData.get("tradingName"), professionalHeadline: formData.get("professionalHeadline"),
    professionalEmail: formData.get("professionalEmail"), professionalPhone: formData.get("professionalPhone"), addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"), city: formData.get("city"), postalCode: formData.get("postalCode"), countryCode: formData.get("countryCode"),
    taxResidenceCode: formData.get("taxResidenceCode"), registrationId: formData.get("registrationId"), taxId: formData.get("taxId"), vatId: formData.get("vatId"),
    payoutDetails: formData.get("payoutDetails"), declarations: { informationAccurate: formData.get("informationAccurate") === "on" },
  });
  redirect(`/${locale}/app/provider/onboarding?submitted=1`);
}

export async function createTimeEntryAction(locale: string, formData: FormData) {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new Error("Authentication is required.");
  await createTimeEntry(principal, {
    assignmentId: formData.get("assignmentId"), milestoneId: formData.get("milestoneId") || undefined,
    workDate: formData.get("workDate"), durationMinutes: Number(formData.get("durationMinutes")), description: formData.get("description"),
  });
  revalidatePath(`/${locale}/app/provider/time`);
}

export async function submitTimeEntryAction(locale: string, formData: FormData) {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new Error("Authentication is required.");
  await submitTimeEntry(principal, String(formData.get("timeEntryId")));
  revalidatePath(`/${locale}/app/provider/time`);
}
