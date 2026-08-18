import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptProposal,
  createRequestDraft,
  respondToInformationRequest,
  submitRequest,
  updateRequestDraft,
} from "@/lib/requests/workflow";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const message = { create: vi.fn() };
  return {
    prisma: { request, requestActivity, message, $transaction: vi.fn() },
    request,
    requestActivity,
    message,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
const input = {
  title: "AI support automation",
  capability: "ai-automation" as const,
  description: "A description",
  businessContext: null,
  supportingInformation: null,
  supportingLinks: [],
};

beforeEach(() => {
  for (const mock of [
    mocks.request.create,
    mocks.request.findFirst,
    mocks.request.update,
    mocks.requestActivity.create,
    mocks.message.create,
  ]) {
    mock.mockReset();
  }
});

describe("createRequestDraft", () => {
  it("persists a draft scoped to the client's company", async () => {
    mocks.request.create.mockResolvedValue({ id: "request-1" });
    const result = await createRequestDraft(principal("owner"), "company-1", input);
    expect(mocks.request.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: "company-1",
        submittedBy: "user-1",
        ...input,
        activities: { create: expect.objectContaining({ type: "CREATED", toStatus: "DRAFT" }) },
      }),
    });
    expect(result).toEqual({ id: "request-1" });
  });
  it("rejects SDK staff who lack a client company", async () => {
    await expect(createRequestDraft(principal("sdk-admin"), "company-1", input)).rejects.toThrow(
      "Client-company access is required."
    );
    expect(mocks.request.create).not.toHaveBeenCalled();
  });
});

describe("updateRequestDraft", () => {
  it("updates an existing draft and logs the edit", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "DRAFT" });

    await updateRequestDraft(principal("owner"), "company-1", "request-1", input);
    expect(mocks.request.update).toHaveBeenCalledWith({ where: { id: "request-1" }, data: input });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "UPDATED" }),
    });
  });
  it("throws when the draft does not exist", async () => {
    await expect(
      updateRequestDraft(principal("owner"), "company-1", "request-missing", input)
    ).rejects.toThrow("Request not found.");
  });
  it("throws when the request was already submitted", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "SUBMITTED" });
    await expect(
      updateRequestDraft(principal("owner"), "company-1", "request-1", input)
    ).rejects.toThrow("Only draft requests can be edited.");
  });
});

describe("submitRequest", () => {
  it("submits a draft with the full input and transition event", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "DRAFT" });
    await submitRequest(principal("owner"), "company-1", "request-1", input);
    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: { ...input, status: "SUBMITTED" },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "SUBMITTED",
        fromStatus: "DRAFT",
        toStatus: "SUBMITTED",
      }),
    });
  });
  it("throws when a non-draft request is submitted", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "IN_REVIEW" });
    await expect(
      submitRequest(principal("owner"), "company-1", "request-1", input)
    ).rejects.toThrow("This request has already been submitted.");
  });
  it("throws when the request does not exist", async () => {
    await expect(
      submitRequest(principal("owner"), "company-1", "request-missing", input)
    ).rejects.toThrow("Request not found.");
  });
});

describe("respondToInformationRequest", () => {
  it("records a reply and moves the request back to review", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "INFORMATION_REQUIRED" });
    await respondToInformationRequest(
      principal("owner"),
      "company-1",
      "request-1",
      "Here is the answer."
    );
    expect(mocks.message.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        requestId: "request-1",
        authorId: "user-1",
        content: "Here is the answer.",
      },
    });
    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: { status: "IN_REVIEW" },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "INFORMATION_PROVIDED",
        fromStatus: "INFORMATION_REQUIRED",
        toStatus: "IN_REVIEW",
      }),
    });
  });
  it("throws when the request is not waiting for information", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "PROPOSAL_READY" });
    await expect(
      respondToInformationRequest(
        principal("owner"),
        "company-1",
        "request-1",
        "Here is the answer."
      )
    ).rejects.toThrow("This request is not waiting for information.");
  });
  it("throws when the request does not exist", async () => {
    await expect(
      respondToInformationRequest(
        principal("owner"),
        "company-1",
        "request-missing",
        "Here is the answer."
      )
    ).rejects.toThrow("Request not found.");
  });
});

describe("acceptProposal", () => {
  it("approves a proposal and records the acceptance", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "PROPOSAL_READY" });
    await acceptProposal(principal("owner"), "company-1", "request-1");
    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: { status: "APPROVED", closedAt: null },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "ACCEPTED",
        fromStatus: "PROPOSAL_READY",
        toStatus: "APPROVED",
      }),
    });
  });
  it("throws when the proposal is no longer accepting", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", status: "REJECTED" });
    await expect(acceptProposal(principal("owner"), "company-1", "request-1")).rejects.toThrow(
      "This proposal is no longer available to accept."
    );
  });
  it("throws when the request does not exist", async () => {
    await expect(
      acceptProposal(principal("owner"), "company-1", "request-missing")
    ).rejects.toThrow("Request not found.");
  });
});
