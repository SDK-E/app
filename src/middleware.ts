import { auth0 } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types";

const PUBLIC_ROUTES = ["/login", "/api/auth/*", "/favicon.ico"];
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const session = await auth0.getSession(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
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
  matcher: ["/((?!_next/static|_next/image).*)"],
};
