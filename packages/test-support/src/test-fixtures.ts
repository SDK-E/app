import type { AppPrincipal, ProviderPrincipal } from "@platform/types";

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
  | "administrator"
  | "delivery"
  | "member"
  | "owner"
  | "provider"
  | "sdk-admin"
  | "unassigned"
  | "viewer"
  | "virtual-billing";

export function principal(
  kind: PrincipalKind,
  companyId = "company-1",
  companyName = "Company",
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
