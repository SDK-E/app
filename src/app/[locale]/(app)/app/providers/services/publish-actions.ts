"use server";

import { revalidatePath } from "next/cache";

import { publishService, unpublishService } from "@/lib/providers/services/publishing";
import { getCurrentPrincipal } from "@/lib/auth/identity";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function publishServiceAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    await publishService(principal, formData.get("serviceId") as string);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}

export async function unpublishServiceAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    await unpublishService(principal, formData.get("serviceId") as string);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}
