import { siteConfig } from "@platform/config/site";
import { getSiteUrl } from "@platform/marketing/seo";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "Contact: mailto:" + siteConfig.contact.email,
    "Expires: 2027-12-31T23:59:59.000Z",
    "Preferred-Languages: en, fr, de, es, pt, it, nl, sv, no, da, fi, pl, cs, hu, ro, bg, el",
    "Canonical: " + getSiteUrl() + "/",
    "Policy: " + getSiteUrl() + "/privacy",
    "Source: " + getSiteUrl() + "/about",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      ["Content-Type"]: "text/plain; charset=utf-8",
      ["Cache-Control"]: "public, max-age=3600, stale-while-revalidate=86400",
      ["Content-Disposition"]: 'inline; filename="security.txt"',
    },
  });
}
