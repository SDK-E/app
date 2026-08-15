import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
