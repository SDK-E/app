import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH0_SECRET: z.string().min(1),
  AUTH0_ISSUER_BASE_URL: z.string().url(),
  AUTH0_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = envSchema.parse(process.env);
