import { siteConfig } from "@platform/config/site";
import { locales } from "@platform/i18n";
import { getSiteUrl } from "@platform/marketing/seo";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

interface LlmsPage {
  name: string;
  description: string;
  path: string;
}

const PAGES: LlmsPage[] = [
  {
    name: "Home",
    description: "French B2B engineering company building, modernizing and operating software.",
    path: "/",
  },
  {
    name: "Services",
    description:
      "Engineering services for software modernization, backend platforms, AI workflows, cloud infrastructure, data systems and product interfaces.",
    path: "/services",
  },
  {
    name: "Work",
    description:
      "Engineering scenarios from modernization and platform reliability to AI workflows and technical ownership.",
    path: "/work",
  },
  {
    name: "How we work",
    description: "From technical uncertainty to documented decisions and reviewable delivery.",
    path: "/how-we-work",
  },
  {
    name: "About",
    description:
      "How SDK Enterprises composes independent engineering specialists around each project.",
    path: "/about",
  },
  {
    name: "Start a project",
    description: "Tell us what you're building, modernizing, automating or fixing.",
    path: "/start-a-project",
  },
  {
    name: "Privacy policy",
    description: "How SDK Enterprises collects and processes personal data.",
    path: "/privacy",
  },
  {
    name: "Terms of use",
    description: "Terms governing use of the SDK Enterprises website and services.",
    path: "/terms",
  },
  {
    name: "Cookie policy",
    description: "How SDK Enterprises uses cookies and similar tracking technologies.",
    path: "/cookies",
  },
  {
    name: "Mentions légales",
    description: "Legal notice required under French law.",
    path: "/legal/mentions-legales",
  },
];

export async function GET() {
  const base = getSiteUrl();
  const localePath = (locale: string, path: string) =>
    path === "/" ? `${base}/${locale}/` : `${base}/${locale}${path}`;

  const body = `# ${siteConfig.name}

${siteConfig.contact.company}
${siteConfig.contact.domain}
${siteConfig.contact.email}
${siteConfig.contact.phone}

> ${siteConfig.name} is a French B2B software engineering partner. We build, modernize and operate software across the stack — backend platforms, cloud infrastructure, AI automation, realtime systems and internal tooling for regulated industries.

## Company

${siteConfig.name} is a French B2B engineering company. We build, modernize and operate software across the stack — backend platforms, cloud infrastructure, AI automation, realtime systems and internal tooling.

## Capabilities

- AI engineering: LLM integrations, agents, RAG, workflow automation, MCP
- Backend: PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs
- Frontend: React, Vue, Nuxt, TypeScript, Tailwind
- Cloud: AWS, GCP, Azure, Kubernetes, Helm, CI/CD
- Data: PostgreSQL, MySQL, MongoDB, Redis, Valkey, Elasticsearch
- Modernization: legacy migrations, technical debt reduction, performance

## Public pages (all locales: ${locales.join(", ")})

For each public page below, a machine-readable Markdown version is available at the same URL with a trailing \`.md\` (e.g. \`./en/services.md\`). This is the AI-training copy of the page content.

### Root

- [Home — en](${base}/en/) — French B2B engineering company building, modernizing and operating software. Markdown: \`./en/index.md\`

### Localized pages

${PAGES.map((page) =>
  locales
    .map(
      (locale) =>
        `- [${page.name} — ${locale}](${localePath(locale, page.path)}) — ${page.description} Markdown: \`./${locale}${page.path === "/" ? "/index" : page.path}.md\``,
    )
    .join("\n"),
).join("\n\n")}

## Private areas

The site includes a private client portal at \`/[locale]/app/\` and authentication callbacks at \`/[locale]/auth/\`. These areas are not indexed, not listed in public sitemaps, and not available in Markdown.

## Indexing

This site publishes a \`/robots.txt\` with Content-Signals declaring \`ai-train=allow\`, \`search=yes\`, \`ai-input=allow\`, and an XML sitemap at \`/sitemap.xml\`.`;

  return new NextResponse(body, {
    headers: {
      ["Content-Type"]: "text/markdown; charset=utf-8",
      ["Cache-Control"]: "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
