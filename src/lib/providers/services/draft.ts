import { notFound, requireProviderPrincipal } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import { providerServiceMachine } from "./machine";
import { calculateServiceCompletenessScore } from "./score";
import type { ProviderService } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";
import type { ServiceDraftInput } from "./schemas";

export async function createServiceDraft(
  principal: AppPrincipal,
  input: ServiceDraftInput
): Promise<ProviderService> {
  requireProviderPrincipal(principal);
  const provider = await getPrisma().provider.findFirst({
    where: { userId: principal.id },
    select: { id: true, status: true },
  });
  if (!provider) notFound("Provider profile not found.");
  if (provider.status !== "APPROVED" && provider.status !== "ACTIVE") {
    throw new Error("Only approved providers can create services.");
  }

  const service = await getPrisma().providerService.create({
    data: {
      providerId: provider.id,
      title: input.title ?? "",
      description: input.description ?? "",
      capability: input.capability ?? "other",
      categoryTags: input.categoryTags ?? [],
      pricingModel: input.pricingModel ?? null,
      rateMin: input.rateMin ?? null,
      rateMax: input.rateMax ?? null,
      currency: input.currency ?? "USD",
      estimatedDuration: input.estimatedDuration ?? null,
      deliverables: input.deliverables ?? null,
    },
  });

  const score = calculateServiceCompletenessScore(service);
  await getPrisma().providerService.update({
    where: { id: service.id },
    data: { completenessScore: score },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.service.created",
    targetType: "ProviderService",
    targetId: service.id,
    toState: "DRAFT",
    metadata: { providerId: provider.id },
  });

  return getPrisma().providerService.findFirstOrThrow({ where: { id: service.id } });
}

export async function saveServiceDraft(
  principal: AppPrincipal,
  serviceId: string,
  input: Partial<ServiceDraftInput>
): Promise<ProviderService> {
  requireProviderPrincipal(principal);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
    include: { provider: { select: { userId: true } } },
  });
  if (!service) notFound("Service not found.");
  if (service.provider.userId !== principal.id) notFound("Service not found.");
  if (service.status !== "DRAFT" && service.status !== "REJECTED") {
    throw new Error("Only draft or rejected services can be edited.");
  }

  const data: Record<string, unknown> = { ...input, completenessScore: 0 };
  const updated = await getPrisma().providerService.update({
    where: { id: serviceId },
    data,
  });

  const score = calculateServiceCompletenessScore(updated);
  await getPrisma().providerService.update({
    where: { id: serviceId },
    data: { completenessScore: score },
  });

  return getPrisma().providerService.findFirstOrThrow({ where: { id: serviceId } });
}

export async function submitServiceForReview(
  principal: AppPrincipal,
  serviceId: string
): Promise<ProviderService> {
  requireProviderPrincipal(principal);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
    include: { provider: { select: { userId: true } } },
  });
  if (!service) notFound("Service not found.");
  if (service.provider.userId !== principal.id) notFound("Service not found.");

  providerServiceMachine.assertTransition(service.status, "SUBMITTED");

  const score = calculateServiceCompletenessScore(service);
  if (score < 60) {
    throw new Error(`Service is incomplete (score: ${score}/100). Minimum score is 60.`);
  }

  const updated = await getPrisma().providerService.update({
    where: { id: serviceId },
    data: { status: "SUBMITTED", completenessScore: score },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.service.submitted",
    targetType: "ProviderService",
    targetId: serviceId,
    fromState: service.status,
    toState: "SUBMITTED",
    metadata: { completenessScore: score },
  });

  return updated;
}
