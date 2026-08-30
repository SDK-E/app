"use server";

import {
  getService,
  getProviderServices,
  getServicesForReview,
} from "@sdk-e/providers/services/queries";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";

export async function getServiceAction(serviceId: string) {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;
  return getService(principal, serviceId);
}

export async function getProviderServicesAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getProviderServices(principal);
}

export async function getServicesForReviewAction() {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getServicesForReview(principal);
}
