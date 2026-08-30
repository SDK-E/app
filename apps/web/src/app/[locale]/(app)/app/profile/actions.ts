"use server";

import { getCurrentPrincipal } from "@platform/auth/identity";
import { getPrisma } from "@platform/db";
import { localeSchema, themeSchema } from "@platform/schemas/userManagement";
import { cookies } from "next/headers";

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

export async function updatePreferredThemeAction(theme: string): Promise<{ ok: boolean }> {
  const parsed = themeSchema.safeParse(theme);
  const principal = await getCurrentPrincipal();
  if (!parsed.success || !principal) return { ok: false };
  await getPrisma().user.update({
    where: { id: principal.id },
    data: { preferredTheme: parsed.data },
  });
  (await cookies()).set("preferredTheme", parsed.data, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return { ok: true };
}
