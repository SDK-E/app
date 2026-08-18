import { notFound, requireProviderPrincipal, requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import { providerApplicationMachine } from "./machine";
import { calculateCompletenessScore } from "./score";
import type { Provider } from "@/generated/prisma/client";
import type { AppPrincipal } from "@/types";
import type { ProviderDraftInput } from "./schemas";

export async function createProviderProfile(principal: AppPrincipal): Promise<Provider> {
  requireProviderPrincipal(principal);
  const existing = await getPrisma().provider.findFirst({
    where: { userId: principal.id },
    select: { id: true },
  });
  if (existing) {
    return getPrisma().provider.findFirstOrThrow({
      where: { userId: principal.id },
    });
  }

  return getPrisma().provider.create({
    data: {
      userId: principal.id,
      status: "DRAFT",
    },
  });
}

export async function saveProviderApplicationDraft(
  principal: AppPrincipal,
  input: Partial<ProviderDraftInput>
): Promise<Provider> {
  requireProviderPrincipal(principal);
  const current = await getPrisma().provider.findFirst({
    where: { userId: principal.id },
  });
  if (!current) notFound("Provider profile not found.");
  if (current.status !== "DRAFT" && current.status !== "REJECTED") {
    throw new Error("Only draft applications can be edited.");
  }

  const data: Record<string, unknown> = { ...input, completenessScore: 0 };
  const updated = await getPrisma().provider.update({
    where: { id: current.id },
    data,
  });

  const score = calculateCompletenessScore(updated);
  await getPrisma().provider.update({
    where: { id: current.id },
    data: { completenessScore: score },
  });

  return getPrisma().provider.findFirstOrThrow({
    where: { id: current.id },
  });
}

export async function submitProviderApplication(principal: AppPrincipal): Promise<Provider> {
  requireProviderPrincipal(principal);
  const current = await getPrisma().provider.findFirst({
    where: { userId: principal.id },
  });
  if (!current) notFound("Provider profile not found.");

  providerApplicationMachine.assertTransition(current.status, "SUBMITTED");

  const score = calculateCompletenessScore(current);
  if (score < 60) {
    throw new Error(`Application is incomplete (score: ${score}/100). Minimum score is 60.`);
  }

  const updated = await getPrisma().provider.update({
    where: { id: current.id },
    data: { status: "SUBMITTED", completenessScore: score },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.application.submitted",
    targetType: "Provider",
    targetId: current.id,
    fromState: current.status,
    toState: "SUBMITTED",
    metadata: { completenessScore: score },
  });

  return updated;
}

export async function getProviderApplication(principal: AppPrincipal): Promise<Provider | null> {
  requireProviderPrincipal(principal);
  return getPrisma().provider.findFirst({
    where: { userId: principal.id },
  });
}

export async function getProviderApplicationsForReview(
  principal: AppPrincipal
): Promise<Provider[]> {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  return getPrisma().provider.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
    },
    orderBy: { createdAt: "asc" },
  });
}
