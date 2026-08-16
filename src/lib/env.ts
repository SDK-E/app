import { z } from "zod";

export function normalizePostgresSslMode(connectionString: string): string {
  return connectionString.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid database connection URL")
    .transform(normalizePostgresSslMode),
  AUTH0_SECRET: z.string().min(32, "AUTH0_SECRET must be at least 32 characters"),
  AUTH0_ISSUER_BASE_URL: z.string().url("AUTH0_ISSUER_BASE_URL must be a valid Auth0 issuer URL").optional(),
  AUTH0_DOMAIN: z.string().min(1, "AUTH0_DOMAIN must be a non-empty string").optional(),
  AUTH0_BASE_URL: z.string().url("AUTH0_BASE_URL must be a valid application base URL").optional(),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY must be a non-empty string").optional(),
  MAIL_SMTP_URL: z.string().url("MAIL_SMTP_URL must be a valid URL").optional(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

function buildErrorMessage(error: z.ZodError): string {
  return error.issues
    .map(issue => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(buildErrorMessage(result.error));
  }

  let env = result.data;

  if (!env.AUTH0_ISSUER_BASE_URL && env.AUTH0_DOMAIN) {
    env = {
      ...env,
      AUTH0_ISSUER_BASE_URL: `https://${env.AUTH0_DOMAIN}`,
    };
  }

  if (!env.AUTH0_ISSUER_BASE_URL) {
    throw new Error("AUTH0_ISSUER_BASE_URL or AUTH0_DOMAIN is required");
  }

  return env;
}

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = validateServerEnv();
  }
  return cachedEnv;
}
