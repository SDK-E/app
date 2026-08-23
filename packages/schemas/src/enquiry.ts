import { z } from "zod";

export const enquirySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(255),
  email: z.string().email("Enter a valid email address").max(255),
  website: z.string().url("Enter a valid URL").max(1024).optional().or(z.literal("")),
  capability: z.string().min(1, "Select a capability").max(255),
  description: z.string().min(50, "Description must be at least 50 characters").max(4000),
  environment: z.string().max(4000).optional().or(z.literal("")),
  timeline: z.string().max(255).optional().or(z.literal("")),
  budgetRange: z.string().max(255).optional().or(z.literal("")),
  context: z.string().max(4000).optional().or(z.literal("")),
  honeypot: z.string().max(0, ""),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
