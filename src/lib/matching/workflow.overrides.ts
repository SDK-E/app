import { getPrisma } from "@/lib/db";
import { createAuditEvent } from "@/lib/audit";
import { requireSdkStaff } from "@/lib/auth/authorization";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createOverride, deactivatePreviousOverrides } from "./queries";
import type { AppPrincipal } from "@/types";
import type { OverrideInput } from "./types";

export async function applyMatchOverride(
  principal: AppPrincipal,
  companyId: string,
  input: OverrideInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN"]);
  await requireActiveCompany(staff, companyId);

  return getPrisma().$transaction(async (tx) => {
    await deactivatePreviousOverrides(companyId, input.opportunityId, input.providerId);
    const override = await createOverride({
      ...input,
      companyId,
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
