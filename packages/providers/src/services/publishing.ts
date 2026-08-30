import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { createAuditEvent } from "@sdk-e/core/audit";
import { getPrisma } from "@sdk-e/db";
import { providerServiceMachine } from "./machine";
import type { ProviderService } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";

export async function publishService(
  principal: AppPrincipal,
  serviceId: string
): Promise<ProviderService> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
  });
  if (!service) notFound("Service not found.");

  providerServiceMachine.assertTransition(service.status, "PUBLISHED");

  const updated = await getPrisma().providerService.update({
    where: { id: serviceId },
    data: { status: "PUBLISHED", publishedAt: new Date(), unpublishedAt: null },
  });

  await createAuditEvent({
    actorId: staff.id,
    actorKind: "SDK_STAFF",
    action: "provider.service.publish",
    targetType: "ProviderService",
    targetId: serviceId,
    fromState: service.status,
    toState: "PUBLISHED",
  });

  return updated;
}

export async function unpublishService(
  principal: AppPrincipal,
  serviceId: string
): Promise<ProviderService> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
  });
  if (!service) notFound("Service not found.");

  providerServiceMachine.assertTransition(service.status, "UNPUBLISHED");

  const updated = await getPrisma().providerService.update({
    where: { id: serviceId },
    data: { status: "UNPUBLISHED", unpublishedAt: new Date() },
  });

  await createAuditEvent({
    actorId: staff.id,
    actorKind: "SDK_STAFF",
    action: "provider.service.unpublish",
    targetType: "ProviderService",
    targetId: serviceId,
    fromState: service.status,
    toState: "UNPUBLISHED",
  });

  return updated;
}
