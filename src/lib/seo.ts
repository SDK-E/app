import { getServerEnv } from "@/lib/env";
import { siteConfig } from "@/lib/siteConfig";
import type { Metadata } from "next";

export function getSiteUrl(): string {
  const env = getServerEnv();
  if (env.AUTH0_BASE_URL) {
    return env.AUTH0_BASE_URL.replace(/\/$/, "");
  }
  return `https://${siteConfig.contact.domain}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

const ogImagePath = "/brand/sdk-thumbnail-light.png";
const twitterImagePath = "/brand/sdk-thumbnail-light.png";

export const defaultOg: Metadata["openGraph"] = {
  siteName: siteConfig.name,
  images: [{ url: absoluteUrl(ogImagePath), width: 1200, height: 628 }],
  locale: "en_US",
  type: "website",
};

export const defaultTwitter: Metadata["twitter"] = {
  card: "summary_large_image",
  title: siteConfig.name,
  description: "",
  images: [absoluteUrl(twitterImagePath)],
};

export const defaultRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
};

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/sdk-mark-light.png"),
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer service",
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: "",
    inLanguage: ["en", "fr"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbListJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function jsonLdScriptTag(): Metadata["metadataBase"] {
  return undefined;
}

export function buildMetadata(params: {
  title?: string;
  description?: string;
  path?: string;
  locale?: string;
  noIndex?: boolean;
  robots?: Metadata["robots"];
  alternates?: Metadata["alternates"];
}): Metadata {
  const { title, description, path = "/", locale = "en", noIndex, robots, alternates } = params;

  const metadata: Metadata = {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}${path === "/" ? "" : path}`),
      languages: {
        en: absoluteUrl("/en" + (path === "/" ? "" : path)),
        fr: absoluteUrl("/fr" + (path === "/" ? "" : path)),
        ...alternates?.languages,
      },
      ...alternates,
    },
    openGraph: {
      ...defaultOg,
      title,
      description,
      url: absoluteUrl(`/${locale}${path === "/" ? "" : path}`),
      ...alternates?.canonical && { url: absoluteUrl(`/${locale}${path === "/" ? "" : path}`) },
    },
    twitter: {
      ...defaultTwitter,
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : robots || defaultRobots,
  };

  return metadata;
}
