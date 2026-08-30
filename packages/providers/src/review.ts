import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { createAuditEvent } from "@sdk-e/core/audit";
import { getPrisma } from "@sdk-e/db";
import { providerApplicationMachine } from "./machine";
import type { Provider, ProviderReviewAction, ProviderStatus } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";
import type { ProviderReviewDecision } from "./schemas";

export async function reviewProviderApplication(
  principal: AppPrincipal,
  providerId: string,
  decision: ProviderReviewDecision
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

  const updated = await getPrisma().$transaction(async (tx) => {
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

  return updated;
}
