import { siteConfig } from "@platform/config/site";
import { locales } from "@platform/i18n";
import { getSiteUrl } from "@platform/marketing/seo";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const runtime = "nodejs";

interface PageLink {
  slug: string;
  titleKey: string;
  descKey: string;
}

const MARKETING_PAGES: PageLink[] = [
  { slug: "/services", titleKey: "servicesTitle", descKey: "servicesDescription" },
  { slug: "/work", titleKey: "workTitle", descKey: "workDescription" },
  { slug: "/how-we-work", titleKey: "howWeWorkTitle", descKey: "howWeWorkDescription" },
  { slug: "/about", titleKey: "aboutTitle", descKey: "aboutDescription" },
  {
    slug: "/start-a-project",
    titleKey: "startAProjectTitle",
    descKey: "startAProjectDescription",
  },
];

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = getSiteUrl();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tEn = await getTranslations({ locale: "en", namespace: "meta" });

  const title = t("title");
  const description = t("siteDescription");

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> ${description}`);
  lines.push("");
  lines.push(`**${siteConfig.contact.company}** · ${siteConfig.contact.domain}`);
  lines.push("");
  lines.push(
    "We build, modernize and operate software across the stack — backend platforms, cloud infrastructure, AI automation, realtime systems and internal tooling for regulated industries.",
  );
  lines.push("");

  lines.push("## Capabilities");
  lines.push("");
  lines.push("- AI engineering: LLM integrations, agents, RAG, workflow automation");
  lines.push("- Backend: PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs");
  lines.push("- Frontend: React, Vue, Nuxt, TypeScript, Tailwind");
  lines.push("- Cloud: AWS, GCP, Azure, Kubernetes, Helm, CI/CD");
  lines.push("- Data: PostgreSQL, MySQL, MongoDB, Redis, Valkey, Elasticsearch");
  lines.push("- Modernization: legacy migrations, technical debt reduction, performance");
  lines.push("");

  lines.push("## Public pages");
  lines.push("");
  lines.push(`- [Home](${base}/${locale}/) — ${description}`);
  lines.push("");

  for (const page of MARKETING_PAGES) {
    const pageTitle = t(page.titleKey) || tEn(page.titleKey);
    const pageDesc = t(page.descKey) || tEn(page.descKey);
    lines.push(`- [${pageTitle}](${base}/${locale}${page.slug}) — ${pageDesc}`);
  }

  const legalPages = [
    { slug: "/privacy", title: tEn("privacyTitle"), desc: tEn("privacyDescription") },
    { slug: "/terms", title: tEn("termsTitle"), desc: tEn("termsDescription") },
    { slug: "/cookies", title: tEn("cookiesTitle"), desc: tEn("cookiesDescription") },
  ];
  for (const page of legalPages) {
    lines.push(`- [${page.title}](${base}/${locale}${page.slug}) — ${page.desc}`);
  }
  lines.push("");

  lines.push("## Localized versions");
  lines.push("");
  for (const l of locales) {
    lines.push(`- [${l}](${base}/${l}/)`);
  }
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push(`- Email: ${siteConfig.contact.email}`);
  if (siteConfig.contact.phone) lines.push(`- Phone: ${siteConfig.contact.phone}`);
  lines.push("");

  const body = lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      Link: `<${base}/${locale}/>; rel="canonical"; hreflang="${locale}"`,
    },
  });
}
