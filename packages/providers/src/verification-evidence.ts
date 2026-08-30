import type { VerificationEvidence, VerificationRecord } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

import { notFound, requireProviderPrincipal, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";

import type { ReviewVerificationDecision, SubmitEvidenceInput } from "./verification.schemas";

import { assertVerificationTransition, resolveEffectiveStatus } from "./verification";

export async function getVerificationEvidence(
  principal: AppPrincipal,
  evidenceId: string,
): Promise<VerificationEvidence> {
  const evidence = await getPrisma().verificationEvidence.findFirst({
    where: { id: evidenceId },
    include: { verification: { select: { providerId: true } } },
  });
  if (!evidence) notFound("Evidence document not found.");

  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    const provider = await getPrisma().provider.findFirst({
      where: { userId: principal.id },
      select: { id: true },
    });
    if (!provider || provider.id !== evidence.verification.providerId) {
      notFound("Evidence document not found.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  } else {
    throw new Error("Unauthorized.");
  }

  return evidence;
}

export async function reviewVerification(
  principal: AppPrincipal,
  verificationId: string,
  decision: ReviewVerificationDecision,
): Promise<VerificationRecord> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const record = await getPrisma().verificationRecord.findFirst({ where: { id: verificationId } });
  if (!record) notFound("Verification record not found.");

  let toStatus: VerificationRecord["status"];
  const auditMetadata: Record<string, unknown> = { reviewerId: staff.id };

  if (decision.decision === "approve") {
    assertVerificationTransition(record.status, "VERIFIED");
    toStatus = "VERIFIED";
    auditMetadata.expiresAt = decision.expiresAt?.toISOString() ?? null;
  } else if (decision.decision === "reject") {
    assertVerificationTransition(record.status, "FAILED");
    toStatus = "FAILED";
    auditMetadata.rejectionReason = decision.rejectionReason;
  } else {
    assertVerificationTransition(record.status, "WAIVED");
    toStatus = "WAIVED";
    auditMetadata.reason = decision.reason;
  }

  const approveExpiresAt = decision.decision === "approve" ? (decision.expiresAt ?? null) : null;

  const updated = await getPrisma().$transaction(async (tx) => {
    return tx.verificationRecord.update({
      where: { id: verificationId },
      data: {
        status: toStatus,
        verifiedAt: toStatus === "VERIFIED" ? new Date() : null,
        expiresAt: toStatus === "VERIFIED" ? approveExpiresAt : null,
        verifiedById: staff.id,
        rejectionReason: decision.decision === "reject" ? decision.rejectionReason : null,
        internalNotes: null,
      },
    });
  });

  await createAuditEvent({
    actorId: staff.id,
    actorKind: "SDK_STAFF",
    action: `provider.verification.${decision.decision}`,
    targetType: "VerificationRecord",
    targetId: verificationId,
    fromState: record.status,
    toState: toStatus,
    metadata: auditMetadata,
  });

  return updated;
}

export async function submitEvidence(
  principal: AppPrincipal,
  verificationId: string,
  input: SubmitEvidenceInput,
): Promise<VerificationEvidence> {
  requireProviderPrincipal(principal);

  const record = await getPrisma().verificationRecord.findFirst({
    where: { id: verificationId },
    include: { provider: { select: { userId: true } } },
  });

  if (!record) notFound("Verification record not found.");
  if (record.provider.userId !== principal.id) {
    notFound("Verification record not found.");
  }

  const effectiveStatus = resolveEffectiveStatus(record);
  if (
    effectiveStatus !== "NOT_STARTED" &&
    effectiveStatus !== "FAILED" &&
    effectiveStatus !== "PENDING"
  ) {
    throw new Error(`Cannot submit evidence for a verification in ${effectiveStatus} status.`);
  }

  const evidence = await getPrisma().$transaction(async (tx) => {
    const doc = await tx.verificationEvidence.create({
      data: {
        verificationId,
        name: input.name,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        contentHash: input.contentHash ?? null,
        status: "UPLOADED",
        uploadedBy: principal.id,
      },
    });

    assertVerificationTransition(record.status, "PENDING");
    await tx.verificationRecord.update({
      where: { id: verificationId },
      data: { status: "PENDING" },
    });

    return doc;
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.verification.evidence_submitted",
    targetType: "VerificationEvidence",
    targetId: evidence.id,
    fromState: record.status,
    toState: "PENDING",
    metadata: { verificationId, providerId: record.providerId, type: record.type },
  });

  return evidence;
}
