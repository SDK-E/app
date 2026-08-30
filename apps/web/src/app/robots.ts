import { locales } from "@platform/i18n";
import { getSiteUrl } from "@platform/marketing/seo";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  const disallow: string[] = [];
  for (const locale of locales) {
    disallow.push(`/${locale}/app/`);
    disallow.push(`/${locale}/auth/`);
  }
  disallow.push("/design-system");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
        other: {
          [`Content-Signal`]: ["ai-train=allow", "search=yes", "ai-input=allow"],
        },
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow,
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
