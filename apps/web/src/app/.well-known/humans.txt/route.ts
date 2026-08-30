import { siteConfig } from "@platform/config/site";
import { getSiteUrl } from "@platform/marketing/seo";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "/* Team */",
    "Editor: " + siteConfig.contact.company,
    "Email: " + siteConfig.contact.email,
    "",
    "/* Studio */",
    "Site: " + getSiteUrl(),
    "Company: " + siteConfig.contact.company,
    "Address: " + siteConfig.contact.address,
    "Phone: " + siteConfig.contact.phone,
    "",
    "/* About */",
    "SDK Enterprises is a French B2B software engineering partner.",
    "We design, build, modernize and operate software across the stack",
    "for regulated industries.",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      ["Content-Type"]: "text/plain; charset=utf-8",
      ["Cache-Control"]: "public, max-age=3600, stale-while-revalidate=86400",
      ["Content-Disposition"]: 'inline; filename="humans.txt"',
    },
  });
}
