import type { VerificationEvidence, VerificationRecord } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

export const VERIFICATION_TRANSITIONS: Record<string, string[]> = {
  NOT_STARTED: ["PENDING"],
  PENDING: ["IN_PROGRESS", "VERIFIED", "FAILED", "WAIVED"],
  IN_PROGRESS: ["VERIFIED", "FAILED"],
  FAILED: ["PENDING"],
  EXPIRED: ["PENDING"],
  WAIVED: [],
  VERIFIED: ["EXPIRED"],
};

export type VerificationSummaryRecord = {
  internalNotes?: null | string;
  rejectionReason?: null | string;
  verifiedById?: null | string;
  evidence: VerificationEvidence[];
} & Pick<VerificationRecord, "createdAt" | "expiresAt" | "id" | "status" | "type" | "verifiedAt">;

export function assertVerificationTransition(from: string, to: string): void {
  const allowed = VERIFICATION_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(
      `Invalid verification transition from ${from} to ${to}. Allowed: ${allowed?.join(", ") ?? "none"}.`,
    );
  }
}

export function resolveEffectiveStatus(record: VerificationRecord): VerificationRecord["status"] {
  if (record.status === "VERIFIED" && record.expiresAt && record.expiresAt < new Date()) {
    return "EXPIRED";
  }
  return record.status;
}

export function selectVerificationSafe(
  principal: AppPrincipal,
  record: { evidence?: VerificationEvidence[] } & VerificationRecord,
): VerificationSummaryRecord {
  const base: VerificationSummaryRecord = {
    id: record.id,
    type: record.type,
    status: record.status,
    verifiedAt: record.verifiedAt,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    evidence: record.evidence ?? [],
  };

  if (
    principal.kind === "sdk-staff" &&
    (principal.role === "ADMIN" || principal.role === "DELIVERY")
  ) {
    return {
      ...base,
      internalNotes: record.internalNotes,
      rejectionReason: record.rejectionReason,
      verifiedById: record.verifiedById,
    };
  }

  return base;
}
