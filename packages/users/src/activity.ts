import type { Prisma } from "@platform/db/client";

import { getPrisma } from "@platform/db";

export interface ActivityRow {
  id: string;
  companyId: null | string;
  actorId: null | string;
  actorKind: string;
  actorName: null | string;
  action: string;
  targetType: string;
  targetId: string;
  fromState: null | string;
  toState: null | string;
  createdAt: Date;
}

const managedTargetTypes = ["membership", "invitation", "company_access_request", "user"];

export async function listUserManagementActivity(
  scope: { companyId?: string; userId?: string },
  take = 15,
): Promise<ActivityRow[]> {
  const where: Prisma.AuditEventWhereInput = {
    targetType: { in: managedTargetTypes },
    ...(scope.companyId ? { companyId: scope.companyId } : {}),
    ...(scope.userId
      ? {
          OR: [{ targetId: scope.userId, targetType: "user" }, { actorId: scope.userId }],
        }
      : {}),
  };
  const events = await getPrisma().auditEvent.findMany({
    where,
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  return events.map((event) => ({
    id: event.id,
    companyId: event.companyId,
    actorId: event.actorId,
    actorKind: event.actorKind,
    actorName: event.actor?.name ?? null,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    fromState: event.fromState,
    toState: event.toState,
    createdAt: event.createdAt,
  }));
}
