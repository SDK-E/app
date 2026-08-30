"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createSdkCompany } from "@sdk-e/companies";
import { getServerEnv } from "@sdk-e/env";
import { sendInvitationNotification } from "@sdk-e/email";
import { sdkCompanyCreationSchema } from "@sdk-e/schemas/company";
import { markInvitationDelivery } from "@sdk-e/users";
import type { UserActionState } from "@sdk-e/portal-staff/app/users/actions-common";
import { errorMessage, principalOrThrow } from "@sdk-e/portal-staff/app/users/actions-common";

export type { UserActionState };

async function origin() {
  const configured = getServerEnv().AUTH0_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const values = await headers();
  return `${values.get("x-forwarded-proto") ?? "http"}://${values.get("host")}`;
}

export async function createSdkCompanyAction(
  locale: string,
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = sdkCompanyCreationSchema.safeParse({
    name: formData.get("name"),
    ownerEmail: formData.get("ownerEmail"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const principal = await principalOrThrow();
    const { company, invitation, token } = await createSdkCompany(principal, parsed.data);
    const sent = await sendInvitationNotification({
      email: invitation.email,
      inviterName: principal.name,
      destination: company.name,
      role: "owner",
      acceptUrl: `${await origin()}/${locale}/invite/${token}`,
      expiresAt: invitation.expiresAt,
    });
    await markInvitationDelivery(invitation.id, sent);
    revalidatePath(`/${locale}/app/companies`);
    revalidatePath(`/${locale}/app/companies/${company.id}/manage`);
    return {
      success: sent
        ? "Company created and the owner invitation was sent."
        : "Company created, but the owner invitation email could not be sent. Resend it from the company page.",
    };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
