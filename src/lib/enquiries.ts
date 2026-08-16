"use server";

import { enquirySchema, type EnquiryInput } from "@/lib/schemas/enquiry";
import { sendEnquiryNotification } from "@/lib/email";
import { getPrisma } from "@/lib/db";

export type EnquiryResult =
  | { success: true }
  | { success: false; errors: Record<string, string>; formError?: string };

export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    }
    return { success: false, errors };
  }

  const data = parsed.data;

  try {
    await getPrisma().enquiry.create({
      data: {
        companyName: data.companyName,
        email: data.email,
        website: data.website || null,
        capability: data.capability,
        description: data.description,
        environment: data.environment || null,
        timeline: data.timeline || null,
        budgetRange: data.budgetRange || null,
        context: data.context || null,
      },
    });
  } catch {
    return {
      success: false,
      errors: {},
      formError: "Could not save your enquiry. Please try again.",
    };
  }

  const notification = {
    companyName: data.companyName,
    email: data.email,
    website: data.website || null,
    capability: data.capability,
    description: data.description,
    environment: data.environment || null,
    timeline: data.timeline || null,
    budgetRange: data.budgetRange || null,
    context: data.context || null,
  };

  try {
    await sendEnquiryNotification(notification);
  } catch {
    console.error("enquiry notification email failed");
  }

  return { success: true };
}
