"use server";

import { cookies } from "next/headers";

import { getPrisma } from "@/lib/db";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { localeSchema } from "@/lib/schemas/userManagement";

export async function updatePreferredLocaleAction(locale: string): Promise<{ ok: boolean }> {
  const parsed = localeSchema.safeParse(locale);
  const principal = await getCurrentPrincipal();
  if (!parsed.success || !principal) return { ok: false };
  await getPrisma().user.update({
    where: { id: principal.id },
    data: { preferredLocale: parsed.data },
  });
  (await cookies()).set("NEXT_LOCALE", parsed.data, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return { ok: true };
}
