import { decideRequest, resolveSdkTransition } from "@platform/requests/decisions";
import { common, principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const request = { findFirst: vi.fn(), update: vi.fn() };
  const message = { create: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const company = { findFirst: vi.fn() };
  return {
    prisma: { request, message, requestActivity, company, $transaction: vi.fn() },
    request,
    message,
    requestActivity,
    company,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));

describe("resolveSdkTransition", () => {
  it.each([
    ["start-review", "SUBMITTED", "IN_REVIEW"],
    ["start-review", "IN_REVIEW", null],
    ["start-review", "INFORMATION_REQUIRED", null],
    ["start-review", "PROPOSAL_READY", null],
    ["request-information", "IN_REVIEW", "INFORMATION_REQUIRED"],
    ["request-information", "SUBMITTED", null],
    ["request-information", "INFORMATION_REQUIRED", null],
    ["proposal-ready", "IN_REVIEW", "PROPOSAL_READY"],
    ["proposal-ready", "SUBMITTED", null],
    ["reject", "SUBMITTED", "REJECTED"],
    ["reject", "IN_REVIEW", "REJECTED"],
    ["reject", "INFORMATION_REQUIRED", "REJECTED"],
    ["reject", "PROPOSAL_READY", "REJECTED"],
    ["reject", "APPROVED", null],
    ["reject", "CLOSED", null],
    ["reject", "DRAFT", null],
  ] as const)("maps %s on %s → %s", (decision, current, expected) => {
    const payload = decision === "start-review" ? { decision } : { decision, content: "A note" };
    expect(resolveSdkTransition(current, payload)?.toStatus ?? null).toBe(expected);
  });

  it("records an information request event with content", () => {
    expect(
      resolveSdkTransition("IN_REVIEW", {
        decision: "request-information",
        content: "Clarify budget.",
      }),
    ).toEqual({
      toStatus: "INFORMATION_REQUIRED",
      event: "INFORMATION_REQUESTED",
      content: "Clarify budget.",
    });
  });

  it("carries proposal content through to the transition", () => {
    expect(
      resolveSdkTransition("IN_REVIEW", { decision: "proposal-ready", content: "Fixed scope." }),
    ).toEqual({ toStatus: "PROPOSAL_READY", event: "PROPOSAL_READY", content: "Fixed scope." });
  });

  it("rejects with the decision's content as the message", () => {
    expect(
      resolveSdkTransition("SUBMITTED", { decision: "reject", content: "Out of scope." }),
    ).toEqual({ toStatus: "REJECTED", event: "REJECTED", content: "Out of scope." });
  });
});

describe("decideRequest", () => {
  beforeEach(() => {
    for (const mock of [
      mocks.request.findFirst,
      mocks.request.update,
      mocks.message.create,
      mocks.requestActivity.create,
    ]) {
      mock.mockReset();
    }
    mocks.company.findFirst.mockReset().mockResolvedValue({ id: "company-1" });
    mocks.prisma.$transaction.mockReset();
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
  });

  const submitted = { id: "request-1", status: "SUBMITTED" as const };

  it("moves a submitted request into review without content", async () => {
    mocks.request.findFirst.mockResolvedValue(submitted);

    await decideRequest(principal("sdk-admin"), "company-1", "request-1", {
      decision: "start-review",
    });

    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: expect.objectContaining({ status: "IN_REVIEW", reviewedBy: "user-1", closedAt: null }),
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "REVIEW_STARTED",
        fromStatus: "SUBMITTED",
        toStatus: "IN_REVIEW",
      }),
    });
    expect(mocks.message.create).not.toHaveBeenCalled();
  });

  it("creates a message when the SDK decision carries content", async () => {
    mocks.request.findFirst.mockResolvedValue({ ...submitted, status: "IN_REVIEW" });

    await decideRequest(principal("delivery"), "company-1", "request-1", {
      decision: "proposal-ready",
      content: "A written proposal follows.",
    });

    expect(mocks.message.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        requestId: "request-1",
        authorId: "user-1",
        content: "A written proposal follows.",
      },
    });
  });

  it("rejects a request, closes it and records the event", async () => {
    mocks.request.findFirst.mockResolvedValue(submitted);

    await decideRequest(principal("sdk-admin"), "company-1", "request-1", {
      decision: "reject",
      content: "Out of scope.",
    });

    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: expect.objectContaining({
        status: "REJECTED",
        reviewedBy: "user-1",
        closedAt: expect.any(Date),
      }),
    });
    expect(mocks.message.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: "Out of scope." }) }),
    );
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "REJECTED",
        fromStatus: "SUBMITTED",
        toStatus: "REJECTED",
      }),
    });
  });

  it("rejects an out-of-workflow decision", async () => {
    mocks.request.findFirst.mockResolvedValue({ ...submitted, status: "APPROVED" });

    await expect(
      decideRequest(principal("sdk-admin"), "company-1", "request-1", { decision: "start-review" }),
    ).rejects.toThrow("That workflow action is no longer available.");
    expect(mocks.request.update).not.toHaveBeenCalled();
  });

  it("throws when the request does not exist", async () => {
    mocks.request.findFirst.mockResolvedValue(null);

    await expect(
      decideRequest(principal("sdk-admin"), "company-1", "request-missing", {
        decision: "start-review",
      }),
    ).rejects.toThrow("Request not found.");
  });

  it("rejects an inactive company before touching the request", async () => {
    mocks.company.findFirst.mockResolvedValue(null);

    await expect(
      decideRequest(principal("sdk-admin"), "company-1", "request-1", { decision: "start-review" }),
    ).rejects.toThrow("Company not found.");
    expect(mocks.request.findFirst).not.toHaveBeenCalled();
  });

  it("rejects SDK staff roles outside the allowed set", async () => {
    const finance = { ...common, kind: "sdk-staff", role: "FINANCE" } as const;

    await expect(
      decideRequest(finance, "company-1", "request-1", { decision: "start-review" }),
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.request.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a client principal entirely", async () => {
    await expect(
      decideRequest(principal("owner"), "company-1", "request-1", { decision: "start-review" }),
    ).rejects.toThrow("SDK staff access is required.");
  });
});
