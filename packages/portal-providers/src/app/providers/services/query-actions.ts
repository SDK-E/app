"use server";

import { getCurrentPrincipal } from "@platform/auth/identity";
import {
  getProviderServices,
  getService,
  getServicesForReview,
} from "@platform/providers/services/queries";

export async function getProviderServicesAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getProviderServices(principal);
}

export async function getServiceAction(serviceId: string) {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;
  return getService(principal, serviceId);
}

export async function getServicesForReviewAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getServicesForReview(principal);
}
