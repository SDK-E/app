import type { Opportunity } from "@platform/db/client";
import type { AppPrincipal, ProviderPrincipal } from "@platform/types";

import { requireProviderPrincipal } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { deliver } from "@platform/notifications/delivery";
import { createNotificationIdempotent } from "@platform/notifications/notifications";

export interface ProviderPreferences {
  saved: Opportunity[];
  hidden: Opportunity[];
}

export async function getProviderPreferences(
  principal: AppPrincipal,
): Promise<ProviderPreferences> {
  const provider = requireProviderPrincipal(principal);

  const [saved, hidden] = await Promise.all([
    getPrisma().opportunityProviderPreference.findMany({
      where: { providerId: provider.providerId, action: "SAVED" },
      include: { opportunity: true },
    }),
    getPrisma().opportunityProviderPreference.findMany({
      where: { providerId: provider.providerId, action: "HIDDEN" },
      include: { opportunity: true },
    }),
  ]);

  return {
    saved: saved.map((p) => p.opportunity),
    hidden: hidden.map((p) => p.opportunity),
  };
}

export async function hideOpportunity(principal: AppPrincipal, opportunityId: string) {
  const provider = requireProviderPrincipal(principal);
  const record = await loadProvider(provider);

  const existing = await getPrisma().opportunityProviderPreference.findFirst({
    where: { opportunityId, providerId: provider.providerId },
  });

  if (!existing) {
    return getPrisma().opportunityProviderPreference.create({
      data: {
        opportunityId,
        providerId: provider.providerId,
        companyId: record.companyId ?? "",
        action: "HIDDEN",
      },
    });
  }

  return getPrisma().opportunityProviderPreference.update({
    where: { id: existing.id },
    data: { action: "HIDDEN" },
  });
}

export async function saveOpportunity(principal: AppPrincipal, opportunityId: string) {
  const provider = requireProviderPrincipal(principal);
  const record = await loadProvider(provider);

  const existing = await getPrisma().opportunityProviderPreference.findFirst({
    where: { opportunityId, providerId: provider.providerId },
  });

  let preference;
  if (!existing) {
    preference = await getPrisma().opportunityProviderPreference.create({
      data: {
        opportunityId,
        providerId: provider.providerId,
        companyId: record.companyId ?? "",
        action: "SAVED",
      },
    });
    await createNotificationIdempotent({
      recipientId: provider.id,
      recipientKind: "PROVIDER",
      category: "OPPORTUNITY",
      type: "OPPORTUNITY_SAVED",
      title: "Opportunity saved",
      eventKey: `opportunity-saved:${opportunityId}:${provider.providerId}`,
    }).then((notification) => notification && deliver(notification));
  } else if (existing.action !== "SAVED") {
    preference = await getPrisma().opportunityProviderPreference.update({
      where: { id: existing.id },
      data: { action: "SAVED" },
    });
  } else {
    preference = existing;
  }

  return preference;
}

async function loadProvider(principal: ProviderPrincipal) {
  const provider = await getPrisma().provider.findFirst({
    where: { id: principal.providerId },
    select: { id: true, companyId: true },
  });
  if (!provider) {
    throw new Error("Provider record not found.");
  }
  return provider;
}
