import { getCurrentPrincipal } from "@sdk-e/auth/identity";

export interface UserActionState {
  error?: string;
  success?: string;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function principalOrThrow() {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new Error("Your session has ended.");
  return principal;
}
