import { getPrisma } from "@sdk-e/db";
import { createAuditEvent } from "@sdk-e/core/audit";
import { requireSdkStaff } from "@sdk-e/auth/authorization";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import type { AppPrincipal } from "@sdk-e/types";
import type { OverrideInput } from "./types";

export async function applyMatchOverride(
  principal: AppPrincipal,
  companyId: string,
  input: OverrideInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN"]);
  await requireActiveCompany(staff, companyId);

  return getPrisma().$transaction(async (tx) => {
    await tx.matchOverride.updateMany({
      where: {
        companyId,
        opportunityId: input.opportunityId,
        providerId: input.providerId,
        active: true,
      },
      data: { active: false },
    });
    const override = await tx.matchOverride.create({
      data: {
        companyId,
        opportunityId: input.opportunityId,
        providerId: input.providerId,
        actorId: input.actorId,
        type: input.type,
        reason: input.reason,
        active: true,
        positionId: input.positionId,
      },
    });

    const action =
      input.type === "BOOST"
        ? "match.override.boost"
        : input.type === "SUPPRESS"
          ? "match.override.suppress"
          : "match.override.exclude";

    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action,
      targetType: "MatchOverride",
      targetId: override.id,
      metadata: {
        providerId: input.providerId,
        opportunityId: input.opportunityId,
        type: input.type,
        reason: input.reason,
      },
    });

    return override;
  });
}
