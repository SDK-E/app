import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { VerificationRecord } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";
import {
  resolveEffectiveStatus,
  selectVerificationSafe,
  type VerificationSummaryRecord,
} from "./verification";

export async function initializeVerificationRecords(
  principal: AppPrincipal,
  providerId: string
): Promise<VerificationRecord[]> {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const requirements = await getPrisma().verificationRequirement.findMany({
    where: { enabled: true },
  });

  if (requirements.length === 0) return [];

  const existingRecords = await getPrisma().verificationRecord.findMany({
    where: { providerId },
    select: { type: true },
  });

  const existingTypes = new Set(existingRecords.map((r) => r.type));
  const missing = requirements.filter((req) => !existingTypes.has(req.type));

  if (missing.length === 0) return [];

  const created = await getPrisma().$transaction(async (tx) => {
    const records: VerificationRecord[] = [];
    for (const req of missing) {
      const record = await tx.verificationRecord.create({
        data: { providerId, type: req.type, status: "NOT_STARTED" },
      });
      records.push(record);
    }
    return records;
  });

  for (const record of created) {
    await createAuditEvent({
      actorId: principal.kind === "sdk-staff" ? principal.id : undefined,
      actorKind: "SDK_STAFF",
      action: "provider.verification.initialized",
      targetType: "VerificationRecord",
      targetId: record.id,
      toState: "NOT_STARTED",
      metadata: { providerId, type: record.type },
    });
  }

  return created;
}

export async function getProviderVerificationSummary(
  principal: AppPrincipal,
  providerId: string
): Promise<VerificationSummaryRecord[]> {
  if (principal.kind === "provider") {
    const { requireProviderPrincipal } = await import("@/lib/auth/authorization");
    requireProviderPrincipal(principal);
    if (principal.providerId !== providerId) {
      notFound("Provider verification records not found.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY", "FINANCE"]);
  } else {
    throw new Error("Unauthorized.");
  }

  const records = await getPrisma().verificationRecord.findMany({
    where: { providerId },
    include: { evidence: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  return records.map((record) => {
    const effectiveStatus = { ...record, status: resolveEffectiveStatus(record) };
    return selectVerificationSafe(principal, effectiveStatus);
  });
}
