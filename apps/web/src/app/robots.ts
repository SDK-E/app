import { MetadataRoute } from "next";
import { getSiteUrl } from "@sdk-e/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/auth/", "/design-system"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
