export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Result<T, E = Error> = { ok: false; error: E } | { ok: true; value: T };

export const clientRoles = [
  "OWNER",
  "ADMINISTRATOR",
  "PROJECT_MEMBER",
  "BILLING",
  "VIEWER",
] as const;

export type ClientRole = (typeof clientRoles)[number];

export const sdkStaffRoles = ["ADMIN", "DELIVERY", "FINANCE"] as const;

export type SdkStaffRole = (typeof sdkStaffRoles)[number];

export const permissions = [
  "company:view",
  "company:create",
  "company:update",
  "membership:view",
  "membership:invite",
  "membership:update",
  "membership:remove",
  "membership:create",
  "user:view",
  "user:update",
  "user:activate",
  "request:view",
  "request:create",
  "request:update",
  "request:delete",
  "project:view",
  "project:create",
  "project:update",
  "project:delete",
  "document:view",
  "document:create",
  "document:update",
  "document:delete",
  "message:view",
  "message:create",
  "message:update",
  "message:delete",
  "invoice:view",
  "invoice:create",
  "invoice:update",
  "invoice:delete",
  "staff:view",
  "staff:create",
  "staff:update",
  "provider:view",
  "provider:update",
  "provider:review",
  "match:view",
  "match:execute",
  "match:override",
] as const;

export type AppPrincipal = AssignedPrincipal | UnassignedPrincipal;

export type AssignedPrincipal = ClientPrincipal | ProviderPrincipal | SdkStaffPrincipal;

export interface ClientMembership {
  companyId: string;
  companyName: string;
  role: ClientRole;
}

export interface ClientPrincipal extends PrincipalUser {
  kind: "client";
  memberships: ClientMembership[];
}

export type Permission = (typeof permissions)[number];

export interface ProviderPrincipal extends PrincipalUser {
  kind: "provider";
  providerId: string;
}

export interface SdkStaffPrincipal extends PrincipalUser {
  kind: "sdk-staff";
  role: SdkStaffRole;
}

export interface UnassignedPrincipal extends PrincipalUser {
  kind: "unassigned";
}
interface PrincipalUser {
  id: string;
  auth0Sub: string;
  email: string;
  name: string;
  avatarUrl: null | string;
  preferredLocale: string;
  preferredTheme: string;
}
