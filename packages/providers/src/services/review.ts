import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { createAuditEvent } from "@sdk-e/core/audit";
import { getPrisma } from "@sdk-e/db";
import { providerServiceMachine } from "./machine";
import type { ProviderService, ServiceReviewAction, ServiceStatus } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";
import type { ServiceReviewDecision } from "./schemas";

export async function reviewProviderService(
  principal: AppPrincipal,
  serviceId: string,
  decision: ServiceReviewDecision
): Promise<ProviderService> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
    include: { provider: { select: { userId: true } } },
  });
  if (!service) notFound("Service not found.");

  if (staff.id === service.provider.userId) {
    throw new Error("You cannot review your own service.");
  }

  let toStatus: ServiceStatus;
  let action: ServiceReviewAction;
  if (decision.decision === "approve") {
    providerServiceMachine.assertTransition(service.status, "APPROVED");
    toStatus = "APPROVED";
    action = "APPROVED";
  } else if (decision.decision === "reject") {
    providerServiceMachine.assertTransition(service.status, "REJECTED");
    toStatus = "REJECTED";
    action = "REJECTED";
  } else {
    providerServiceMachine.assertTransition(service.status, "CHANGES_REQUESTED");
    toStatus = "CHANGES_REQUESTED";
    action = "CHANGES_REQUESTED";
  }

  const updated = await getPrisma().$transaction(async (tx) => {
    const svc = await tx.providerService.update({
      where: { id: serviceId },
      data: { status: toStatus },
    });

    await tx.providerServiceReview.create({
      data: {
        serviceId,
        reviewerId: staff.id,
        action,
        reason: decision.decision === "approve" ? null : decision.reason,
      },
    });

    return svc;
  });

  await createAuditEvent({
    actorId: staff.id,
    actorKind: "SDK_STAFF",
    action: `provider.service.${decision.decision}`,
    targetType: "ProviderService",
    targetId: serviceId,
    fromState: service.status,
    toState: toStatus,
    metadata: { reviewerId: staff.id },
  });

  return updated;
}
