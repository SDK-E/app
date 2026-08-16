"use server";

import { redirect } from "next/navigation";

import { submitProviderApplication } from "@/lib/data/providers";

export async function submitProviderApplicationAction(locale: string, formData: FormData) {
  await submitProviderApplication({
    email: formData.get("email"),
    name: formData.get("name"),
    countryCode: formData.get("countryCode"),
    professionalHeadline: formData.get("professionalHeadline"),
    profileSummary: formData.get("profileSummary"),
    portfolioUrl: formData.get("portfolioUrl"),
    privacyAccepted: formData.get("privacyAccepted") === "on",
  });
  redirect(`/${locale}/service-providers?submitted=1`);
}
