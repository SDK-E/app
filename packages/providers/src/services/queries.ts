import { requireProviderPrincipal, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import type { ProviderService } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";

export async function getService(
  principal: AppPrincipal,
  serviceId: string
): Promise<ProviderService | null> {
  const service = await getPrisma().providerService.findFirst({
    where: { id: serviceId },
  });
  if (!service) return null;

  if (principal.kind === "provider") {
    requireProviderPrincipal(principal);
    const provider = await getPrisma().provider.findFirst({
      where: { userId: principal.id },
      select: { id: true },
    });
    if (!provider || provider.id !== service.providerId) return null;
  } else if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  } else {
    return null;
  }

  return service;
}

export async function getProviderServices(principal: AppPrincipal): Promise<ProviderService[]> {
  requireProviderPrincipal(principal);
  const provider = await getPrisma().provider.findFirst({
    where: { userId: principal.id },
    select: { id: true },
  });
  if (!provider) return [];

  return getPrisma().providerService.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getServicesForReview(principal: AppPrincipal): Promise<ProviderService[]> {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  return getPrisma().providerService.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    orderBy: { createdAt: "asc" },
  });
}
