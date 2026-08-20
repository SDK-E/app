import type { ClientRole, Permission, SdkStaffRole } from "@/types";

const readPermissions: Permission[] = [
  "company:view",
  "membership:view",
  "request:view",
  "project:view",
  "document:view",
  "message:view",
  "invoice:view",
];

const deliveryWritePermissions: Permission[] = [
  "request:create",
  "request:update",
  "project:create",
  "project:update",
  "document:create",
  "document:update",
  "message:create",
  "message:update",
];

const destructiveDeliveryPermissions: Permission[] = [
  "request:delete",
  "project:delete",
  "document:delete",
  "message:delete",
];

const membershipAdminPermissions: Permission[] = [
  "membership:invite",
  "membership:update",
  "membership:remove",
];

const billingWritePermissions: Permission[] = [
  "invoice:create",
  "invoice:update",
  "invoice:delete",
];

export const clientRolePermissions: Record<ClientRole, ReadonlySet<Permission>> = {
  OWNER: new Set([
    ...readPermissions,
    ...deliveryWritePermissions,
    ...destructiveDeliveryPermissions,
    ...membershipAdminPermissions,
    ...billingWritePermissions,
    "company:update",
  ]),
  ADMINISTRATOR: new Set([
    ...readPermissions,
    ...deliveryWritePermissions,
    ...destructiveDeliveryPermissions,
    ...membershipAdminPermissions,
  ]),
  PROJECT_MEMBER: new Set([
    "company:view",
    "membership:view",
    "request:view",
    "request:create",
    "request:update",
    "project:view",
    "project:create",
    "project:update",
    "document:view",
    "document:create",
    "document:update",
    "message:view",
    "message:create",
    "message:update",
  ]),
  BILLING: new Set(["company:view", "project:view", "invoice:view"]),
  VIEWER: new Set(readPermissions),
};

export const sdkRolePermissions: Record<SdkStaffRole, ReadonlySet<Permission>> = {
  ADMIN: new Set([
    ...readPermissions,
    ...deliveryWritePermissions,
    ...destructiveDeliveryPermissions,
    ...membershipAdminPermissions,
    ...billingWritePermissions,
    "company:update",
    "company:create",
    "staff:view",
    "staff:create",
    "staff:update",
    "provider:view",
    "provider:update",
    "provider:review",
    "match:view",
    "match:execute",
    "match:override",
  ]),
  DELIVERY: new Set([
    "company:view",
    "membership:view",
    "request:view",
    "request:create",
    "request:update",
    "project:view",
    "project:create",
    "project:update",
    "document:view",
    "document:create",
    "document:update",
    "message:view",
    "message:create",
    "message:update",
    "provider:view",
    "provider:review",
    "match:view",
    "match:execute",
  ]),
  FINANCE: new Set(["company:view", "project:view", "invoice:view", ...billingWritePermissions]),
};
