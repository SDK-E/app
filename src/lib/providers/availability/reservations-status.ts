import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { AppPrincipal } from "@/types";
import { checkReservationFeasibility } from "./capacity";

export async function confirmReservation(principal: AppPrincipal, reservationId: string) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const reservation = await getPrisma().capacityReservation.findFirst({
    where: { id: reservationId },
  });
  if (!reservation) notFound("Reservation not found.");
  if (reservation.status !== "PENDING") {
    throw new Error(`Cannot confirm reservation in ${reservation.status} status.`);
  }

  const provider = await getPrisma().provider.findFirst({
    where: { id: reservation.providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider || !provider.timeZone) {
    throw new Error("Provider or timezone not found.");
  }

  const entries = await getPrisma().providerWeeklyCapacity.findMany({
    where: { providerId: reservation.providerId },
  });

  const absences = await getPrisma().providerAbsence.findMany({
    where: {
      providerId: reservation.providerId,
      status: { in: ["APPROVED", "PENDING"] },
    },
  });

  const otherReservations = await getPrisma().capacityReservation.findMany({
    where: {
      providerId: reservation.providerId,
      status: "CONFIRMED",
      id: { not: reservationId },
    },
  });

  const feasibility = checkReservationFeasibility(
    Number(reservation.hoursPerDay),
    reservation.startDate,
    reservation.endDate,
    entries.map((e) => ({ weekday: e.weekday, hoursPerDay: Number(e.hoursPerDay) })),
    absences.map((a) => ({
      startDate: a.startDate,
      endDate: a.endDate,
      status: a.status,
    })),
    otherReservations.map((r) => ({
      hoursPerDay: Number(r.hoursPerDay),
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
    })),
    provider.defaultDailyHours ? Number(provider.defaultDailyHours) : null
  );

  if (!feasibility.feasible) {
    const details = feasibility.conflictingWeeks
      .map(
        (w) =>
          `Week of ${w.weekStart.toISOString().slice(0, 10)}: ${w.requested}h requested, ${w.available}h available`
      )
      .join("; ");
    throw new Error(`Cannot confirm reservation — capacity no longer available: ${details}`);
  }

  const updated = await getPrisma().capacityReservation.update({
    where: { id: reservationId },
    data: { status: "CONFIRMED" },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.reservation.confirmed",
    targetType: "CapacityReservation",
    targetId: reservationId,
    fromState: "PENDING",
    toState: "CONFIRMED",
    metadata: { providerId: reservation.providerId, engagementId: reservation.engagementId },
  });

  return updated;
}

export async function cancelReservation(principal: AppPrincipal, reservationId: string) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);

  const reservation = await getPrisma().capacityReservation.findFirst({
    where: { id: reservationId },
  });
  if (!reservation) notFound("Reservation not found.");
  if (reservation.status === "CANCELLED") {
    throw new Error("Reservation is already cancelled.");
  }

  const updated = await getPrisma().capacityReservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: "SDK_STAFF",
    action: "provider.reservation.cancelled",
    targetType: "CapacityReservation",
    targetId: reservationId,
    fromState: reservation.status,
    toState: "CANCELLED",
    metadata: { providerId: reservation.providerId, engagementId: reservation.engagementId },
  });

  return updated;
}
