import { locales } from "@platform/i18n";
import { getSiteUrl } from "@platform/marketing/seo";
import { MetadataRoute } from "next";

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/work",
  "/how-we-work",
  "/about",
  "/start-a-project",
  "/privacy",
  "/terms",
  "/cookies",
  "/legal/mentions-legales",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_PATHS) {
    const localePath = (locale: string) => `/${locale}${path === "/" ? "/" : path}`;

    const languages: Record<string, string> = {};
    for (const l of locales) {
      languages[l] = `${base}${localePath(l)}`;
    }
    languages["x-default"] = `${base}${localePath("en")}`;

    for (const locale of locales) {
      entries.push({
        url: `${base}${localePath(locale)}`,
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
