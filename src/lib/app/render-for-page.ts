import { notFound } from "next/navigation";

import type { AuthorizationErrorCode } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";

const hiddenFromPage = new Set<AuthorizationErrorCode>(["FORBIDDEN", "NOT_FOUND"]);

export async function renderForPage<T>(compute: () => T | Promise<T>): Promise<T> {
  try {
    return await compute();
  } catch (error) {
    if (error instanceof AuthorizationError && hiddenFromPage.has(error.code)) notFound();
    throw error;
  }
}
