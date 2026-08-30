import { describe, expect, it, vi } from "vitest";

const { getServerEnv } = vi.hoisted(() => ({
  getServerEnv: vi.fn().mockReturnValue({ STRIPE_SECRET_KEY: "sk_test" }),
}));

vi.mock("@platform/env", () => ({ getServerEnv }));

import { stripe } from "@platform/payments/stripe";

describe("stripe client", () => {
  it("is configured from the server environment secret", () => {
    expect(stripe).toBeDefined();
    expect(typeof stripe.checkout.sessions.create).toBe("function");
  });
});
