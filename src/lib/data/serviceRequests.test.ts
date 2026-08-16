import { describe, expect, it } from "vitest";

import { groupInvoiceTotals, resolveSdkTransition } from "./serviceRequests";

describe("request workflow", () => {
  it("allows SDK review only from submitted", () => {
    expect(resolveSdkTransition("SUBMITTED", { decision: "start-review" })?.toStatus).toBe(
      "IN_REVIEW"
    );
    expect(resolveSdkTransition("DRAFT", { decision: "start-review" })).toBeNull();
  });

  it("requires the correct source state for a proposal", () => {
    const decision = {
      decision: "proposal-ready" as const,
      content: "A bounded assessment with written findings and a prioritized implementation path.",
    };
    expect(resolveSdkTransition("IN_REVIEW", decision)?.toStatus).toBe("PROPOSAL_READY");
    expect(resolveSdkTransition("INFORMATION_REQUIRED", decision)).toBeNull();
  });

  it("keeps invoice currencies and states separate", () => {
    expect(
      groupInvoiceTotals([
        { amount: 100, currency: "EUR", status: "SENT" },
        { amount: 25, currency: "EUR", status: "OVERDUE" },
        { amount: 50, currency: "USD", status: "SENT" },
      ])
    ).toEqual({ EUR: { sent: 100, overdue: 25 }, USD: { sent: 50, overdue: 0 } });
  });
});
