import { z } from "zod";

import { routing } from "@sdk-e/i18n/routing";
import { clientRoles, sdkStaffRoles } from "@sdk-e/types";

export const localeSchema = z.enum(routing.locales);
export const themeSchema = z.enum(["light", "dark", "system"]);
export const manageableClientRoleSchema = z.enum([
  "ADMINISTRATOR",
  "PROJECT_MEMBER",
  "BILLING",
  "VIEWER",
]);

export const clientInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: manageableClientRoleSchema,
  companyId: z.string().uuid().optional(),
});

export const staffInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(sdkStaffRoles),
});

export const membershipUpdateSchema = z.object({
  membershipId: z.string().uuid(),
  role: z.enum(clientRoles),
});

export const idSchema = z.string().uuid();

export const staffUpdateSchema = z
  .object({
    userId: z.string().uuid(),
    role: z.enum(sdkStaffRoles).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .refine(
    (value) => value.role !== undefined || value.isActive !== undefined,
    "Choose a staff update."
  );

export const requestAccessSchema = z.object({
  code: z.string().trim().min(4, "Enter the company access code.").max(16),
  requestedRole: z.enum(["PROJECT_MEMBER", "BILLING", "VIEWER"]).optional(),
});

export const approveAccessRequestSchema = z.object({
  requestId: z.string().uuid(),
  role: manageableClientRoleSchema,
});

export const declineAccessRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const directAssignmentSchema = z.object({
  userId: z.string().uuid(),
  companyId: z.string().uuid(),
  role: z.enum(clientRoles),
});

export const userNameUpdateSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1, "Enter a name.").max(100),
});

export const accountActiveSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});
