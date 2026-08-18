import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { activity, requireActiveCompany, scope } from "@/lib/requests/guards";
import type { SdkRequestDecision } from "@/lib/schemas/serviceRequest";
import type { RequestActivityType, RequestStatus } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";

export function resolveSdkTransition(
  current: RequestStatus,
  decision: SdkRequestDecision
): {
  toStatus: RequestStatus;
  event: RequestActivityType;
  content?: string;
} | null {
  if (decision.decision === "start-review" && current === "SUBMITTED")
    return { toStatus: "IN_REVIEW", event: "REVIEW_STARTED" };
  if (decision.decision === "request-information" && current === "IN_REVIEW")
    return {
      toStatus: "INFORMATION_REQUIRED",
      event: "INFORMATION_REQUESTED",
      content: decision.content,
    };
  if (decision.decision === "proposal-ready" && current === "IN_REVIEW")
    return { toStatus: "PROPOSAL_READY", event: "PROPOSAL_READY", content: decision.content };
  if (
    decision.decision === "reject" &&
    ["SUBMITTED", "IN_REVIEW", "INFORMATION_REQUIRED", "PROPOSAL_READY"].includes(current)
  )
    return { toStatus: "REJECTED", event: "REJECTED", content: decision.content };
  return null;
}

export async function decideRequest(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  decision: SdkRequestDecision
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "request:update");
  await requireActiveCompany(staff, companyId);
  await getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId } });
    if (!current) notFound("Request not found.");
    const transition = resolveSdkTransition(current.status, decision);
    if (!transition) throw new Error("That workflow action is no longer available.");
    const { toStatus, event, content } = transition;
    if (content)
      await tx.message.create({ data: { companyId, requestId: id, authorId: staff.id, content } });
    await tx.request.update({
      where: { id },
      data: {
        status: toStatus,
        reviewedBy: staff.id,
        reviewedAt: new Date(),
        closedAt: toStatus === "REJECTED" ? new Date() : null,
      },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, event, current.status, toStatus) },
    });
  });
}
