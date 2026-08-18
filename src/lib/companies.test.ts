import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCompanySlug, createSdkCompany, generateAccessCode } from "@/lib/companies";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const company = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const invitation = { findFirst: vi.fn(), create: vi.fn() };
  const user = { findFirst: vi.fn() };
  const transaction = { company, invitation, user };
  const prisma = {
    company,
    invitation,
    user,
    $transaction: vi.fn((callback) => callback(transaction)),
  };
  return { prisma, company, invitation, user, transaction };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("buildCompanySlug", () => {
  it("creates a stable readable prefix with a uniqueness suffix", () => {
    expect(buildCompanySlug("SDK & Partners", "a1b2c3")).toBe("sdk-partners-a1b2c3");
  });

  it("falls back safely when the name has no slug characters", () => {
    expect(buildCompanySlug("東京", "a1b2c3")).toBe("company-a1b2c3");
  });
});

describe("generateAccessCode", () => {
  it("produces an 8-character XXXX-XXXX uppercase code", () => {
    expect(generateAccessCode()).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("produces distinct codes across calls", () => {
    expect(generateAccessCode()).not.toBe(generateAccessCode());
  });
});

describe("createSdkCompany", () => {
  it("creates an active company and an OWNER invitation in one transaction", async () => {
    mocks.user.findFirst.mockResolvedValue(null);
    mocks.invitation.findFirst.mockResolvedValue(null);
    mocks.company.create.mockImplementation(async ({ data }) => ({ id: "company-9", ...data }));
    mocks.invitation.create.mockImplementation(async ({ data }) => ({ id: "inv-9", ...data }));

    const result = await createSdkCompany(principal("sdk-admin"), {
      name: "Acme Ltd",
      ownerEmail: "Owner@Example.com",
    });

    expect(mocks.company.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Acme Ltd",
        slug: expect.stringMatching(/^acme-ltd-[0-9a-f]{6}$/),
        accessCode: expect.stringMatching(/^[0-9A-F]{4}-[0-9A-F]{4}$/),
      }),
    });
    expect(mocks.invitation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "owner@example.com",
        kind: "CLIENT",
        companyId: "company-9",
        clientRole: "OWNER",
        invitedBy: "user-1",
        expiresAt: expect.any(Date),
      }),
      include: { company: true },
    });
    expect(result.company.name).toBe("Acme Ltd");
    expect(result.invitation.clientRole).toBe("OWNER");
    expect(result.token).toBeTruthy();
  });

  it("rejects delivery staff without company creation permission", async () => {
    await expect(
      createSdkCompany(principal("delivery"), {
        name: "Acme Ltd",
        ownerEmail: "owner@example.com",
      })
    ).rejects.toThrow("Missing permission: company:create");
    expect(mocks.company.create).not.toHaveBeenCalled();
  });

  it("rejects client principals", async () => {
    await expect(
      createSdkCompany(principal("owner"), {
        name: "Acme Ltd",
        ownerEmail: "owner@example.com",
      })
    ).rejects.toThrow("Missing permission: company:create");
  });

  it("rejects an owner email already assigned to a company", async () => {
    mocks.user.findFirst.mockResolvedValue({
      id: "user-9",
      sdkStaffRole: null,
      memberships: [{ id: "m1" }],
    });

    await expect(
      createSdkCompany(principal("sdk-admin"), {
        name: "Acme Ltd",
        ownerEmail: "member@example.com",
      })
    ).rejects.toThrow("already belongs to a company");
    expect(mocks.company.create).not.toHaveBeenCalled();
  });

  it("rejects an SDK staff email as owner", async () => {
    mocks.user.findFirst.mockResolvedValue({
      id: "user-9",
      sdkStaffRole: "ADMIN",
      memberships: [],
    });

    await expect(
      createSdkCompany(principal("sdk-admin"), {
        name: "Acme Ltd",
        ownerEmail: "staff@example.com",
      })
    ).rejects.toThrow("SDK staff accounts cannot become company owners.");
    expect(mocks.company.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate pending owner invitation for the email", async () => {
    mocks.user.findFirst.mockResolvedValue(null);
    mocks.invitation.findFirst.mockResolvedValue({ id: "inv-9" });

    await expect(
      createSdkCompany(principal("sdk-admin"), {
        name: "Acme Ltd",
        ownerEmail: "owner@example.com",
      })
    ).rejects.toThrow("already pending");
    expect(mocks.company.create).not.toHaveBeenCalled();
  });
});
