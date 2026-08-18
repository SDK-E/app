import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  breadcrumbListJsonLd,
  buildMetadata,
  defaultRobots,
  getSiteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/marketing/seo";

describe("URL helpers", () => {
  it("exposes the site URL from the contact domain", () => {
    expect(getSiteUrl()).toBe("https://sdk.enterprises");
  });

  it("builds absolute URLs with and without a leading slash", () => {
    expect(absoluteUrl("/services")).toBe("https://sdk.enterprises/services");
    expect(absoluteUrl("services")).toBe("https://sdk.enterprises/services");
  });
});

describe("buildMetadata", () => {
  it("sets canonical and hreflang alternates for the requested locale", () => {
    const metadata = buildMetadata({
      title: "Services",
      description: "What we do",
      path: "/services",
    });

    expect(metadata.title).toBe("Services");
    expect(metadata.description).toBe("What we do");
    expect(metadata.alternates).toEqual({
      canonical: "https://sdk.enterprises/en/services",
      languages: {
        en: "https://sdk.enterprises/en/services",
        fr: "https://sdk.enterprises/fr/services",
      },
    });
  });

  it("routes the root path through the locale prefix", () => {
    const metadata = buildMetadata({ path: "/", locale: "fr" });

    expect(metadata.alternates?.canonical).toBe("https://sdk.enterprises/fr/");
    expect(metadata.openGraph?.url).toBe("https://sdk.enterprises/fr/");
  });

  it("drops crawl visibility when noIndex is requested", () => {
    const metadata = buildMetadata({ noIndex: true });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("merges custom hreflang languages with the locale defaults", () => {
    const metadata = buildMetadata({
      robots: { index: false, follow: true },
      alternates: { languages: { de: "https://sdk.enterprises/de" } },
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.languages).toEqual({
      en: "https://sdk.enterprises/en/",
      fr: "https://sdk.enterprises/fr/",
      de: "https://sdk.enterprises/de",
    });
  });

  it("allows callers to override the canonical URL", () => {
    const metadata = buildMetadata({
      alternates: { canonical: "https://sdk.enterprises/en/services/" },
    });

    expect(metadata.alternates?.canonical).toBe("https://sdk.enterprises/en/services/");
    expect(metadata.alternates?.languages).toEqual({
      en: "https://sdk.enterprises/en/",
      fr: "https://sdk.enterprises/fr/",
    });
  });
});

describe("structured data", () => {
  it("publishes the organization JSON-LD", () => {
    expect(organizationJsonLd()).toMatchObject({
      "@type": "Organization",
      name: "SDK Enterprises",
      url: "https://sdk.enterprises",
      logo: "https://sdk.enterprises/brand/sdk-mark-light.png",
      contactPoint: { email: "hello@sdk.enterprises" },
    });
  });

  it("publishes the website JSON-LD with supported languages", () => {
    expect(websiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      inLanguage: ["en", "fr"],
    });
  });

  it("numbers breadcrumbs from one and absolutizes item URLs", () => {
    expect(
      breadcrumbListJsonLd([
        { name: "Home", url: "/" },
        { name: "Work", url: "/work" },
      ])
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sdk.enterprises/" },
        { "@type": "ListItem", position: 2, name: "Work", item: "https://sdk.enterprises/work" },
      ],
    });
  });
});

describe("defaults", () => {
  it("keeps the default robots crawlable", () => {
    expect(defaultRobots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });
  });
});
