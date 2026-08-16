import type { SessionData } from "@auth0/nextjs-auth0/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock("@/lib/db", () => ({ prisma: { user: { upsert: mocks.upsert } } }));

import { IdentityError, resolveAppPrincipal } from "@/lib/identity";

function session(user: SessionData["user"]): SessionData {
  return { user, tokenSet: { accessToken: "test", expiresAt: 1 }, internal: { sid: "test", createdAt: 1 } };
}

const localUser = {
  id: "user-1",
  auth0Sub: "auth0|user-1",
  email: "person@example.test",
  name: "Person Example",
  avatarUrl: null,
  isActive: true,
  sdkStaffRole: null,
  memberships: [],
};

describe("resolveAppPrincipal", () => {
  beforeEach(() => mocks.upsert.mockReset());

  it("resolves by Auth0 sub and creates an unassigned local identity", async () => {
    mocks.upsert.mockResolvedValue(localUser);
    const principal = await resolveAppPrincipal(
      session({ sub: "auth0|user-1", email: "person@example.test", name: "Person Example" })
    );

    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { auth0Sub: "auth0|user-1" } })
    );
    expect(principal.kind).toBe("unassigned");
  });

  it("refreshes profile fields without looking up a user by email", async () => {
    mocks.upsert.mockResolvedValue({ ...localUser, name: "Updated Name" });
    await resolveAppPrincipal(
      session({ sub: "auth0|user-1", email: "person@example.test", name: "Updated Name" })
    );

    const input = mocks.upsert.mock.calls[0][0];
    expect(input.where).toEqual({ auth0Sub: "auth0|user-1" });
    expect(input.update).toEqual(expect.objectContaining({ name: "Updated Name" }));
  });

  it("resolves a company membership", async () => {
    mocks.upsert.mockResolvedValue({
      ...localUser,
      memberships: [{ role: "OWNER", company: { id: "company-a", name: "Company A", isActive: true } }],
    });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).resolves.toMatchObject({ kind: "client", companyId: "company-a", role: "OWNER" });
  });

  it("resolves SDK staff separately from client memberships", async () => {
    mocks.upsert.mockResolvedValue({ ...localUser, sdkStaffRole: "DELIVERY" });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).resolves.toMatchObject({ kind: "sdk-staff", role: "DELIVERY" });
  });

  it("rejects inactive and dual-category identities", async () => {
    mocks.upsert.mockResolvedValueOnce({ ...localUser, isActive: false });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).rejects.toMatchObject({ code: "INACTIVE_USER" });

    mocks.upsert.mockResolvedValueOnce({
      ...localUser,
      sdkStaffRole: "ADMIN",
      memberships: [{ role: "OWNER", company: { id: "company-a", name: "Company A", isActive: true } }],
    });
    await expect(
      resolveAppPrincipal(session({ sub: "auth0|user-1", email: "person@example.test" }))
    ).rejects.toBeInstanceOf(IdentityError);
  });

  it("rejects malformed Auth0 identities before database access", async () => {
    await expect(resolveAppPrincipal(session({ sub: "auth0|missing-email" }))).rejects.toMatchObject({
      code: "INVALID_IDENTITY",
    });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
