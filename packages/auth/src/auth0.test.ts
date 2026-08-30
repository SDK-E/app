import { getAuth0Client } from "@platform/auth/auth0";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getServerEnv = vi.fn();
  const Auth0Client = vi.fn();
  const instance = { middleware: vi.fn(), getSession: vi.fn() };
  return { getServerEnv, Auth0Client, instance };
});

vi.mock("@platform/env", () => ({ getServerEnv: mocks.getServerEnv }));
vi.mock("@auth0/nextjs-auth0/server", () => ({ Auth0Client: mocks.Auth0Client }));

beforeEach(() => {
  mocks.getServerEnv.mockReset();
  mocks.Auth0Client.mockReset();
});

describe("getAuth0Client", () => {
  it("builds a client from the issuer and app base URL", () => {
    mocks.getServerEnv.mockReturnValue({
      AUTH0_ISSUER_BASE_URL: "https://sdk-tenant.example.auth0.com/",
      AUTH0_BASE_URL: "https://sdk.enterprises",
    });
    mocks.Auth0Client.mockImplementation(function () {
      return mocks.instance;
    });

    const client = getAuth0Client();

    expect(mocks.Auth0Client).toHaveBeenCalledWith({
      domain: "sdk-tenant.example.auth0.com",
      appBaseUrl: "https://sdk.enterprises",
    });
    expect(client).toBe(mocks.instance);
  });

  it("reuses the same client instance across calls", async () => {
    mocks.getServerEnv.mockReturnValue({
      AUTH0_ISSUER_BASE_URL: "https://tenant.auth0.example",
      AUTH0_BASE_URL: "https://sdk.enterprises",
    });
    mocks.Auth0Client.mockImplementation(function () {
      return mocks.instance;
    });
    vi.resetModules();
    const fresh = await import("@platform/auth/auth0");

    expect(fresh.getAuth0Client()).toBe(mocks.instance);
    expect(fresh.getAuth0Client()).toBe(mocks.instance);
    expect(mocks.Auth0Client).toHaveBeenCalledTimes(1);
  });
});
