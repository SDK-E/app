import { z } from "zod";

const ALLOWED_EVIDENCE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_EVIDENCE_SIZE_BYTES = 10 * 1024 * 1024;

export const reviewVerificationDecisionSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("approve"),
    expiresAt: z.coerce.date().optional(),
  }),
  z.object({
    decision: z.literal("reject"),
    rejectionReason: z
      .string()
      .trim()
      .min(10, "Please provide a reason for rejection (min 10 characters)."),
  }),
  z.object({
    decision: z.literal("waive"),
    reason: z
      .string()
      .trim()
      .min(10, "Please provide a reason for waiving this requirement (min 10 characters)."),
  }),
]);

export const submitEvidenceSchema = z.object({
  name: z.string().trim().min(1).max(255),
  storageKey: z.string().trim().min(1).max(1024),
  mimeType: z.enum(ALLOWED_EVIDENCE_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_EVIDENCE_SIZE_BYTES),
  contentHash: z.string().trim().max(255).optional(),
});

export const upsertVerificationRequirementSchema = z.object({
  type: z.enum([
    "IDENTITY",
    "BUSINESS_REGISTRATION",
    "VAT_TAX",
    "BANK_PAYOUT",
    "PROFESSIONAL_CREDENTIAL",
  ]),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional(),
  required: z.boolean(),
  enabled: z.boolean(),
});

export const updateReadinessComponentSchema = z.object({
  component: z.enum(["contractReady", "payoutReady", "taxInfoReady"]),
  ready: z.boolean(),
});

export type ReviewVerificationDecision = z.infer<typeof reviewVerificationDecisionSchema>;
export type SubmitEvidenceInput = z.infer<typeof submitEvidenceSchema>;
export type UpsertVerificationRequirementInput = z.infer<
  typeof upsertVerificationRequirementSchema
>;
export type UpdateReadinessComponentInput = z.infer<typeof updateReadinessComponentSchema>;
