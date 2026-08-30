import type { AppPrincipal } from "@platform/types";

import { notFound, requireProviderPrincipal, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";

import type { WeeklyCapacityInput } from "./schemas";

export {
  getCapacityRange,
  getDefaultDailyHours,
  setDefaultDailyHours,
} from "./availability-defaults";

export async function getWeeklyCapacity(principal: AppPrincipal, providerId: string) {
  assertProviderOwnership(principal, providerId);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");

  const entries = await getPrisma().providerWeeklyCapacity.findMany({
    where: { providerId },
    orderBy: { weekday: "asc" },
  });

  return { entries, defaultDailyHours: provider.defaultDailyHours, timeZone: provider.timeZone };
}

export async function upsertWeeklyCapacity(
  principal: AppPrincipal,
  providerId: string,
  entries: WeeklyCapacityInput,
) {
  assertProviderOwnership(principal, providerId);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");
  if (!provider.timeZone) {
    throw new Error("Provider timezone must be set before configuring capacity.");
  }

  await getPrisma().$transaction(async (tx) => {
    for (const entry of entries) {
      await tx.providerWeeklyCapacity.upsert({
        where: { ["providerId_weekday"]: { providerId, weekday: entry.weekday } },
        create: { providerId, weekday: entry.weekday, hoursPerDay: entry.hoursPerDay },
        update: { hoursPerDay: entry.hoursPerDay },
      });
    }
  });

  const updated = await getPrisma().providerWeeklyCapacity.findMany({
    where: { providerId },
    orderBy: { weekday: "asc" },
  });

  const now = new Date();
  const reservations = await getPrisma().capacityReservation.findMany({
    where: {
      providerId,
      status: "CONFIRMED",
      endDate: { gte: now },
    },
  });

  const absences = await getPrisma().providerAbsence.findMany({
    where: {
      providerId,
      status: { in: ["APPROVED", "PENDING"] },
      endDate: { gte: now },
    },
  });

  const { calculateCapacityRange } = await import("./capacity");
  const range = calculateCapacityRange(
    now,
    12,
    updated.map((e) => ({ weekday: e.weekday, hoursPerDay: Number(e.hoursPerDay) })),
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
    })),
    provider.defaultDailyHours ? Number(provider.defaultDailyHours) : null,
  );

  const warnings: {
    reservationId: string;
    engagementId: null | string;
    weekStart: Date;
    available: number;
  }[] = [];
  for (const res of reservations) {
    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);
    for (const week of range) {
      const weekEnd = new Date(week.weekStart.getTime() + 6 * 86_400_000);
      if (resStart <= weekEnd && resEnd >= week.weekStart) {
        const resDaysInRange = Math.ceil(
          (Math.min(resEnd.getTime(), weekEnd.getTime()) -
            Math.max(resStart.getTime(), week.weekStart.getTime()) +
            86_400_000) /
            86_400_000,
        );
        const requested = resDaysInRange * Number(res.hoursPerDay);
        if (requested > week.available) {
          warnings.push({
            reservationId: res.id,
            engagementId: res.engagementId,
            weekStart: week.weekStart,
            available: week.available,
          });
        }
      }
    }
  }

  await createAuditEvent({
    actorId: principal.id,
    actorKind: principal.kind === "provider" ? "PROVIDER" : "SDK_STAFF",
    action: "provider.capacity.weekly_updated",
    targetType: "Provider",
    targetId: providerId,
    metadata: { entries: entries.length, warningCount: warnings.length },
  });

  return { entries: updated, warnings };
}

function assertProviderOwnership(principal: AppPrincipal, providerId: string) {
  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    if (principal.providerId !== providerId) {
      notFound("Provider capacity not found.");
    }
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  } else {
    throw new Error("Unauthorized.");
  }
}
