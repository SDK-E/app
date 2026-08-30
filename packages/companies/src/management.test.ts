import {
  getCompanyForManagement,
  listCompaniesForManagement,
  regenerateCompanyAccessCode,
  setCompanyActive,
} from "@platform/companies";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const company = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  const prisma = { company, auditEvent };
  return { prisma, company, auditEvent };
});

vi.mock("@platform/db", () => ({
  getPrisma: () => mocks.prisma,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("setCompanyActive", () => {
  it("lets an SDK administrator toggle a company", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-1" });
    mocks.company.update.mockImplementation(async ({ data }) => ({
      id: "company-1",
      isActive: data.isActive,
    }));

    const deactivated = await setCompanyActive(principal("sdk-admin"), "company-1", false);

    expect(mocks.company.update).toHaveBeenCalledWith({
      where: { id: "company-1" },
      data: { isActive: false },
    });
    expect(deactivated.isActive).toBe(false);
  });

  it("rejects delivery staff without company update permission", async () => {
    await expect(setCompanyActive(principal("delivery"), "company-1", false)).rejects.toThrow(
      "Missing permission: company:update",
    );
    expect(mocks.company.update).not.toHaveBeenCalled();
  });

  it("rejects a client owner", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-1" });

    await expect(setCompanyActive(principal("owner"), "company-1", false)).rejects.toThrow(
      "SDK administrator access is required.",
    );
    expect(mocks.company.update).not.toHaveBeenCalled();
  });

  it("returns not found for a missing company", async () => {
    mocks.company.findUnique.mockResolvedValue(null);

    await expect(setCompanyActive(principal("sdk-admin"), "company-9", false)).rejects.toThrow(
      "Company not found.",
    );
    expect(mocks.company.update).not.toHaveBeenCalled();
  });
});

describe("regenerateCompanyAccessCode", () => {
  it("rotates the access code for the principal's own company", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-1", accessCode: "OLD-CODE" });
    mocks.company.update.mockImplementation(async ({ data }) => ({
      id: "company-1",
      accessCode: data.accessCode,
    }));

    const result = await regenerateCompanyAccessCode(principal("owner"), "company-1");

    expect(mocks.company.findUnique).toHaveBeenCalledWith({ where: { id: "company-1" } });
    expect(result.accessCode).not.toBe("OLD-CODE");
    expect(result.accessCode).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("lets SDK administrators rotate any company's code", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-2" });
    mocks.company.update.mockImplementation(async ({ data }) => ({
      id: "company-2",
      accessCode: data.accessCode,
    }));

    await regenerateCompanyAccessCode(principal("sdk-admin"), "company-2");

    expect(mocks.company.update).toHaveBeenCalledWith({
      where: { id: "company-2" },
      data: expect.objectContaining({
        accessCode: expect.stringMatching(/^[0-9A-F]{4}-[0-9A-F]{4}$/),
      }),
    });
  });

  it("rejects delivery staff without company update permission", async () => {
    await expect(regenerateCompanyAccessCode(principal("delivery"), "company-1")).rejects.toThrow(
      "Missing permission: company:update",
    );
    expect(mocks.company.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a client rotating another company's code", async () => {
    await expect(regenerateCompanyAccessCode(principal("owner"), "company-2")).rejects.toThrow(
      "Cross-company access is denied.",
    );
    expect(mocks.company.findUnique).not.toHaveBeenCalled();
  });
});

describe("listCompaniesForManagement", () => {
  it("shows every company including inactive rows to an SDK administrator", async () => {
    mocks.company.findMany.mockResolvedValue([{ id: "company-1", isActive: false }]);

    await listCompaniesForManagement(principal("sdk-admin"));

    expect(mocks.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        select: expect.objectContaining({ accessCode: true }),
        orderBy: { name: "asc" },
      }),
    );
  });

  it("hides inactive companies and access codes from delivery staff", async () => {
    mocks.company.findMany.mockResolvedValue([]);

    await listCompaniesForManagement(principal("delivery"));

    expect(mocks.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        select: expect.objectContaining({ accessCode: false }),
      }),
    );
  });

  it("requires an SDK staff principal", async () => {
    await expect(listCompaniesForManagement(principal("owner"))).rejects.toThrow(
      "SDK staff access is required.",
    );
    expect(mocks.company.findMany).not.toHaveBeenCalled();
  });
});

describe("getCompanyForManagement", () => {
  it("exposes the access code only to an SDK administrator", async () => {
    mocks.company.findUnique
      .mockResolvedValueOnce({ id: "company-1", accessCode: "ABCD-1234" })
      .mockResolvedValueOnce({ id: "company-1" });

    const adminView = await getCompanyForManagement(principal("sdk-admin"), "company-1");
    const deliveryView = await getCompanyForManagement(principal("delivery"), "company-1");

    expect(adminView.accessCode).toBe("ABCD-1234");
    expect(deliveryView.accessCode).toBeUndefined();
    expect(mocks.company.findUnique).toHaveBeenCalledTimes(2);
  });

  it("returns not found for a missing company", async () => {
    mocks.company.findUnique.mockResolvedValue(null);

    await expect(getCompanyForManagement(principal("sdk-admin"), "company-9")).rejects.toThrow(
      "Company not found.",
    );
  });
});
