import type { VerificationRecord, VerificationEvidence } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";

export const VERIFICATION_TRANSITIONS: Record<string, string[]> = {
  NOT_STARTED: ["PENDING"],
  PENDING: ["IN_PROGRESS", "VERIFIED", "FAILED", "WAIVED"],
  IN_PROGRESS: ["VERIFIED", "FAILED"],
  FAILED: ["PENDING"],
  EXPIRED: ["PENDING"],
  WAIVED: [],
  VERIFIED: ["EXPIRED"],
};

export function assertVerificationTransition(from: string, to: string): void {
  const allowed = VERIFICATION_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(
      `Invalid verification transition from ${from} to ${to}. Allowed: ${allowed?.join(", ") ?? "none"}.`
    );
  }
}

export type VerificationSummaryRecord = Pick<
  VerificationRecord,
  "id" | "type" | "status" | "verifiedAt" | "expiresAt" | "createdAt"
> & {
  internalNotes?: string | null;
  rejectionReason?: string | null;
  verifiedById?: string | null;
  evidence: VerificationEvidence[];
};

export function selectVerificationSafe(
  principal: AppPrincipal,
  record: VerificationRecord & { evidence?: VerificationEvidence[] }
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

export function resolveEffectiveStatus(record: VerificationRecord): VerificationRecord["status"] {
  if (record.status === "VERIFIED" && record.expiresAt && record.expiresAt < new Date()) {
    return "EXPIRED";
  }
  return record.status;
}
