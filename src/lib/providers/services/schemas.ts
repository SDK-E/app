import { z } from "zod";
import { requestCapabilities } from "@/lib/schemas/serviceRequest";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => (value === "" ? null : value));

const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
] as const;

const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;

export const serviceDraftSchema = z.object({
  title: optionalText(255),
  description: optionalText(8000),
  capability: z.enum(requestCapabilities).optional(),
  categoryTags: z.array(z.string().trim().min(1)).max(20).default([]),
  pricingModel: z.enum(["HOURLY", "FIXED_PROJECT", "RETAINER", "DAY_RATE"]).nullable().optional(),
  rateMin: z.coerce.number().positive().nullable().optional(),
  rateMax: z.coerce.number().positive().nullable().optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .default("USD"),
  estimatedDuration: optionalText(100),
  deliverables: optionalText(4000),
});

export const serviceSubmissionSchema = serviceDraftSchema
  .extend({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().min(50).max(8000),
    capability: z.enum(requestCapabilities),
    pricingModel: z.enum(["HOURLY", "FIXED_PROJECT", "RETAINER", "DAY_RATE"]),
    rateMin: z.coerce.number().positive(),
    rateMax: z.coerce.number().positive(),
  })
  .refine((data) => data.rateMax >= data.rateMin, {
    message: "Maximum rate must be greater than or equal to minimum rate.",
    path: ["rateMax"],
  });

export const serviceReviewDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({
    decision: z.literal("reject"),
    reason: z.string().trim().min(10, "Please provide a reason for rejection."),
  }),
  z.object({
    decision: z.literal("requestChanges"),
    reason: z.string().trim().min(10, "Please describe the changes needed."),
  }),
]);

export const addMediaAssetSchema = z.object({
  name: z.string().trim().min(1).max(255),
  storageKey: z.string().trim().min(1).max(1024),
  mimeType: z.enum(ALLOWED_MEDIA_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_MEDIA_SIZE_BYTES),
  kind: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "OTHER"]).default("OTHER"),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type ServiceDraftInput = z.infer<typeof serviceDraftSchema>;
export type ServiceSubmissionInput = z.infer<typeof serviceSubmissionSchema>;
export type ServiceReviewDecision = z.infer<typeof serviceReviewDecisionSchema>;
export type AddMediaAssetInput = z.infer<typeof addMediaAssetSchema>;
