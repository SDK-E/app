import { z } from "zod";

const optionalUrl = () =>
  z
    .string()
    .trim()
    .url({ message: "A valid URL is required." })
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value));

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => (value === "" ? null : value));

export const providerDraftSchema = z.object({
  professionalTitle: optionalText(255),
  biography: optionalText(4000),
  cvStorageKey: optionalText(1024),
  portfolioUrl: optionalUrl(),
  yearsOfExperience: z.coerce.number().int().nonnegative().nullable(),
  languages: z.array(z.string().trim().min(1)).max(20).default([]),
  expectedRateMin: z.coerce.number().positive().nullable(),
  expectedRateMax: z.coerce.number().positive().nullable(),
  linkedinUrl: optionalUrl(),
  githubUrl: optionalUrl(),
  websiteUrl: optionalUrl(),
  businessLegalInfo: optionalText(4000),
  vatInfo: optionalText(255),
  preferredProjectTypes: z.array(z.string().trim().min(1)).max(20).default([]),
});

export const providerSubmissionSchema = providerDraftSchema
  .extend({
    professionalTitle: z.string().trim().min(1).max(255),
    biography: z.string().trim().min(50).max(4000),
    yearsOfExperience: z.coerce.number().int().nonnegative(),
    expectedRateMin: z.coerce.number().positive(),
    expectedRateMax: z.coerce.number().positive(),
    businessName: z.string().trim().min(1),
  })
  .refine((data) => data.businessLegalInfo || data.businessName, {
    message: "Business legal information or business name is required.",
    path: ["businessLegalInfo"],
  });

export const providerReviewDecisionSchema = z.discriminatedUnion("decision", [
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

export type ProviderDraftInput = z.infer<typeof providerDraftSchema>;
export type ProviderReviewDecision = z.infer<typeof providerReviewDecisionSchema>;
export type ProviderSubmissionInput = z.infer<typeof providerSubmissionSchema>;
