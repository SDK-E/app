export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

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
  "company:update",
  "membership:view",
  "membership:invite",
  "membership:update",
  "membership:remove",
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
] as const;

export type Permission = (typeof permissions)[number];

interface PrincipalUser {
  id: string;
  auth0Sub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface UnassignedPrincipal extends PrincipalUser {
  kind: "unassigned";
}

export interface ClientPrincipal extends PrincipalUser {
  kind: "client";
  companyId: string;
  companyName: string;
  role: ClientRole;
}

export interface SdkStaffPrincipal extends PrincipalUser {
  kind: "sdk-staff";
  role: SdkStaffRole;
}

export type AssignedPrincipal = ClientPrincipal | SdkStaffPrincipal;
export type AppPrincipal = UnassignedPrincipal | AssignedPrincipal;
