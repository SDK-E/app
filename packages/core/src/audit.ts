import { getPrisma } from "@platform/db";

export interface CreateAuditEventInput {
  companyId?: string;
  actorId?: string;
  actorKind?: "PROVIDER" | "SDK_STAFF" | "SYSTEM" | "USER";
  action: string;
  targetType: string;
  targetId: string;
  fromState?: string;
  toState?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditEvent(input: CreateAuditEventInput) {
  const prisma = getPrisma();
  return prisma.auditEvent.create({
    data: {
      companyId: input.companyId,
      actorId: input.actorId,
      actorKind: input.actorKind ?? "USER",
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      fromState: input.fromState,
      toState: input.toState,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
    },
  });
}
