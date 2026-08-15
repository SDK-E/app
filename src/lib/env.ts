import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid database connection URL"),
  AUTH0_SECRET: z.string().min(32, "AUTH0_SECRET must be at least 32 characters"),
  AUTH0_ISSUER_BASE_URL: z.string().url("AUTH0_ISSUER_BASE_URL must be a valid Auth0 issuer URL"),
  AUTH0_BASE_URL: z.string().url("AUTH0_BASE_URL must be a valid application base URL"),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type PublicEnv = Pick<ServerEnv, "AUTH0_CLIENT_ID">;

function buildErrorMessage(error: z.ZodError): string {
  return error.issues
    .map(issue => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const prefix =
      process.env.NODE_ENV === "production"
        ? "Missing or invalid required environment variables in production:\n"
        : "Missing or invalid environment variables:\n";
    throw new Error(`${prefix}${buildErrorMessage(result.error)}`);
  }

  return result.data;
}

export const serverEnv = validateServerEnv();

export const publicEnv: PublicEnv = {
  AUTH0_CLIENT_ID: serverEnv.AUTH0_CLIENT_ID,
};
