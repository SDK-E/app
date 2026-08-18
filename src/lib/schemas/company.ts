import { z } from "zod";

export const companyCreationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a company name.")
    .max(255, "Keep the company name under 255 characters."),
});

export const sdkCompanyCreationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a company name.")
    .max(255, "Keep the company name under 255 characters."),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter the owner's email address.")
    .email("Enter the owner's email address."),
});
