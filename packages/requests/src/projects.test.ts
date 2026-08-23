import { beforeEach, describe, expect, it, vi } from "vitest";

import { convertRequestToProject, listActiveCompanies } from "@sdk-e/requests/projects";
import { common } from "@sdk-e/test-support/test-fixtures";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findFirst: vi.fn() };
  const project = { create: vi.fn(), findMany: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const company = { findFirst: vi.fn(), findMany: vi.fn() };
  return {
    prisma: { request, project, requestActivity, company, $transaction: vi.fn() },
    request,
    project,
    requestActivity,
    company,
  };
});

vi.mock("@sdk-e/db", () => ({
  getPrisma: () => mocks.prisma,
}));

beforeEach(() => {
  mocks.request.findFirst.mockReset();
  mocks.project.create.mockReset();
  mocks.project.findMany.mockReset();
  mocks.requestActivity.create.mockReset();
  mocks.company.findFirst.mockReset();
  mocks.company.findMany.mockReset();
  mocks.prisma.$transaction.mockReset();
  mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
});

describe("convertRequestToProject", () => {
  it("converts an accepted request into a project and logs it", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "APPROVED",
      projects: [],
    });
    mocks.project.create.mockResolvedValue({ id: "project-1", name: "Automation" });
    mocks.requestActivity.create.mockResolvedValue({ id: "activity-1" });

    const result = await convertRequestToProject(principal("sdk-admin"), "company-1", "request-1", {
      name: "Automation",
      description: "Handover scope",
    });

    expect(mocks.project.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        requestId: "request-1",
        createdBy: "user-1",
        name: "Automation",
        description: "Handover scope",
      },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: {
        requestId: "request-1",
        companyId: "company-1",
        actorId: "user-1",
        type: "CONVERTED_TO_PROJECT",
      },
    });
    expect(result).toEqual({ id: "project-1", name: "Automation" });
  });

  it("rejects a request that has not been accepted", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "IN_REVIEW",
      projects: [],
    });

    await expect(
      convertRequestToProject(principal("sdk-admin"), "company-1", "request-1", {
        name: "Automation",
        description: "Handover scope",
      })
    ).rejects.toThrow("Only accepted requests can become projects.");
    expect(mocks.project.create).not.toHaveBeenCalled();
  });

  it("rejects a request already linked to a project", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "APPROVED",
      projects: [{ id: "project-1" }],
    });

    await expect(
      convertRequestToProject(principal("sdk-admin"), "company-1", "request-1", {
        name: "Automation",
        description: "Handover scope",
      })
    ).rejects.toThrow("This request is already linked to a project.");
  });

  it("throws when the request does not exist", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue(null);

    await expect(
      convertRequestToProject(principal("sdk-admin"), "company-1", "request-missing", {
        name: "Automation",
        description: "Handover scope",
      })
    ).rejects.toThrow("Request not found.");
  });

  it("rejects when the target company is inactive", async () => {
    mocks.company.findFirst.mockResolvedValue(null);

    await expect(
      convertRequestToProject(principal("sdk-admin"), "company-1", "request-1", {
        name: "Automation",
        description: "Handover scope",
      })
    ).rejects.toThrow("Company not found.");
  });

  it("rejects staff roles outside the allowed set", async () => {
    const finance = { ...common, kind: "sdk-staff", role: "FINANCE" } as const;

    await expect(
      convertRequestToProject(finance, "company-1", "request-1", {
        name: "Automation",
        description: "Handover scope",
      })
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.project.create).not.toHaveBeenCalled();
  });
});

describe("listActiveCompanies", () => {
  it("returns active companies ordered by name", async () => {
    mocks.company.findMany.mockResolvedValue([{ id: "company-1", name: "Acme" }]);

    const result = await listActiveCompanies(principal("delivery"));

    expect(mocks.company.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    expect(result).toEqual([{ id: "company-1", name: "Acme" }]);
  });

  it("rejects staff without project access", async () => {
    const finance = { ...common, kind: "sdk-staff", role: "FINANCE" } as const;

    await expect(listActiveCompanies(finance)).rejects.toThrow("SDK staff access is required.");
  });
});
