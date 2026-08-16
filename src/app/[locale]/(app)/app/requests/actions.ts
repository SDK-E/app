"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  acceptProposal,
  convertRequestToProject,
  createRequestDraft,
  decideRequest,
  respondToInformationRequest,
  submitRequest,
  updateRequestDraft,
} from "@/lib/data/serviceRequests";
import { getCurrentPrincipal } from "@/lib/identity";
import {
  projectConversionSchema,
  requestDraftSchema,
  requestReplySchema,
  requestSubmissionSchema,
  sdkRequestDecisionSchema,
} from "@/lib/schemas/serviceRequest";

export interface RequestActionState {
  error?: string;
}

function values(formData: FormData) {
  return {
    title: formData.get("title"),
    capability: formData.get("capability"),
    description: formData.get("description"),
    businessContext: formData.get("businessContext"),
    supportingInformation: formData.get("supportingInformation"),
    supportingLinks: String(formData.get("supportingLinks") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export async function saveRequestAction(
  locale: string,
  requestId: string | null,
  _state: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended. Sign in and try again." };
  const intent = formData.get("intent") === "submit" ? "submit" : "draft";
  const parsed = (intent === "submit" ? requestSubmissionSchema : requestDraftSchema).safeParse(
    values(formData)
  );
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check the request details." };
  let savedId: string;
  try {
    if (requestId) {
      const saved =
        intent === "submit"
          ? await submitRequest(principal, requestId, parsed.data)
          : await updateRequestDraft(principal, requestId, parsed.data);
      savedId = saved.id;
    } else {
      const draft = await createRequestDraft(principal, parsed.data);
      savedId = draft.id;
      if (intent === "submit") await submitRequest(principal, draft.id, parsed.data);
    }
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/requests/${savedId}`);
}

export async function replyAction(
  locale: string,
  requestId: string,
  _state: RequestActionState,
  formData: FormData
) {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended." };
  const parsed = requestReplySchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await respondToInformationRequest(principal, requestId, parsed.data.content);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/${locale}/app/requests/${requestId}`);
  return {};
}

export async function acceptProposalAction(
  locale: string,
  requestId: string,
  _state: RequestActionState,
  _formData: FormData
) {
  void _state;
  void _formData;
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended." };
  try {
    await acceptProposal(principal, requestId);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/${locale}/app/requests/${requestId}`);
  return {};
}

export async function sdkDecisionAction(
  locale: string,
  companyId: string,
  requestId: string,
  _state: RequestActionState,
  formData: FormData
) {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended." };
  const parsed = sdkRequestDecisionSchema.safeParse({
    decision: formData.get("decision"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await decideRequest(principal, companyId, requestId, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/${locale}/app/companies/${companyId}/requests/${requestId}`);
  return {};
}

export async function convertAction(
  locale: string,
  companyId: string,
  requestId: string,
  _state: RequestActionState,
  formData: FormData
) {
  const principal = await getCurrentPrincipal();
  if (!principal) return { error: "Your session has ended." };
  const parsed = projectConversionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await convertRequestToProject(principal, companyId, requestId, parsed.data);
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/${locale}/app/companies/${companyId}/requests/${requestId}`);
  return {};
}
