import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerEnv: vi
    .fn()
    .mockReturnValue({ AUTH0_BASE_URL: "https://app.example", STRIPE_SECRET_KEY: "sk_test" }),
  getCurrentPrincipal: vi.fn(),
  getPrisma: vi.fn(),
  requireCompanyContext: vi.fn(),
  stripe: { customers: { create: vi.fn() }, checkout: { sessions: { create: vi.fn() } } },
}));

vi.mock("@platform/env", () => ({ getServerEnv: mocks.getServerEnv }));
vi.mock("@platform/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@platform/auth/identity", () => ({ getCurrentPrincipal: mocks.getCurrentPrincipal }));
vi.mock("@platform/auth/authorization", () => ({
  requireCompanyContext: mocks.requireCompanyContext,
}));
vi.mock("@platform/payments/stripe", () => ({ stripe: mocks.stripe }));

import { POST } from "@/app/api/subscriptions/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("subscriptions route", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("creates a subscription checkout session", async () => {
    mocks.getServerEnv.mockReturnValue({ AUTH0_BASE_URL: "https://app.example" });
    mocks.getCurrentPrincipal.mockResolvedValue({ id: "user-1", email: "user@example.test" });
    mocks.requireCompanyContext.mockReturnValue({ principal: {}, companyId: "company-1" });
    mocks.getPrisma.mockReturnValue({
      invoice: {
        findFirst: vi.fn().mockResolvedValue({
          id: "invoice-1",
          companyId: "company-1",
          amount: 99,
          currency: "USD",
        }),
      },
      stripeCustomer: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
    } as any);
    mocks.stripe.customers.create.mockResolvedValue({ id: "cus_1", email: "user@example.test" });
    mocks.stripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/sub",
    });

    const response = await POST(
      makeRequest({
        invoiceId: "invoice-1",
        amount: 99,
        currency: "USD",
        interval: "month",
        intervalCount: 1,
        productName: "Pro",
      }),
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/sub");
  });

  it("requires productName", async () => {
    mocks.getCurrentPrincipal.mockResolvedValue({ id: "user-1", email: "user@example.test" });
    mocks.requireCompanyContext.mockReturnValue({ principal: {}, companyId: "company-1" });
    const response = await POST(makeRequest({ invoiceId: "invoice-1", productName: "" }));
    expect(response.status).toBe(400);
  });
});
