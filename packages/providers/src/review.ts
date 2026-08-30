import type { Provider, ProviderReviewAction, ProviderStatus } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";

import type { ProviderReviewDecision } from "./schemas";

import { providerApplicationMachine } from "./machine";

export async function reviewProviderApplication(
  principal: AppPrincipal,
  providerId: string,
  decision: ProviderReviewDecision,
): Promise<Provider> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  const current = await getPrisma().provider.findFirst({
    where: { id: providerId },
  });
  if (!current) notFound("Provider application not found.");

  if (staff.id === current.userId) {
    throw new Error("You cannot review your own application.");
  }

  let toStatus: ProviderStatus;
  let action: ProviderReviewAction;
  if (decision.decision === "approve") {
    providerApplicationMachine.assertTransition(current.status, "APPROVED");
    toStatus = "APPROVED";
    action = "APPROVED";
  } else if (decision.decision === "reject") {
    providerApplicationMachine.assertTransition(current.status, "REJECTED");
    toStatus = "REJECTED";
    action = "REJECTED";
  } else {
    providerApplicationMachine.assertTransition(current.status, "CHANGES_REQUESTED");
    toStatus = "CHANGES_REQUESTED";
    action = "CHANGES_REQUESTED";
  }

  return await getPrisma().$transaction(async (tx) => {
    const provider = await tx.provider.update({
      where: { id: providerId },
      data: { status: toStatus },
    });

    await tx.providerReview.create({
      data: {
        providerId,
        reviewerId: staff.id,
        action,
        reason: decision.decision === "approve" ? null : decision.reason,
      },
    });

    await createAuditEvent({
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: `provider.application.${decision.decision}`,
      targetType: "Provider",
      targetId: providerId,
      fromState: current.status,
      toState: toStatus,
      metadata: { reviewerId: staff.id },
    });

    return provider;
  });
}
