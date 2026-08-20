"use server";

import {
  getService,
  getProviderServices,
  getServicesForReview,
} from "@/lib/providers/services/queries";
import { getCurrentPrincipal } from "@/lib/auth/identity";

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
