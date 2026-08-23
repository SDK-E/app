import { NextResponse } from "next/server";
import { getSiteUrl } from "@sdk-e/marketing/seo";
import { siteConfig } from "@sdk-e/config/site";

export const dynamic = "force-static";

export async function GET() {
  const base = getSiteUrl();

  const body = `# ${siteConfig.name}

${siteConfig.contact.company}  
${siteConfig.contact.domain}  
${siteConfig.contact.email}  
${siteConfig.contact.phone}

## Company

${siteConfig.name} is a French B2B engineering company. We build, modernize and operate software across the stack — backend platforms, cloud infrastructure, AI automation, realtime systems and internal tooling.

## Capabilities

- AI engineering: LLM integrations, agents, RAG, workflow automation
- Backend: PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs
- Frontend: React, Vue, Nuxt, TypeScript, Tailwind
- Cloud: AWS, GCP, Azure, Kubernetes, Helm, CI/CD
- Data: PostgreSQL, MySQL, MongoDB, Redis, Valkey, Elasticsearch
- Modernization: legacy migrations, technical debt reduction, performance

## Public pages

- [Home](${base}/)
- [Privacy](${base}/privacy)
- [Terms](${base}/terms)
- [Cookies](${base}/cookies)
- [Mentions légales](${base}/legal/mentions-legales)

## Private areas

The site includes a private client portal at /app/* and authentication callbacks at /auth/*. These areas are not indexed or listed in public sitemaps.`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
