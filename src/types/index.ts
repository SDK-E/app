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
  "provider:view",
  "provider:create",
  "provider:update",
  "provider:review",
  "provider:compliance:view",
  "provider:compliance:review",
  "provider:assignment:view",
  "provider:assignment:manage",
  "provider:time:view",
  "provider:time:review",
  "provider:invoice:view",
  "provider:invoice:review",
  "provider:invoice:pay",
  "provider:form:view",
  "provider:form:manage",
  "automation:view",
  "automation:manage",
] as const;

export type Permission = (typeof permissions)[number];

interface PrincipalUser {
  id: string;
  auth0Sub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferredLocale: string;
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

export const serviceProviderStatuses = [
  "APPLICANT",
  "ONBOARDING",
  "UNDER_REVIEW",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ServiceProviderStatus = (typeof serviceProviderStatuses)[number];

export interface ServiceProviderPrincipal extends PrincipalUser {
  kind: "service-provider";
  providerId: string;
  status: ServiceProviderStatus;
}

export type AssignedPrincipal = ClientPrincipal | SdkStaffPrincipal | ServiceProviderPrincipal;
export type AppPrincipal = UnassignedPrincipal | AssignedPrincipal;
