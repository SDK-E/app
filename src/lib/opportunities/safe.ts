import type {
  Opportunity,
  OpportunityPosition,
  OpportunityVisibilityMode,
} from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";

export type OpportunityInternalRecord = Opportunity;

export type OpportunityClientRecord = Omit<
  Opportunity,
  "internalNotes" | "rejectionFeedback" | "ownerId"
>;

export type OpportunityPublicRecord = Omit<
  OpportunityClientRecord,
  "clientName" | "budgetMin" | "budgetMax"
> & { providerAction?: "SAVED" | "HIDDEN" | null };

export type OpportunitySafeRecord =
  OpportunityInternalRecord | OpportunityClientRecord | OpportunityPublicRecord;

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of keys) delete result[key as string];
  return result as Omit<T, K>;
}

function isPrivileged(principal: AppPrincipal): boolean {
  return (
    principal.kind === "sdk-staff" && (principal.role === "ADMIN" || principal.role === "DELIVERY")
  );
}

export function selectOpportunitySafe(
  principal: AppPrincipal,
  opportunity: Opportunity,
  providerAction?: "SAVED" | "HIDDEN" | null
): OpportunitySafeRecord {
  if (isPrivileged(principal)) {
    return opportunity;
  }

  const clientRecord = omit(opportunity, ["internalNotes", "rejectionFeedback", "ownerId"]);

  if (principal.kind === "provider") {
    const publicRecord = omit(clientRecord, ["clientName", "budgetMin", "budgetMax"]);
    if (opportunity.clientIdentityVisible) {
      (publicRecord as Record<string, unknown>).clientName = opportunity.clientName;
    }
    if (providerAction !== undefined) {
      (publicRecord as Record<string, unknown>).providerAction = providerAction;
    }
    return publicRecord as OpportunityPublicRecord;
  }

  return clientRecord as OpportunityClientRecord;
}

export type OpportunityPositionClientRecord = Omit<OpportunityPosition, "internalNotes">;

export type OpportunityPositionPublicRecord = Omit<
  OpportunityPositionClientRecord,
  "budgetMin" | "budgetMax"
>;

export function selectOpportunityPositionSafe(
  principal: AppPrincipal,
  position: OpportunityPosition
): OpportunityPositionClientRecord | OpportunityPositionPublicRecord {
  if (isPrivileged(principal)) {
    return position;
  }

  const clientRecord = omit(position, ["internalNotes"]);

  if (principal.kind === "provider") {
    return omit(clientRecord, ["budgetMin", "budgetMax"]) as OpportunityPositionPublicRecord;
  }

  return clientRecord as OpportunityPositionClientRecord;
}

export function canViewOpportunity(
  principal: AppPrincipal,
  visibilityMode: OpportunityVisibilityMode,
  hasActiveInvitation?: boolean
): boolean {
  if (isPrivileged(principal)) return true;
  if (principal.kind === "client") return visibilityMode === "ELIGIBLE_NETWORK";
  if (principal.kind === "provider") {
    if (visibilityMode === "ELIGIBLE_NETWORK") return true;
    if ((visibilityMode === "DIRECT" || visibilityMode === "INVITE_ONLY") && hasActiveInvitation)
      return true;
    return false;
  }
  return false;
}
