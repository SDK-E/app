import { redirect } from "next/navigation";

import type { AuthorizationErrorCode } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";
import { IdentityError } from "@/lib/auth/identity";

const authRedirects = new Map<AuthorizationErrorCode, string>([
  ["UNAUTHENTICATED", "/app/unauthenticated"],
  ["UNASSIGNED", "/app/access-not-granted"],
  ["FORBIDDEN", "/app/access-not-granted"],
  ["COMPANY_REQUIRED", "/app/access-not-granted"],
  ["NOT_FOUND", "/app/access-not-granted"],
]);

export async function renderForPage<T>(compute: () => T | Promise<T>, locale: string): Promise<T> {
  try {
    return await compute();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const target = authRedirects.get(error.code);
      if (target) {
        redirect(`/${locale}${target}`);
      }
    }
    if (error instanceof IdentityError) {
      redirect(`/${locale}/app/server-error`);
    }
    throw error;
  }
}
