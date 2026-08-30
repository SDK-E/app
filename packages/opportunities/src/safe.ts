import type {
  Opportunity,
  OpportunityPosition,
  OpportunityVisibilityMode,
} from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

export type OpportunityClientRecord = Omit<
  Opportunity,
  "internalNotes" | "ownerId" | "rejectionFeedback"
>;

export type OpportunityInternalRecord = Opportunity;

export type OpportunityPositionClientRecord = Omit<OpportunityPosition, "internalNotes">;

export type OpportunityPositionPublicRecord = Omit<
  OpportunityPositionClientRecord,
  "budgetMax" | "budgetMin"
>;

export type OpportunityPublicRecord = { providerAction?: "HIDDEN" | "SAVED" | null } & Omit<
  OpportunityClientRecord,
  "budgetMax" | "budgetMin" | "clientName"
>;

export type OpportunitySafeRecord =
  OpportunityClientRecord | OpportunityInternalRecord | OpportunityPublicRecord;

export function canViewOpportunity(
  principal: AppPrincipal,
  visibilityMode: OpportunityVisibilityMode,
  hasActiveInvitation?: boolean,
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

export function selectOpportunityPositionSafe(
  principal: AppPrincipal,
  position: OpportunityPosition,
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

export function selectOpportunitySafe(
  principal: AppPrincipal,
  opportunity: Opportunity,
  providerAction?: "HIDDEN" | "SAVED" | null,
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

function isPrivileged(principal: AppPrincipal): boolean {
  return (
    principal.kind === "sdk-staff" && (principal.role === "ADMIN" || principal.role === "DELIVERY")
  );
}

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as K)) {
      result[key] = obj[key as keyof T];
    }
  }
  return result as Omit<T, K>;
}
