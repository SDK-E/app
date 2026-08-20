import { notFound, requireProviderPrincipal, requireSdkStaff } from "@/lib/auth/authorization";
import { createAuditEvent } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { AppPrincipal } from "@/types";
import { calculateCapacityRange } from "./capacity";

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

export async function getDefaultDailyHours(principal: AppPrincipal, providerId: string) {
  assertProviderOwnership(principal, providerId);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");

  return provider.defaultDailyHours;
}

export async function setDefaultDailyHours(
  principal: AppPrincipal,
  providerId: string,
  hours: number | null
) {
  assertProviderOwnership(principal, providerId);

  if (hours !== null && (hours < 0 || hours > 24)) {
    throw new Error("Default daily hours must be between 0 and 24.");
  }

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) notFound("Provider not found.");

  const updated = await getPrisma().provider.update({
    where: { id: providerId },
    data: { defaultDailyHours: hours },
  });

  await createAuditEvent({
    actorId: principal.id,
    actorKind: principal.kind === "provider" ? "PROVIDER" : "SDK_STAFF",
    action: "provider.capacity.default_hours_updated",
    targetType: "Provider",
    targetId: providerId,
    metadata: { defaultDailyHours: hours },
  });

  return updated.defaultDailyHours;
}

export async function getCapacityRange(
  principal: AppPrincipal,
  providerId: string,
  startDate: Date,
  weeks: number
) {
  assertProviderOwnership(principal, providerId);

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    select: { timeZone: true, defaultDailyHours: true },
  });
  if (!provider) notFound("Provider not found.");
  if (!provider.timeZone) {
    throw new Error("Provider timezone must be set before querying capacity range.");
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

  return calculateCapacityRange(
    startDate,
    weeks,
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
    })),
    provider.defaultDailyHours ? Number(provider.defaultDailyHours) : null
  );
}
