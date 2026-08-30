"use server";

import { getPrisma } from "@platform/db";
import { sendEnquiryNotification } from "@platform/email";
import { type EnquiryInput, enquirySchema } from "@platform/schemas/enquiry";

export type EnquiryResult =
  { success: false; errors: Record<string, string>; formError?: string } | { success: true };

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
