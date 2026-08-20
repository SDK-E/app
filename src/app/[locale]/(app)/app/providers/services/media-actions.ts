"use server";

import { revalidatePath } from "next/cache";

import {
  addServiceMediaAsset,
  removeServiceMediaAsset,
  getServiceMediaAssets,
} from "@/lib/providers/services/media";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { addMediaAssetSchema } from "@/lib/providers/services/schemas";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function addServiceMediaAssetAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const parsed = addMediaAssetSchema.safeParse({
    name: formData.get("name"),
    storageKey: formData.get("storageKey"),
    mimeType: formData.get("mimeType"),
    sizeBytes: Number(formData.get("sizeBytes")),
    kind: formData.get("kind"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await addServiceMediaAsset(principal, formData.get("serviceId") as string, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}

export async function removeServiceMediaAssetAction(
  _state: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    await removeServiceMediaAsset(principal, formData.get("mediaAssetId") as string);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/providers/services");
  return { success: true };
}

export async function getServiceMediaAssetsAction(serviceId: string) {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getServiceMediaAssets(principal, serviceId);
}
