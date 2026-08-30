import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getServerEnv = vi
    .fn()
    .mockReturnValue({ STRIPE_WEBHOOK_SECRET: "whsec_test", STRIPE_SECRET_KEY: "sk_test" });
  const getCurrentPrincipal = vi.fn();
  const getPrisma = vi.fn();
  const constructEvent = vi.fn();
  const stripe = { webhooks: { constructEvent } };
  const requireSdkStaff = vi.fn();
  return { getServerEnv, getCurrentPrincipal, getPrisma, stripe, constructEvent, requireSdkStaff };
});

vi.mock("@platform/env", () => ({ getServerEnv: mocks.getServerEnv }));
vi.mock("@platform/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@platform/auth/identity", () => ({ getCurrentPrincipal: mocks.getCurrentPrincipal }));
vi.mock("@platform/auth/authorization", () => ({ requireSdkStaff: mocks.requireSdkStaff }));
vi.mock("stripe", () => ({
  default: function Stripe() {
    return mocks.stripe;
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function makeRequest(body: string, signature = "sig"): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    body,
  });
}

describe("stripe webhook handler", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("rejects requests without a signature header", async () => {
    const request = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects invalid signatures", async () => {
    mocks.getServerEnv.mockReturnValue({
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      STRIPE_SECRET_KEY: "sk_test",
    });
    mocks.stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(400);
  });

  it("processes invoice.paid and marks the invoice PAID", async () => {
    mocks.getServerEnv.mockReturnValue({
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      STRIPE_SECRET_KEY: "sk_test",
    });
    mocks.stripe.webhooks.constructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: { metadata: { invoiceId: "invoice-1" }, amount_paid: 5000, currency: "usd" },
      },
    } as any);

    const tx = {
      invoice: { updateMany: vi.fn(), findFirst: vi.fn() },
      payment: { findFirst: vi.fn(), create: vi.fn() },
    };

    mocks.getPrisma.mockReturnValue({ $transaction: vi.fn((fn: any) => fn(tx)) } as any);

    const response = await POST(makeRequest(JSON.stringify({ type: "invoice.paid" })));
    expect(response.status).toBe(200);
    expect(tx.invoice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PAID" }) }),
    );
    expect(tx.payment.create).toHaveBeenCalled();
  });
});
