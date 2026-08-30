"use server";

import { getCurrentPrincipal } from "@platform/auth/identity";
import { publishService, unpublishService } from "@platform/providers/services/publishing";
import { revalidatePath } from "next/cache";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

export async function publishServiceAction(
  _state: ServiceActionState,
  formData: FormData,
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
  formData: FormData,
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

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}
