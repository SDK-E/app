import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { proxy } from "@/proxy";

const mocks = vi.hoisted(() => {
  const i18nMiddleware = vi.fn();
  const createMiddleware = vi.fn(() => i18nMiddleware);
  const auth0 = { middleware: vi.fn(), getSession: vi.fn() };
  const getAuth0Client = vi.fn();
  const nextResponse = {
    next: vi.fn(() => ({ sentinel: "next" })),
    redirect: vi.fn((url: unknown) => ({ sentinel: "redirect", url: String(url) })),
  };
  return { i18nMiddleware, createMiddleware, auth0, getAuth0Client, nextResponse };
});

vi.mock("next-intl/middleware", () => ({ default: mocks.createMiddleware }));
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: mocks.nextResponse,
}));
vi.mock("@/lib/auth", () => ({ getAuth0Client: mocks.getAuth0Client }));

function makeRequest(pathname: string): NextRequest {
  return {
    url: `https://sdk.enterprises${pathname}`,
    nextUrl: { pathname },
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.i18nMiddleware.mockReset();
  mocks.getAuth0Client.mockReturnValue(mocks.auth0);
});

describe("proxy", () => {
  it("hands Auth0 routes to the Auth0 middleware", async () => {
    const request = makeRequest("/auth/login");
    mocks.auth0.middleware.mockReturnValue({ sentinel: "auth0" });

    await expect(proxy(request)).resolves.toEqual({ sentinel: "auth0" });

    expect(mocks.getAuth0Client).toHaveBeenCalled();
    expect(mocks.auth0.middleware).toHaveBeenCalledWith(request);
    expect(mocks.i18nMiddleware).not.toHaveBeenCalled();
  });

  it("passes static public routes straight through", async () => {
    await expect(proxy(makeRequest("/robots.txt"))).resolves.toEqual({ sentinel: "next" });

    expect(mocks.nextResponse.next).toHaveBeenCalled();
    expect(mocks.i18nMiddleware).not.toHaveBeenCalled();
    expect(mocks.auth0.getSession).not.toHaveBeenCalled();
  });

  it("returns early when the i18n middleware answers", async () => {
    const response = { sentinel: "i18n" };
    mocks.i18nMiddleware.mockReturnValue(response);

    await expect(proxy(makeRequest("/services"))).resolves.toBe(response);

    expect(mocks.nextResponse.next).not.toHaveBeenCalled();
  });

  it("lets visitors without a session reach public routes", async () => {
    await expect(proxy(makeRequest("/en/start-a-project"))).resolves.toEqual({ sentinel: "next" });

    expect(mocks.nextResponse.next).toHaveBeenCalled();
    expect(mocks.auth0.getSession).not.toHaveBeenCalled();
  });

  it("redirects to login when a private route has no session", async () => {
    mocks.auth0.getSession.mockResolvedValue(null);

    const result = await proxy(makeRequest("/en/app"));

    expect(result).toMatchObject({ sentinel: "redirect" });
    expect(mocks.nextResponse.redirect).toHaveBeenCalledTimes(1);
    const loginUrl = new URL(mocks.nextResponse.redirect.mock.calls[0][0] as string);
    expect(loginUrl.pathname).toBe("/auth/login");
    expect(loginUrl.searchParams.get("returnTo")).toBe("https://sdk.enterprises/en/app");
  });

  it("serves private routes once a session exists", async () => {
    mocks.auth0.getSession.mockResolvedValue({ user: { sub: "auth0|1" } });

    await expect(proxy(makeRequest("/en/app"))).resolves.toEqual({ sentinel: "next" });

    expect(mocks.nextResponse.next).toHaveBeenCalled();
    expect(mocks.nextResponse.redirect).not.toHaveBeenCalled();
  });

  it("treats unknown locales as private paths", async () => {
    mocks.auth0.getSession.mockResolvedValue(null);

    await expect(proxy(makeRequest("/xx/services"))).resolves.toMatchObject({
      sentinel: "redirect",
    });
  });
});
