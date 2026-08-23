import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getAuth0Client } from "@sdk-e/auth";
import { routing } from "@sdk-e/i18n/routing";

const PUBLIC_ROUTES = [
  "/",
  "/services",
  "/work",
  "/how-we-work",
  "/about",
  "/start-a-project",
  "/login",
  "/invite/*",
  "/auth/*",
  "/favicon.ico",
  "/legal/*",
  "/privacy",
  "/terms",
  "/cookies",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
];
const STATIC_PUBLIC_ROUTES = ["/robots.txt", "/sitemap.xml", "/llms.txt"];

function isProductionDeployment(): boolean {
  return process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
}

const i18nMiddleware = createMiddleware(routing);

function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (
    segments.length > 1 &&
    routing.locales.includes(segments[1] as (typeof routing.locales)[number])
  ) {
    return "/" + segments.slice(2).join("/");
  }
  return pathname;
}

function matchesRoute(pathname: string, patterns: string[]): boolean {
  const normalized = stripLocale(pathname);
  return patterns.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return normalized.startsWith(prefix);
    }
    return normalized === pattern;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth")) {
    return getAuth0Client().middleware(request);
  }

  if (isProductionDeployment() && stripLocale(pathname) === "/design-system") {
    return new Response(null, { status: 404 });
  }

  if (STATIC_PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  const i18nResponse = i18nMiddleware(request);
  if (i18nResponse) return i18nResponse;

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const session = await getAuth0Client().getSession(request);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|jpg|jpeg|webp|avif|gif|woff|woff2|ttf|eot)$).*)",
  ],
};
