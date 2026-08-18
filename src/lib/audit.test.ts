import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAuditEvent } from "@/lib/audit";

const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    auditEvent: {
      create: mockCreate,
    },
  }),
}));

describe("audit", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("persists an AuditEvent with the provided fields", async () => {
    mockCreate.mockResolvedValue({ id: "event-1" });
    const result = await createAuditEvent({
      action: "CREATED",
      targetType: "Provider",
      targetId: "provider-1",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        companyId: undefined,
        actorId: undefined,
        actorKind: "USER",
        action: "CREATED",
        targetType: "Provider",
        targetId: "provider-1",
        fromState: undefined,
        toState: undefined,
        metadata: undefined,
      },
    });
    expect(result.id).toBe("event-1");
  });

  it("allows system events to omit actorId and companyId", async () => {
    mockCreate.mockResolvedValue({ id: "event-2" });
    await createAuditEvent({
      actorKind: "SYSTEM",
      action: "MAINTENANCE",
      targetType: "System",
      targetId: "system",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorKind: "SYSTEM",
          actorId: undefined,
          companyId: undefined,
        }),
      })
    );
  });

  it("sets actorKind correctly for user events", async () => {
    mockCreate.mockResolvedValue({ id: "event-3" });
    await createAuditEvent({
      actorId: "user-1",
      actorKind: "USER",
      action: "UPDATED",
      targetType: "Provider",
      targetId: "provider-1",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "user-1",
          actorKind: "USER",
        }),
      })
    );
  });

  it("sets actorKind correctly for provider events", async () => {
    mockCreate.mockResolvedValue({ id: "event-4" });
    await createAuditEvent({
      actorId: "provider-1",
      actorKind: "PROVIDER",
      action: "SUBMITTED",
      targetType: "Provider",
      targetId: "provider-1",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "provider-1",
          actorKind: "PROVIDER",
        }),
      })
    );
  });

  it("stores state transition fields when provided", async () => {
    mockCreate.mockResolvedValue({ id: "event-5" });
    await createAuditEvent({
      action: "STATUS_CHANGED",
      targetType: "Provider",
      targetId: "provider-1",
      fromState: "DRAFT",
      toState: "SUBMITTED",
      metadata: { note: "Application submitted" },
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromState: "DRAFT",
          toState: "SUBMITTED",
          metadata: { note: "Application submitted" },
        }),
      })
    );
  });
});
