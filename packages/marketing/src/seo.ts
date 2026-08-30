import type { Metadata } from "next";

import { siteConfig } from "@platform/config/site";
import { locales } from "@platform/i18n";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

export function getSiteUrl(): string {
  return `https://${siteConfig.contact.domain}`;
}

export function getSocialGithubUrl(): string {
  return process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL || "";
}

export function getSocialLinkedInUrl(): string {
  return process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL || "";
}

/** BCP-47 locale tag used in OpenGraph `locale` (e.g. `en_US`, `fr_FR`). */
export function ogLocale(locale: string): string {
  const [lang, region] = locale.split("-");
  if (region) return `${lang}_${region.toUpperCase()}`;
  const regional = (
    {
      en: "US",
      fr: "FR",
      de: "DE",
      es: "ES",
      pt: "PT",
      it: "IT",
      nl: "NL",
      sv: "SE",
      no: "NO",
      da: "DK",
      fi: "FI",
      pl: "PL",
      cs: "CZ",
      hu: "HU",
      ro: "RO",
      bg: "BG",
      el: "GR",
    } as Record<string, string>
  )[locale];
  return regional ? `${lang}_${regional}` : lang;
}

const ogImagePath = "/brand/sdk-thumbnail-light.png";
const twitterImagePath = "/brand/sdk-thumbnail-light.png";

export const defaultOg: Metadata["openGraph"] = {
  siteName: siteConfig.name,
  images: [{ url: absoluteUrl(ogImagePath), width: 1200, height: 628 }],
  locale: ogLocale("en"),
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

/** `AboutPage` for the /about page. */
export function aboutPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: siteConfig.name,
    url: absoluteUrl("/about"),
    description:
      "SDK Enterprises is a French B2B software engineering partner for regulated industries.",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}

export function breadcrumbListJsonLd(
  items: { name: string; url: string }[],
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

  const canonicalPath = `/${locale}${path === "/" ? "/" : path}`;

  const languages: NonNullable<Metadata["alternates"]>["languages"] = {};
  for (const l of locales) {
    languages[l] = localizeHref(l, path);
  }
  languages["x-default"] = localizeHref("en", path);

  const metadata: Metadata = {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      ...alternates,
      languages: {
        ...languages,
        ...alternates?.languages,
      },
    },
    openGraph: {
      ...defaultOg,
      title,
      description,
      locale: ogLocale(locale),
      url: absoluteUrl(canonicalPath),
      ...(alternates?.canonical && { url: absoluteUrl(canonicalPath) }),
    },
    twitter: {
      ...defaultTwitter,
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : robots || defaultRobots,
  };

  return metadata;
}

/** `ContactPage` for the /start-a-project page. */
export function contactPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Start a project",
    url: absoluteUrl("/start-a-project"),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  const sameAs = [getSocialLinkedInUrl(), getSocialGithubUrl()].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/sdk-mark-light.png"),
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer service",
    },
  };
}

/** `ProfessionalService` + `BreadcrumbList` for the /services page. */
export function professionalServiceJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    image: absoluteUrl(ogImagePath),
    logo: absoluteUrl("/brand/sdk-mark-light.png"),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "44 Rue Pasquier",
      addressLocality: "Paris",
      postalCode: "75008",
      addressCountry: "FR",
    },
    areaServed: "Europe",
    availableLanguage: [...locales],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description:
      "SDK Enterprises is a French B2B software engineering partner building, modernizing and operating software across the stack for regulated industries.",
    inLanguage: [...locales],
  };
}

function localizeHref(locale: string, path: string): string {
  return absoluteUrl(`/${locale}${path === "/" ? "/" : path}`);
}
