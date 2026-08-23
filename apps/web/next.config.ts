import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Env files live at the workspace root; replicate @next/env precedence
// (.env.local wins over .env) for builds running from apps/web.
loadEnv({ path: "../../.env" });
loadEnv({ path: "../../.env.local", override: true });

const withNextIntl = createNextIntlPlugin("../../packages/i18n/src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  output: process.env.VERCEL ? undefined : "standalone",
  transpilePackages: [
    "@sdk-e/types",
    "@sdk-e/config",
    "@sdk-e/env",
    "@sdk-e/db",
    "@sdk-e/core",
    "@sdk-e/i18n",
    "@sdk-e/auth",
    "@sdk-e/schemas",
    "@sdk-e/users",
    "@sdk-e/companies",
    "@sdk-e/email",
    "@sdk-e/marketing",
    "@sdk-e/payments",
    "@sdk-e/notifications",
    "@sdk-e/providers",
    "@sdk-e/requests",
    "@sdk-e/opportunities",
    "@sdk-e/matching",
    "@sdk-e/ui",
    "@sdk-e/design-system",
    "@sdk-e/portal-shell",
    "@sdk-e/portal-staff",
    "@sdk-e/portal-companies",
    "@sdk-e/portal-providers",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s.gravatar.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "cdn.auth0.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
