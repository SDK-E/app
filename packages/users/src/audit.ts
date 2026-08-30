import type { AppPrincipal } from "@platform/types";

import { createAuditEvent } from "@platform/core/audit";

export interface UserManagementEventInput {
  action: string;
  companyId?: null | string;
  targetType: string;
  targetId: string;
  fromState?: null | string;
  toState?: null | string;
  metadata?: Record<string, unknown>;
}

type ActorKind = "PROVIDER" | "SDK_STAFF" | "USER";

export async function recordUserManagementEvent(
  principal: AppPrincipal,
  input: UserManagementEventInput,
) {
  return createAuditEvent({
    companyId: input.companyId ?? undefined,
    actorId: principal.id,
    actorKind: actorKind(principal),
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    fromState: input.fromState ?? undefined,
    toState: input.toState ?? undefined,
    metadata: input.metadata,
  });
}

function actorKind(principal: AppPrincipal): ActorKind {
  if (principal.kind === "sdk-staff") return "SDK_STAFF";
  if (principal.kind === "provider") return "PROVIDER";
  return "USER";
}
