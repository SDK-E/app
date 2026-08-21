"use server";

import { revalidatePath } from "next/cache";

import { getCurrentPrincipal } from "@/lib/auth/identity";
import { requireSdkStaff } from "@/lib/auth/authorization";
import {
  acceptOpportunityInvitation,
  declineOpportunityInvitation,
  expireOpportunityInvitations,
} from "@/lib/opportunities/invitations";
import { saveOpportunity, hideOpportunity } from "@/lib/opportunities/preferences";
import { listOpportunities } from "@/lib/opportunities/queries";
import type { ListOpportunitiesFilters } from "@/lib/opportunities/queries";

export interface OpportunityActionState {
  error?: string;
  success?: boolean;
}

export interface ExpireInvitationsActionState extends OpportunityActionState {
  expired?: number;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

function id(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value;
}

export async function saveOpportunityAction(
  _state: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const opportunityId = id(formData, "opportunityId");
  if (!opportunityId) return { error: "Missing opportunity." };
  try {
    await saveOpportunity(principal, opportunityId);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/opportunities");
  return { success: true };
}

export async function hideOpportunityAction(
  _state: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const opportunityId = id(formData, "opportunityId");
  if (!opportunityId) return { error: "Missing opportunity." };
  try {
    await hideOpportunity(principal, opportunityId);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/opportunities");
  return { success: true };
}

export async function acceptOpportunityInvitationAction(
  _state: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const invitationId = id(formData, "invitationId");
  if (!invitationId) return { error: "Missing invitation." };
  try {
    await acceptOpportunityInvitation(principal, invitationId);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/opportunities/invitations");
  revalidatePath("/app/opportunities");
  return { success: true };
}

export async function declineOpportunityInvitationAction(
  _state: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const invitationId = id(formData, "invitationId");
  if (!invitationId) return { error: "Missing invitation." };
  try {
    await declineOpportunityInvitation(principal, invitationId);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/app/opportunities/invitations");
  revalidatePath("/app/opportunities");
  return { success: true };
}

export async function expireOpportunityInvitationsAction(
  _state: ExpireInvitationsActionState,
  _formData: FormData
): Promise<ExpireInvitationsActionState> {
  void _state;
  void _formData;
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  try {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
    const expired = await expireOpportunityInvitations();
    revalidatePath("/app/opportunities/invitations");
    return { success: true, expired };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function listProviderOpportunitiesAction(filters: ListOpportunitiesFilters = {}) {
  const principal = await getCurrentPrincipal();
  if (!principal) return [];
  try {
    return await listOpportunities(principal, "", filters);
  } catch {
    return [];
  }
}
