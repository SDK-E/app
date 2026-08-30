import {
  getVerificationRequirements,
  upsertVerificationRequirement,
} from "@platform/providers/verification-queries";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const verificationRequirement = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  };
  return {
    prisma: {
      verificationRequirement,
      auditEvent: { create: vi.fn() },
    },
    verificationRequirement,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  mocks.verificationRequirement.findMany.mockReset();
  mocks.verificationRequirement.findUnique.mockReset();
  mocks.verificationRequirement.upsert.mockReset();
  mocks.prisma.auditEvent.create.mockReset();
});

describe("getVerificationRequirements", () => {
  it("returns all requirements for SDK ADMIN", async () => {
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", name: "Identity Verification" },
    ]);
    const result = await getVerificationRequirements(principal("sdk-admin"));
    expect(result).toHaveLength(1);
  });

  it("throws for non-admin staff", async () => {
    await expect(getVerificationRequirements(principal("delivery"))).rejects.toThrow();
  });

  it("throws for provider", async () => {
    await expect(getVerificationRequirements(principal("provider"))).rejects.toThrow();
  });
});

describe("upsertVerificationRequirement", () => {
  it("creates a new requirement", async () => {
    mocks.verificationRequirement.findUnique.mockResolvedValue(null);
    mocks.verificationRequirement.upsert.mockResolvedValue({
      id: "req-1",
      type: "IDENTITY",
      name: "Identity Check",
    });

    const result = await upsertVerificationRequirement(principal("sdk-admin"), {
      type: "IDENTITY",
      name: "Identity Check",
      required: true,
      enabled: true,
    });

    expect(result.type).toBe("IDENTITY");
    expect(mocks.prisma.auditEvent.create).toHaveBeenCalled();
  });

  it("updates an existing requirement", async () => {
    mocks.verificationRequirement.findUnique.mockResolvedValue({
      id: "req-1",
      type: "IDENTITY",
    });
    mocks.verificationRequirement.upsert.mockResolvedValue({
      id: "req-1",
      type: "IDENTITY",
      name: "Updated Name",
    });

    await upsertVerificationRequirement(principal("sdk-admin"), {
      type: "IDENTITY",
      name: "Updated Name",
      required: true,
      enabled: true,
    });

    expect(mocks.verificationRequirement.upsert).toHaveBeenCalled();
  });

  it("throws for non-admin", async () => {
    await expect(
      upsertVerificationRequirement(principal("delivery"), {
        type: "IDENTITY",
        name: "Test",
        required: true,
        enabled: true,
      }),
    ).rejects.toThrow();
  });
});
