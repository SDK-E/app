import { NextRequest, NextResponse } from "next/server";
import { getAuth0Client } from "@/lib/auth";
import type { UserRole } from "@/types";

const PUBLIC_ROUTES = ["/", "/login", "/auth/*", "/favicon.ico", "/design-system"];
const ADMIN_ROUTES = ["/app/admin/*"];

function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    return pathname === pattern;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth")) {
    return getAuth0Client().middleware(request);
  }

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const session = await getAuth0Client().getSession(request);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    const userRole = (session.user as unknown as { role?: UserRole })?.role;
    if (userRole !== "owner" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|jpg|jpeg|webp|avif|gif|woff|woff2|ttf|eot)$).*)",
  ],
};
