import { z } from "zod";

export const requestCapabilities = [
  "modernization",
  "platforms",
  "ai-automation",
  "production-systems",
  "data-interfaces",
  "other",
] as const;

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || null);

export const requestDraftSchema = z.object({
  title: z.string().trim().min(1).max(255),
  capability: z.enum(requestCapabilities),
  description: z.string().trim().max(4000),
  businessContext: optionalText(4000),
  supportingInformation: optionalText(4000),
  supportingLinks: z.array(z.url({ protocol: /^https?$/ })).max(5),
});

export const requestSubmissionSchema = requestDraftSchema.extend({
  description: z.string().trim().min(50).max(4000),
  businessContext: z.string().trim().min(20).max(4000),
});

export const requestReplySchema = z.object({
  content: z.string().trim().min(10).max(4000),
});

export const sdkRequestDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("start-review") }),
  z.object({
    decision: z.literal("request-information"),
    content: z.string().trim().min(10).max(4000),
  }),
  z.object({
    decision: z.literal("proposal-ready"),
    content: z.string().trim().min(20).max(4000),
  }),
  z.object({
    decision: z.literal("reject"),
    content: z.string().trim().min(10).max(4000),
  }),
]);

export const projectConversionSchema = z.object({
  name: z.string().trim().min(3).max(255),
  description: z.string().trim().min(20).max(4000),
});

export type RequestDraftInput = z.infer<typeof requestDraftSchema>;
export type SdkRequestDecision = z.infer<typeof sdkRequestDecisionSchema>;
