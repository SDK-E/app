import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s.gravatar.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "cdn.auth0.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
