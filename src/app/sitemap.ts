import { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "@/lib/seo";

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/work",
  "/how-we-work",
  "/about",
  "/start-a-project",
  "/service-providers",
  "/privacy",
  "/terms",
  "/cookies",
  "/legal/mentions-legales",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const translatedLocales = ["en", "fr"];
  const otherLocales = locales.filter((locale) => !translatedLocales.includes(locale));

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of translatedLocales) {
    for (const path of PUBLIC_PATHS) {
      const localePath = `/${locale}${path === "/" ? "/" : path}`;
      entries.push({
        url: `${base}${localePath}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: path === "/" ? 1 : 0.7,
        alternates: {
          languages: {
            en: `${base}/en${path === "/" ? "/" : path}`,
            fr: `${base}/fr${path === "/" ? "/" : path}`,
          },
        },
      });
    }
  }

  for (const locale of otherLocales) {
    entries.push({
      url: `${base}/${locale}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          "x-default": `${base}/en/`,
        },
      },
    });
  }

  return entries;
}
