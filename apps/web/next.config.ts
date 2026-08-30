import type { NextConfig } from "next";

import { config as loadEnv } from "dotenv";
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
    "@platform/types",
    "@platform/config",
    "@platform/env",
    "@platform/db",
    "@platform/core",
    "@platform/i18n",
    "@platform/auth",
    "@platform/schemas",
    "@platform/users",
    "@platform/companies",
    "@platform/email",
    "@platform/marketing",
    "@platform/payments",
    "@platform/notifications",
    "@platform/providers",
    "@platform/requests",
    "@platform/opportunities",
    "@platform/matching",
    "@platform/ui",
    "@platform/design-system",
    "@platform/portal-shell",
    "@platform/portal-staff",
    "@platform/portal-companies",
    "@platform/portal-providers",
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
