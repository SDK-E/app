import { notFound, requireProviderPrincipal } from "@sdk-e/auth/authorization";
import { createAuditEvent } from "@sdk-e/core/audit";
import { getPrisma } from "@sdk-e/db";
import type { ServiceMediaAsset } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";
import type { AddMediaAssetInput } from "./schemas";

export async function addServiceMediaAsset(
  principal: AppPrincipal,
  serviceId: string,
  input: AddMediaAssetInput
): Promise<ServiceMediaAsset> {
  requireProviderPrincipal(principal);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
    include: { provider: { select: { userId: true } } },
  });
  if (!service) notFound("Service not found.");
  if (service.provider.userId !== principal.id) notFound("Service not found.");
  if (service.status !== "DRAFT" && service.status !== "REJECTED") {
    throw new Error("Media can only be added to draft or rejected services.");
  }

  const asset = await getPrisma().serviceMediaAsset.create({
    data: {
      serviceId,
      name: input.name,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      kind: input.kind ?? "OTHER",
      sortOrder: input.sortOrder ?? 0,
      uploadedBy: principal.id,
    },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.service.media_added",
    targetType: "ServiceMediaAsset",
    targetId: asset.id,
    metadata: { serviceId, name: input.name, mimeType: input.mimeType },
  });

  return asset;
}

export async function removeServiceMediaAsset(
  principal: AppPrincipal,
  mediaAssetId: string
): Promise<void> {
  requireProviderPrincipal(principal);
  const asset = await getPrisma().serviceMediaAsset.findFirst({
    where: { id: mediaAssetId },
    include: {
      service: {
        include: { provider: { select: { userId: true } } },
      },
    },
  });
  if (!asset) notFound("Media asset not found.");
  if (asset.service.provider.userId !== principal.id) notFound("Media asset not found.");
  if (asset.service.status !== "DRAFT" && asset.service.status !== "REJECTED") {
    throw new Error("Media can only be removed from draft or rejected services.");
  }

  await getPrisma().serviceMediaAsset.delete({ where: { id: mediaAssetId } });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.service.media_removed",
    targetType: "ServiceMediaAsset",
    targetId: mediaAssetId,
    metadata: { serviceId: asset.serviceId, name: asset.name },
  });
}

export async function getServiceMediaAssets(
  principal: AppPrincipal,
  serviceId: string
): Promise<ServiceMediaAsset[]> {
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
    include: { provider: { select: { userId: true } } },
  });
  if (!service) notFound("Service not found.");

  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    if (service.provider.userId !== principal.id) notFound("Service not found.");
  } else if (principal.kind === "sdk-staff") {
    // SDK staff can view any service's media
  } else {
    notFound("Service not found.");
  }

  return getPrisma().serviceMediaAsset.findMany({
    where: { serviceId },
    orderBy: { sortOrder: "asc" },
  });
}
