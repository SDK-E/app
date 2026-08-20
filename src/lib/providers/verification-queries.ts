import { requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { VerificationRequirement } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";
import type { UpsertVerificationRequirementInput } from "./verification.schemas";

export async function getVerificationRequirements(
  principal: AppPrincipal
): Promise<VerificationRequirement[]> {
  requireSdkStaff(principal, ["ADMIN"]);
  return getPrisma().verificationRequirement.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertVerificationRequirement(
  principal: AppPrincipal,
  input: UpsertVerificationRequirementInput
): Promise<VerificationRequirement> {
  requireSdkStaff(principal, ["ADMIN"]);

  const existing = await getPrisma().verificationRequirement.findUnique({
    where: { type: input.type },
  });

  const requirement = await getPrisma().verificationRequirement.upsert({
    where: { type: input.type },
    create: {
      type: input.type,
      name: input.name,
      description: input.description ?? null,
      required: input.required,
      enabled: input.enabled,
    },
    update: {
      name: input.name,
      description: input.description ?? null,
      required: input.required,
      enabled: input.enabled,
    },
  });

  await createAuditEvent({
    actorId: principal.kind === "sdk-staff" ? principal.id : undefined,
    actorKind: "SDK_STAFF",
    action: "verification.requirement.upserted",
    targetType: "VerificationRequirement",
    targetId: requirement.id,
    fromState: existing ? "EXISTS" : undefined,
    toState: "EXISTS",
    metadata: { type: input.type, wasNew: !existing },
  });

  return requirement;
}
