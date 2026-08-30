import { notFound, requireProviderPrincipal, requireSdkStaff } from "@sdk-e/auth/authorization";
import { createAuditEvent } from "@sdk-e/core/audit";
import { getPrisma } from "@sdk-e/db";
import type { AppPrincipal } from "@sdk-e/types";
import { checkReservationFeasibility } from "./capacity";
import type { ReservationInput } from "./schemas";

export { confirmReservation, cancelReservation } from "./reservations-status";

export async function createReservation(
  principal: AppPrincipal,
  providerId: string,
  input: ReservationInput
) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");
  if (!provider.timeZone) {
    throw new Error("Provider timezone must be set before creating reservations.");
  }

  const entries = await getPrisma().providerWeeklyCapacity.findMany({
    where: { providerId },
  });

  const absences = await getPrisma().providerAbsence.findMany({
    where: {
      providerId,
      status: { in: ["APPROVED", "PENDING"] },
    },
  });

  const existingReservations = await getPrisma().capacityReservation.findMany({
    where: {
      providerId,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
  });

  const feasibility = checkReservationFeasibility(
    input.hoursPerDay,
    input.startDate,
    input.endDate,
    entries.map((e) => ({ weekday: e.weekday, hoursPerDay: Number(e.hoursPerDay) })),
    absences.map((a) => ({
      startDate: a.startDate,
      endDate: a.endDate,
      status: a.status,
    })),
    existingReservations.map((r) => ({
      hoursPerDay: Number(r.hoursPerDay),
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      id: r.id,
    })) as Parameters<typeof checkReservationFeasibility>[5],
    provider.defaultDailyHours ? Number(provider.defaultDailyHours) : null
  );

  if (!feasibility.feasible) {
    const details = feasibility.conflictingWeeks
      .map(
        (w) =>
          `Week of ${w.weekStart.toISOString().slice(0, 10)}: ${w.requested}h requested, ${w.available}h available`
      )
      .join("; ");
    throw new Error(`Reservation not feasible: ${details}`);
  }

  const reservation = await getPrisma().capacityReservation.create({
    data: {
      providerId,
      engagementId: input.engagementId ?? null,
      hoursPerDay: input.hoursPerDay,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "PENDING",
    },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.reservation.created",
    targetType: "CapacityReservation",
    targetId: reservation.id,
    toState: "PENDING",
    metadata: {
      providerId,
      engagementId: input.engagementId ?? null,
      hoursPerDay: input.hoursPerDay,
      startDate: input.startDate.toISOString(),
      endDate: input.endDate.toISOString(),
    },
  });

  return reservation;
}

export async function getReservations(
  principal: AppPrincipal,
  providerId: string,
  startAfter?: Date,
  endBefore?: Date
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

  return getPrisma().capacityReservation.findMany({
    where,
    orderBy: { startDate: "desc" },
  });
}

export async function getReservationFeasibility(
  principal: AppPrincipal,
  providerId: string,
  input: ReservationInput,
  excludeReservationId?: string
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

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");
  if (!provider.timeZone) {
    throw new Error("Provider timezone must be set.");
  }

  const entries = await getPrisma().providerWeeklyCapacity.findMany({
    where: { providerId },
  });

  const absences = await getPrisma().providerAbsence.findMany({
    where: {
      providerId,
      status: { in: ["APPROVED", "PENDING"] },
    },
  });

  const reservations = await getPrisma().capacityReservation.findMany({
    where: {
      providerId,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
  });

  return checkReservationFeasibility(
    input.hoursPerDay,
    input.startDate,
    input.endDate,
    entries.map((e) => ({ weekday: e.weekday, hoursPerDay: Number(e.hoursPerDay) })),
    absences.map((a) => ({
      startDate: a.startDate,
      endDate: a.endDate,
      status: a.status,
    })),
    reservations.map((r) => ({
      hoursPerDay: Number(r.hoursPerDay),
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      id: r.id,
    })) as Parameters<typeof checkReservationFeasibility>[5],
    provider.defaultDailyHours ? Number(provider.defaultDailyHours) : null,
    excludeReservationId
  );
}
