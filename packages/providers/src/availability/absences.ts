import type { AppPrincipal } from "@platform/types";

import { notFound, requireProviderPrincipal, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";

import type { AbsenceInput } from "./schemas";

export async function approveAbsence(principal: AppPrincipal, absenceId: string) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const absence = await getPrisma().providerAbsence.findFirst({
    where: { id: absenceId },
  });
  if (!absence) notFound("Absence not found.");
  if (absence.status !== "PENDING") {
    throw new Error(`Cannot approve absence in ${absence.status} status.`);
  }

  const updated = await getPrisma().providerAbsence.update({
    where: { id: absenceId },
    data: { status: "APPROVED" },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.absence.approved",
    targetType: "ProviderAbsence",
    targetId: absenceId,
    fromState: "PENDING",
    toState: "APPROVED",
    metadata: { providerId: absence.providerId },
  });

  return updated;
}

export async function cancelAbsence(principal: AppPrincipal, absenceId: string) {
  const absence = await getPrisma().providerAbsence.findFirst({
    where: { id: absenceId },
  });
  if (!absence) notFound("Absence not found.");

  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    if (principal.providerId !== absence.providerId) {
      notFound("Absence not found.");
    }
    if (absence.status !== "PENDING") {
      throw new Error("Providers can only cancel pending absences.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  } else {
    throw new Error("Unauthorized.");
  }

  if (absence.status === "CANCELLED") {
    throw new Error("Absence is already cancelled.");
  }

  const now = new Date();
  if (absence.endDate < now && absence.status === "APPROVED") {
    throw new Error("Cannot cancel a past absence.");
  }

  const updated = await getPrisma().providerAbsence.update({
    where: { id: absenceId },
    data: { status: "CANCELLED" },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: principal.kind === "provider" ? "PROVIDER" : "SDK_STAFF",
    action: "provider.absence.cancelled",
    targetType: "ProviderAbsence",
    targetId: absenceId,
    fromState: absence.status,
    toState: "CANCELLED",
    metadata: { providerId: absence.providerId },
  });

  return updated;
}

export async function createAbsence(
  principal: AppPrincipal,
  providerId: string,
  input: AbsenceInput,
) {
  const providerPrincipal = requireProviderPrincipal(principal);
  if (providerPrincipal.providerId !== providerId) {
    notFound("Provider not found.");
  }

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) notFound("Provider not found.");

  const overlapping = await getPrisma().providerAbsence.findFirst({
    where: {
      providerId,
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: input.endDate },
      endDate: { gte: input.startDate },
    },
  });

  if (overlapping) {
    throw new Error("An existing approved or pending absence overlaps with the requested dates.");
  }

  const absence = await getPrisma().providerAbsence.create({
    data: {
      providerId,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason ?? null,
      status: "PENDING",
    },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "PROVIDER",
    action: "provider.absence.created",
    targetType: "ProviderAbsence",
    targetId: absence.id,
    toState: "PENDING",
    metadata: {
      providerId,
      startDate: input.startDate.toISOString(),
      endDate: input.endDate.toISOString(),
    },
  });

  return absence;
}

export async function getAbsences(
  principal: AppPrincipal,
  providerId: string,
  startAfter?: Date,
  endBefore?: Date,
) {
  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    if (principal.providerId !== providerId) {
      notFound("Provider not found.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  } else {
    throw new Error("Unauthorized.");
  }

  const where: Record<string, unknown> = { providerId };
  if (startAfter && endBefore) {
    where.startDate = { lte: endBefore };
    where.endDate = { gte: startAfter };
  }

  return getPrisma().providerAbsence.findMany({
    where,
    orderBy: { startDate: "desc" },
  });
}

export async function rejectAbsence(principal: AppPrincipal, absenceId: string, reason: string) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const absence = await getPrisma().providerAbsence.findFirst({
    where: { id: absenceId },
  });
  if (!absence) notFound("Absence not found.");
  if (absence.status !== "PENDING") {
    throw new Error(`Cannot reject absence in ${absence.status} status.`);
  }

  const updated = await getPrisma().providerAbsence.update({
    where: { id: absenceId },
    data: { status: "REJECTED", reason },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.absence.rejected",
    targetType: "ProviderAbsence",
    targetId: absenceId,
    fromState: "PENDING",
    toState: "REJECTED",
    metadata: { providerId: absence.providerId, reason },
  });

  return updated;
}
