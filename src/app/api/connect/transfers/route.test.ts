import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentPrincipal: vi.fn(),
  getPrisma: vi.fn(),
  requireSdkStaff: vi.fn(),
  stripe: { transfers: { create: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/auth/identity", () => ({ getCurrentPrincipal: mocks.getCurrentPrincipal }));
vi.mock("@/lib/auth/authorization", () => ({ requireSdkStaff: mocks.requireSdkStaff }));
vi.mock("@/lib/payments/stripe", () => ({ stripe: mocks.stripe }));

import { POST } from "@/app/api/connect/transfers/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/connect/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("connect transfers route", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("creates a transfer to a ready connected account", async () => {
    mocks.getCurrentPrincipal.mockResolvedValue({ id: "user-1" });
    mocks.requireSdkStaff.mockReturnValue({});
    mocks.getPrisma.mockReturnValue({
      stripeConnectedAccount: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ accountId: "acct_1", capabilities: {}, detailsSubmitted: true }),
      },
      payment: { create: vi.fn().mockResolvedValue({ id: "pay_1" }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mocks.stripe.transfers.create.mockResolvedValue({ id: "tr_1" });

    const response = await POST(
      makeRequest({ providerAccountId: "acct_1", amount: 100, currency: "USD" })
    );
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(mocks.stripe.transfers.create).toHaveBeenCalledWith(
      expect.objectContaining({ destination: "acct_1", amount: 10000, currency: "usd" })
    );
    expect(data.transfer.id).toBe("tr_1");
  });

  it("blocks transfers to unverified accounts", async () => {
    mocks.getCurrentPrincipal.mockResolvedValue({ id: "user-1" });
    mocks.requireSdkStaff.mockReturnValue({});
    mocks.getPrisma.mockReturnValue({
      stripeConnectedAccount: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ accountId: "acct_1", capabilities: null, detailsSubmitted: false }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const response = await POST(
      makeRequest({ providerAccountId: "acct_1", amount: 100, currency: "USD" })
    );
    expect(response.status).toBe(400);
    expect(mocks.stripe.transfers.create).not.toHaveBeenCalled();
  });
});
