import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { Provider, ProviderCommercialReadiness } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";
import type { UpdateReadinessComponentInput } from "./verification.schemas";

const APPROVED_STATUSES = ["APPROVED", "ACTIVE"] as const;

function resolveEffectiveVerificationStatus(status: string, expiresAt: Date | null): string {
  if (status === "VERIFIED" && expiresAt && expiresAt < new Date()) {
    return "EXPIRED";
  }
  return status;
}

export async function getCommercialReadiness(
  principal: AppPrincipal,
  providerId: string
): Promise<ProviderCommercialReadiness & { commercialStatus: Provider["commercialStatus"] }> {
  if (principal.kind === "provider") {
    const provider = await getPrisma().provider.findFirst({
      where: { id: providerId },
      select: { userId: true },
    });
    if (!provider || provider.userId !== principal.id) {
      notFound("Commercial readiness not found.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY", "FINANCE"]);
  } else {
    throw new Error("Unauthorized.");
  }

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { commercialStatus: true },
  });
  if (!provider) notFound("Provider not found.");

  let readiness = await getPrisma().providerCommercialReadiness.findFirst({
    where: { providerId },
  });

  if (!readiness) {
    readiness = await getPrisma().providerCommercialReadiness.create({
      data: { providerId },
    });
  }

  return { ...readiness, commercialStatus: provider.commercialStatus };
}

export async function evaluateCommercialReadiness(
  principal: AppPrincipal,
  providerId: string
): Promise<ProviderCommercialReadiness> {
  requireSdkStaff(principal, ["ADMIN"]);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { id: true, status: true, commercialStatus: true },
  });
  if (!provider) notFound("Provider not found.");

  if (!APPROVED_STATUSES.includes(provider.status as (typeof APPROVED_STATUSES)[number])) {
    throw new Error(
      `Cannot evaluate commercial readiness for a provider in ${provider.status} status. Provider must be APPROVED or ACTIVE.`
    );
  }

  const requirements = await getPrisma().verificationRequirement.findMany({
    where: { enabled: true, required: true },
  });

  const records = await getPrisma().verificationRecord.findMany({
    where: { providerId },
  });

  const recordByType = new Map(records.map((r) => [r.type, r]));

  let allRequiredVerified = true;
  for (const req of requirements) {
    const record = recordByType.get(req.type);
    if (!record) {
      allRequiredVerified = false;
      break;
    }
    const effectiveStatus = resolveEffectiveVerificationStatus(record.status, record.expiresAt);
    if (effectiveStatus !== "VERIFIED") {
      allRequiredVerified = false;
      break;
    }
  }

  let readiness = await getPrisma().providerCommercialReadiness.findFirst({
    where: { providerId },
  });
  if (!readiness) {
    readiness = await getPrisma().providerCommercialReadiness.create({
      data: { providerId },
    });
  }

  const shouldBeReady =
    allRequiredVerified &&
    readiness.contractReady &&
    readiness.payoutReady &&
    readiness.taxInfoReady;
  const newStatus: Provider["commercialStatus"] = shouldBeReady ? "READY" : "NOT_READY";

  if (newStatus === provider.commercialStatus) {
    await getPrisma().providerCommercialReadiness.update({
      where: { providerId },
      data: { lastCheckedAt: new Date() },
    });
    return readiness;
  }

  const updated = await getPrisma().$transaction(async (tx) => {
    const r = await tx.providerCommercialReadiness.update({
      where: { providerId },
      data: { lastCheckedAt: new Date() },
    });

    await tx.provider.update({
      where: { id: providerId },
      data: { commercialStatus: newStatus },
    });

    return r;
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.commercial.readiness_changed",
    targetType: "Provider",
    targetId: providerId,
    fromState: provider.commercialStatus,
    toState: newStatus,
    metadata: {
      allRequiredVerified,
      contractReady: readiness.contractReady,
      payoutReady: readiness.payoutReady,
      taxInfoReady: readiness.taxInfoReady,
    },
  });

  return updated;
}

export async function updateReadinessComponent(
  principal: AppPrincipal,
  providerId: string,
  input: UpdateReadinessComponentInput
): Promise<ProviderCommercialReadiness> {
  requireSdkStaff(principal, ["ADMIN"]);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) notFound("Provider not found.");

  let readiness = await getPrisma().providerCommercialReadiness.findFirst({
    where: { providerId },
  });
  if (!readiness) {
    readiness = await getPrisma().providerCommercialReadiness.create({
      data: { providerId },
    });
  }

  const updated = await getPrisma().providerCommercialReadiness.update({
    where: { providerId },
    data: { [input.component]: input.ready },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.commercial.component_updated",
    targetType: "ProviderCommercialReadiness",
    targetId: readiness.id,
    metadata: { component: input.component, ready: input.ready, providerId },
  });

  return updated;
}
