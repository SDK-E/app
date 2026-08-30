import type { AppPrincipal, ProviderPrincipal } from "@sdk-e/types";

export const common = {
  id: "user-1",
  auth0Sub: "auth0|1",
  email: "user@example.test",
  name: "User",
  avatarUrl: null,
  preferredLocale: "en",
  preferredTheme: "system",
};

export type PrincipalKind =
  | "owner"
  | "administrator"
  | "member"
  | "virtual-billing"
  | "viewer"
  | "sdk-admin"
  | "delivery"
  | "provider"
  | "unassigned";

export function principal(
  kind: PrincipalKind,
  companyId = "company-1",
  companyName = "Company"
): AppPrincipal {
  if (kind === "unassigned") return { ...common, kind: "unassigned" };
  if (kind === "sdk-admin" || kind === "delivery")
    return { ...common, kind: "sdk-staff", role: kind === "sdk-admin" ? "ADMIN" : "DELIVERY" };
  if (kind === "provider")
    return { ...common, kind: "provider", providerId: "provider-1" } as ProviderPrincipal;
  const role =
    kind === "owner"
      ? "OWNER"
      : kind === "administrator"
        ? "ADMINISTRATOR"
        : kind === "virtual-billing"
          ? "BILLING"
          : kind === "viewer"
            ? "VIEWER"
            : "PROJECT_MEMBER";
  return {
    ...common,
    kind: "client",
    memberships: [{ companyId, companyName, role }],
  };
}
