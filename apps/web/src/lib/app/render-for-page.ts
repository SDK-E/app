import { redirect } from "next/navigation";

import type { AuthorizationErrorCode } from "@sdk-e/auth/authorization";
import { AuthorizationError } from "@sdk-e/auth/authorization";
import { IdentityError } from "@sdk-e/auth/identity";

const authRedirects = new Map<AuthorizationErrorCode, string>([
  ["UNAUTHENTICATED", "/unauthenticated"],
  ["UNASSIGNED", "/app/error/access-not-granted"],
  ["FORBIDDEN", "/app/error/access-not-granted"],
  ["COMPANY_REQUIRED", "/app/error/access-not-granted"],
  ["NOT_FOUND", "/app/error/access-not-granted"],
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
      redirect(`/${locale}/app/error/server-error`);
    }
    throw error;
  }
}
