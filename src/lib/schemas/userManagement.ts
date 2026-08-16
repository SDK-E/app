import { z } from "zod";

import { routing } from "@/i18n/routing";
import { clientRoles, sdkStaffRoles } from "@/types";

export const localeSchema = z.enum(routing.locales);
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

export const staffUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(sdkStaffRoles).optional(),
  isActive: z.enum(["true", "false"]).transform(value => value === "true").optional(),
}).refine(value => value.role !== undefined || value.isActive !== undefined, "Choose a staff update.");
