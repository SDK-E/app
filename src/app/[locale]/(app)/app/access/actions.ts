"use server";

import { revalidatePath } from "next/cache";

import { getPrisma } from "@/lib/db";
import { sendAccessRequestCreatedNotification } from "@/lib/email";
import { getCurrentPrincipal } from "@/lib/identity";
import { requestAccessSchema } from "@/lib/schemas/userManagement";
import { requestCompanyAccess } from "@/lib/user-management";

export interface AccessRequestState {
  error?: string;
  success?: string;
}

export async function requestAccessAction(
  locale: string,
  _state: AccessRequestState,
  formData: FormData
): Promise<AccessRequestState> {
  void _state;
  const parsed = requestAccessSchema.safeParse({
    code: formData.get("code"),
    requestedRole: formData.get("requestedRole") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    const request = await requestCompanyAccess(principal, parsed.data);
    const notifiees = await getAccessRequestNotifiees(request.companyId);
    await Promise.all(
      notifiees.map(({ email, name }) =>
        sendAccessRequestCreatedNotification({
          to: email,
          recipientName: name,
          companyName: request.company.name,
          requesterName: principal.name,
          requesterEmail: principal.email,
        })
      )
    );
    revalidatePath("/", "layout");
    return {
      success: `Access request sent to ${request.company.name}. A company owner or administrator will review it.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The access request could not be submitted.",
    };
  }
}

async function getAccessRequestNotifiees(companyId: string) {
  const db = getPrisma();
  const [members, staff] = await Promise.all([
    db.membership.findMany({
      where: { companyId, role: { in: ["OWNER", "ADMINISTRATOR"] } },
      include: { user: { select: { email: true, name: true } } },
    }),
    db.user.findMany({
      where: { sdkStaffRole: "ADMIN", isActive: true },
      select: { email: true, name: true },
    }),
  ]);
  const seen = new Set<string>();
  const notifiees: Array<{ email: string; name: string }> = [];
  for (const { user } of members) {
    if (!seen.has(user.email)) {
      seen.add(user.email);
      notifiees.push(user);
    }
  }
  for (const user of staff) {
    if (!seen.has(user.email)) {
      seen.add(user.email);
      notifiees.push(user);
    }
  }
  return notifiees;
}
