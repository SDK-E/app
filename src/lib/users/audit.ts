import { createAuditEvent } from "@/lib/audit";
import type { AppPrincipal } from "@/types";

type ActorKind = "USER" | "PROVIDER" | "SDK_STAFF";

function actorKind(principal: AppPrincipal): ActorKind {
  if (principal.kind === "sdk-staff") return "SDK_STAFF";
  if (principal.kind === "provider") return "PROVIDER";
  return "USER";
}

export interface UserManagementEventInput {
  action: string;
  companyId?: string | null;
  targetType: string;
  targetId: string;
  fromState?: string | null;
  toState?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordUserManagementEvent(
  principal: AppPrincipal,
  input: UserManagementEventInput
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
