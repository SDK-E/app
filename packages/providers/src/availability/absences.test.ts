import {
  approveAbsence,
  cancelAbsence,
  createAbsence,
  getAbsences,
  rejectAbsence,
} from "@platform/providers/availability/absences";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const providerAbsence = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const provider = { findFirst: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: { providerAbsence, provider, auditEvent, $transaction: vi.fn() },
    providerAbsence,
    provider,
    auditEvent,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));

const baseAbsence = {
  id: "absence-1",
  providerId: "provider-1",
  startDate: new Date("2025-02-03"),
  endDate: new Date("2025-02-07"),
  reason: null,
  status: "PENDING" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  for (const mock of [
    mocks.providerAbsence.create,
    mocks.providerAbsence.findFirst,
    mocks.providerAbsence.findMany,
    mocks.providerAbsence.update,
    mocks.provider.findFirst,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("createAbsence", () => {
  it("creates a pending absence for the provider", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerAbsence.findFirst.mockResolvedValue(null);
    mocks.providerAbsence.create.mockResolvedValue(baseAbsence);

    const result = await createAbsence(principal("provider"), "provider-1", {
      startDate: new Date("2025-02-03"),
      endDate: new Date("2025-02-07"),
    });

    expect(result.status).toBe("PENDING");
    expect(mocks.auditEvent.create).toHaveBeenCalled();
  });

  it("rejects overlapping approved absence", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerAbsence.findFirst.mockResolvedValue({ id: "existing", status: "APPROVED" });

    await expect(
      createAbsence(principal("provider"), "provider-1", {
        startDate: new Date("2025-02-05"),
        endDate: new Date("2025-02-10"),
      }),
    ).rejects.toThrow("overlaps");
  });

  it("rejects non-provider creating absence for another provider", async () => {
    await expect(
      createAbsence(principal("sdk-admin"), "provider-1", {
        startDate: new Date("2025-02-03"),
        endDate: new Date("2025-02-07"),
      }),
    ).rejects.toThrow();
  });
});

describe("approveAbsence", () => {
  it("approves a pending absence", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue(baseAbsence);
    mocks.providerAbsence.update.mockResolvedValue({ ...baseAbsence, status: "APPROVED" });

    const result = await approveAbsence(principal("sdk-admin"), "absence-1");
    expect(result.status).toBe("APPROVED");
    expect(mocks.auditEvent.create).toHaveBeenCalled();
  });

  it("rejects approving a non-pending absence", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue({ ...baseAbsence, status: "APPROVED" });

    await expect(approveAbsence(principal("sdk-admin"), "absence-1")).rejects.toThrow(
      "Cannot approve absence in APPROVED status",
    );
  });

  it("rejects provider self-approval", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue(baseAbsence);

    await expect(approveAbsence(principal("provider"), "absence-1")).rejects.toThrow();
  });
});

describe("rejectAbsence", () => {
  it("rejects a pending absence with reason", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue(baseAbsence);
    mocks.providerAbsence.update.mockResolvedValue({
      ...baseAbsence,
      status: "REJECTED",
      reason: "Busy period",
    });

    const result = await rejectAbsence(principal("sdk-admin"), "absence-1", "Busy period");
    expect(result.status).toBe("REJECTED");
    expect(result.reason).toBe("Busy period");
  });
});

describe("cancelAbsence", () => {
  it("provider cancels own pending absence", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue(baseAbsence);
    mocks.providerAbsence.update.mockResolvedValue({ ...baseAbsence, status: "CANCELLED" });

    const result = await cancelAbsence(principal("provider"), "absence-1");
    expect(result.status).toBe("CANCELLED");
  });

  it("provider cannot cancel approved absence", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue({ ...baseAbsence, status: "APPROVED" });

    await expect(cancelAbsence(principal("provider"), "absence-1")).rejects.toThrow(
      "Providers can only cancel pending absences",
    );
  });

  it("SDK staff can cancel any absence", async () => {
    const futureAbsence = {
      ...baseAbsence,
      status: "APPROVED",
      endDate: new Date("2099-12-31"),
    };
    mocks.providerAbsence.findFirst.mockResolvedValue(futureAbsence);
    mocks.providerAbsence.update.mockResolvedValue({ ...futureAbsence, status: "CANCELLED" });

    const result = await cancelAbsence(principal("sdk-admin"), "absence-1");
    expect(result.status).toBe("CANCELLED");
  });

  it("blocks cancelling already cancelled absence", async () => {
    mocks.providerAbsence.findFirst.mockResolvedValue({ ...baseAbsence, status: "CANCELLED" });

    await expect(cancelAbsence(principal("sdk-admin"), "absence-1")).rejects.toThrow(
      "already cancelled",
    );
  });

  it("blocks cancelling past approved absence", async () => {
    const pastAbsence = {
      ...baseAbsence,
      status: "APPROVED",
      endDate: new Date("2024-01-01"),
    };
    mocks.providerAbsence.findFirst.mockResolvedValue(pastAbsence);

    await expect(cancelAbsence(principal("sdk-admin"), "absence-1")).rejects.toThrow(
      "past absence",
    );
  });
});

describe("getAbsences", () => {
  it("returns absences for the provider", async () => {
    mocks.providerAbsence.findMany.mockResolvedValue([baseAbsence]);

    const result = await getAbsences(principal("provider"), "provider-1");
    expect(result).toHaveLength(1);
  });

  it("SDK staff can view any provider absences", async () => {
    mocks.providerAbsence.findMany.mockResolvedValue([baseAbsence]);

    const result = await getAbsences(principal("sdk-admin"), "provider-1");
    expect(result).toHaveLength(1);
  });
});
