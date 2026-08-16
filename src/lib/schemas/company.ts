import { z } from "zod";

export const companyCreationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a company name.")
    .max(255, "Keep the company name under 255 characters."),
});
