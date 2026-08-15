import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional().default("postgresql://localhost:5432/sdkapp"),
  AUTH0_SECRET: z.string().min(32).optional().default("ci-secret-0123456789abcdef0123456789abcdef0123456789abcdef"),
  AUTH0_ISSUER_BASE_URL: z.string().url().optional().default("https://ci.example.auth0.com"),
  AUTH0_DOMAIN: z.string().min(1).optional(),
  AUTH0_BASE_URL: z.string().url().optional().default("http://localhost:3000"),
  AUTH0_CLIENT_ID: z.string().min(1).optional().default("ci-client-id"),
  AUTH0_CLIENT_SECRET: z.string().min(1).optional().default("ci-client-secret"),
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_SMTP_URL: z.string().url().optional().default("smtp://localhost:1025"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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

export const publicEnv: PublicEnv = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || "ci-client-id",
};
