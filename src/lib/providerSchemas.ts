import { z } from "zod";

export const providerApplicationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(255),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  professionalHeadline: z.string().trim().min(2).max(255),
  profileSummary: z.string().trim().min(20).max(5000),
  portfolioUrl: z.string().trim().url().max(1024).optional().or(z.literal("")),
  privacyAccepted: z.literal(true),
});

export const providerProfileSchema = z.object({
  legalName: z.string().trim().min(2).max(255),
  tradingName: z.string().trim().max(255).optional(),
  professionalHeadline: z.string().trim().min(2).max(255),
  professionalEmail: z.string().trim().toLowerCase().email(),
  professionalPhone: z.string().trim().max(50).optional(),
  addressLine1: z.string().trim().min(2).max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(32),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  taxResidenceCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  registrationId: z.string().trim().min(1).max(255),
  taxId: z.string().trim().min(1).max(255),
  vatId: z.string().trim().max(255).optional(),
  payoutDetails: z.string().trim().min(4).max(2000),
  declarations: z.record(z.string(), z.boolean()).default({}),
});

export const timeEntrySchema = z.object({
  assignmentId: z.string().uuid(),
  milestoneId: z.string().uuid().optional(),
  workDate: z.coerce.date(),
  durationMinutes: z.number().int().min(1).max(24 * 60),
  description: z.string().trim().min(2).max(5000),
});

export const invoiceAdjustmentSchema = z.object({
  description: z.string().trim().min(2).max(500),
  quantity: z.coerce.number().positive().max(100000),
  unitAmount: z.coerce.number().min(-1000000).max(1000000),
  reason: z.string().trim().min(5).max(5000),
});

export const providerInvoiceSchema = z.object({
  assignmentId: z.string().uuid(),
  supplierInvoiceNumber: z.string().trim().min(1).max(100),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  timeEntryIds: z.array(z.string().uuid()).max(500).default([]),
  fixedFeeMilestoneIds: z.array(z.string().uuid()).max(100).default([]),
  adjustments: z.array(invoiceAdjustmentSchema).max(50).default([]),
  taxAmount: z.coerce.number().min(0).max(100000000),
});
