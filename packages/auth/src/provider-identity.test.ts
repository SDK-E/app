import type { SessionData } from "@auth0/nextjs-auth0/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() }));

vi.mock("@sdk-e/db", () => ({
  getPrisma: () => ({
    user: { upsert: mocks.upsert, findUnique: mocks.findUnique, update: mocks.update },
  }),
}));

import { IdentityError, resolveAppPrincipal } from "@sdk-e/auth/identity";

function session(user: SessionData["user"]): SessionData {
  return {
    user,
    tokenSet: { accessToken: "test", expiresAt: 1 },
    internal: { sid: "test", createdAt: 1 },
  };
}

const providerUser = {
  id: "user-1",
  auth0Sub: "auth0|user-1",
  email: "person@example.test",
  name: "Person Example",
  avatarUrl: null,
  preferredLocale: "en",
  preferredTheme: "system",
  isActive: true,
  sdkStaffRole: null,
  memberships: [],
  provider: { id: "provider-1" },
};

describe("resolveAppPrincipal — provider identity", () => {
  beforeEach(() => {
    mocks.upsert.mockReset();
    mocks.findUnique.mockReset();
    mocks.update.mockReset();
  });

  it("resolves a provider principal when the User has a Provider profile", async () => {
    mocks.upsert.mockResolvedValue(providerUser);
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).resolves.toMatchObject({ kind: "provider", providerId: "provider-1" });
  });

  it("rejects a user with both a Provider profile and client memberships", async () => {
    mocks.upsert.mockResolvedValue({
      ...providerUser,
      memberships: [
        { role: "OWNER", company: { id: "company-a", name: "Company A", isActive: true } },
      ],
    });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).rejects.toBeInstanceOf(IdentityError);
  });

  it("allows a provider user to also hold an SDK staff role", async () => {
    mocks.upsert.mockResolvedValue({
      ...providerUser,
      sdkStaffRole: "ADMIN",
    });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).resolves.toMatchObject({ kind: "provider", providerId: "provider-1" });
  });

  it("refreshes email on login without overwriting the provider profile", async () => {
    mocks.upsert.mockResolvedValue({ ...providerUser, name: "New Name" });
    await resolveAppPrincipal(
      session({ sub: "auth0|user-1", email: "person@example.test", name: "New Name" })
    );

    const input = mocks.upsert.mock.calls[0][0];
    expect(input.update).toEqual({
      email: "person@example.test",
      lastLoginAt: expect.any(Date),
    });
  });
});
