"use server";

import { getCurrentPrincipal } from "@platform/auth/identity";
import {
  addServiceMediaAsset,
  getServiceMediaAssets,
  removeServiceMediaAsset,
} from "@platform/providers/services/media";
import { addMediaAssetSchema } from "@platform/providers/services/schemas";
import { revalidatePath } from "next/cache";

export interface ServiceActionState {
  error?: string;
  success?: boolean;
}

export async function addServiceMediaAssetAction(
  _state: ServiceActionState,
  formData: FormData,
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

export async function getServiceMediaAssetsAction(serviceId: string) {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  return getServiceMediaAssets(principal, serviceId);
}

export async function removeServiceMediaAssetAction(
  _state: ServiceActionState,
  formData: FormData,
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

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}
