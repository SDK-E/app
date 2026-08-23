import { beforeEach, describe, expect, it, vi } from "vitest";

import { getClientDashboard, groupInvoiceTotals } from "@sdk-e/requests/dashboard";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findMany: vi.fn() };
  const project = { findMany: vi.fn() };
  const invoice = { findMany: vi.fn() };
  const requestActivity = { findMany: vi.fn() };
  return {
    prisma: { request, project, invoice, requestActivity },
    request,
    project,
    invoice,
    requestActivity,
  };
});

vi.mock("@sdk-e/db", () => ({
  getPrisma: () => mocks.prisma,
}));

beforeEach(() => {
  mocks.request.findMany.mockReset();
  mocks.project.findMany.mockReset();
  mocks.invoice.findMany.mockReset();
  mocks.requestActivity.findMany.mockReset();
});

describe("groupInvoiceTotals", () => {
  it("sums sent and overdue amounts per currency", () => {
    const invoices = [
      { amount: "1000.00", currency: "GBP", status: "SENT" },
      { amount: "250.00", currency: "GBP", status: "OVERDUE" },
      { amount: "200.00", currency: "EUR", status: "SENT" },
      { amount: "50.00", currency: "EUR", status: "DRAFT" },
    ];

    expect(groupInvoiceTotals(invoices)).toEqual({
      GBP: { sent: 1000, overdue: 250 },
      EUR: { sent: 200, overdue: 0 },
    });
  });

  it("handles numeric amounts and empty inputs", () => {
    expect(groupInvoiceTotals([])).toEqual({});
    expect(
      groupInvoiceTotals([
        { amount: 100, currency: "USD", status: "OVERDUE" },
        { amount: 200, currency: "USD", status: "SENT" },
      ])
    ).toEqual({ USD: { sent: 200, overdue: 100 } });
  });
});

describe("getClientDashboard", () => {
  it("gathers requests, projects, invoices and activity for invoice-visible clients", async () => {
    const requests = [{ id: "request-1", title: "Modernize" }];
    const projects = [{ id: "project-1", name: "Automation" }];
    const recentActivity = [{ id: "activity-1" }];
    mocks.request.findMany.mockResolvedValue(requests);
    mocks.project.findMany.mockResolvedValue(projects);
    mocks.invoice.findMany.mockResolvedValue([
      { amount: "1000.00", currency: "GBP", status: "SENT", dueDate: null },
    ]);
    mocks.requestActivity.findMany.mockResolvedValue(recentActivity);

    const result = await getClientDashboard(principal("owner"), "company-1");

    expect(mocks.request.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: "company-1",
          status: { notIn: ["CLOSED", "REJECTED"] },
        }),
        take: 6,
      })
    );
    expect(mocks.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ["PLANNING", "ACTIVE", "ON_HOLD"] } }),
        take: 5,
      })
    );
    expect(mocks.requestActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1" }, take: 8 })
    );
    expect(mocks.invoice.findMany).toHaveBeenCalled();
    expect(result).toMatchObject({
      requests,
      projects,
      invoices: [{ amount: "1000.00", currency: "GBP", status: "SENT", dueDate: null }],
      recentActivity,
      invoiceTotals: { GBP: { sent: 1000, overdue: 0 } },
    });
  });

  it("skips invoices for clients without invoice visibility", async () => {
    mocks.request.findMany.mockResolvedValue([]);
    mocks.project.findMany.mockResolvedValue([]);
    mocks.requestActivity.findMany.mockResolvedValue([]);

    const result = await getClientDashboard(principal("member"), "company-1");

    expect(mocks.invoice.findMany).not.toHaveBeenCalled();
    expect(result.invoices).toEqual([]);
    expect(result.invoiceTotals).toEqual({});
  });

  it("rejects SDK staff principals", async () => {
    await expect(getClientDashboard(principal("sdk-admin"), "company-1")).rejects.toThrow(
      "Client-company access is required."
    );
    expect(mocks.request.findMany).not.toHaveBeenCalled();
  });
});
