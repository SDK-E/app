import { sendEnquiryNotification } from "@platform/email";
import { submitEnquiry } from "@platform/marketing/enquiries";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: { enquiry: { create: vi.fn() } },
}));

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));
vi.mock("@platform/email", () => ({ sendEnquiryNotification: vi.fn() }));

const validInput = {
  companyName: "Acme Corp",
  email: "owner@acme.example",
  capability: "ai-automation",
  description: "We would like to replace our manual support queue with an automation platform.",
  website: "",
  environment: "",
  timeline: "",
  budgetRange: "",
  context: "",
  honeypot: "",
};

beforeEach(() => {
  mocks.prisma.enquiry.create.mockReset();
  vi.mocked(sendEnquiryNotification).mockReset();
});

describe("submitEnquiry", () => {
  it("persists the enquiry and notifies the team", async () => {
    mocks.prisma.enquiry.create.mockResolvedValue({ id: "enquiry-1" });
    vi.mocked(sendEnquiryNotification).mockResolvedValue(true);

    await expect(submitEnquiry(validInput)).resolves.toEqual({ success: true });

    expect(mocks.prisma.enquiry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ companyName: "Acme Corp", email: "owner@acme.example" }),
    });
    expect(vi.mocked(sendEnquiryNotification)).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: "Acme Corp", email: "owner@acme.example" }),
    );
  });

  it("stores blank optional fields as null", async () => {
    mocks.prisma.enquiry.create.mockResolvedValue({ id: "enquiry-1" });
    vi.mocked(sendEnquiryNotification).mockResolvedValue(true);

    await submitEnquiry({ ...validInput, website: "https://acme.example" });

    expect(mocks.prisma.enquiry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        website: "https://acme.example",
        environment: null,
        timeline: null,
        budgetRange: null,
        context: null,
      }),
    });
  });

  it("returns field errors for invalid input", async () => {
    const result = await submitEnquiry({ ...validInput, description: "too short", email: "nope" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toContain("valid email");
      expect(result.errors.description).toContain("at least 50");
    }
  });

  it("rejects input that fills the honeypot", async () => {
    const result = await submitEnquiry({ ...validInput, honeypot: "spam" });

    expect(result).toEqual({
      success: false,
      errors: { honeypot: "Too big: expected string to have <=0 characters" },
    });
    expect(mocks.prisma.enquiry.create).not.toHaveBeenCalled();
  });

  it("returns a form error when the database write fails", async () => {
    mocks.prisma.enquiry.create.mockRejectedValue(new Error("db down"));

    const result = await submitEnquiry(validInput);

    expect(result).toEqual({
      success: false,
      errors: {},
      formError: "Could not save your enquiry. Please try again.",
    });
    expect(vi.mocked(sendEnquiryNotification)).not.toHaveBeenCalled();
  });

  it("still succeeds when the notification email fails", async () => {
    mocks.prisma.enquiry.create.mockResolvedValue({ id: "enquiry-1" });
    vi.mocked(sendEnquiryNotification).mockRejectedValue(new Error("mail down"));
    const errorSpy = vi.spyOn(console, "error");

    await expect(submitEnquiry(validInput)).resolves.toEqual({ success: true });

    expect(errorSpy).toHaveBeenCalledWith("enquiry notification email failed");
    errorSpy.mockRestore();
  });
});
