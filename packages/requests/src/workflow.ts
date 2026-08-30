import type { RequestDraftInput } from "@platform/schemas/serviceRequest";
import type { AppPrincipal } from "@platform/types";

import { notFound, requireClientPrincipal } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { activity, resolveCompanyContext } from "@platform/requests/guards";

export async function acceptProposal(principal: AppPrincipal, companyId: string, id: string) {
  const client = requireClientPrincipal(principal);
  const ctx = await resolveCompanyContext(client, companyId, "request:update");
  const actorId = client.id;
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "PROPOSAL_READY")
      throw new Error("This proposal is no longer available to accept.");
    await tx.request.update({ where: { id }, data: { status: "APPROVED", closedAt: null } });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(ctx.companyId, actorId, "ACCEPTED", "PROPOSAL_READY", "APPROVED"),
      },
    });
  });
}

export async function createRequestDraft(
  principal: AppPrincipal,
  companyId: string,
  input: RequestDraftInput,
) {
  const client = requireClientPrincipal(principal);
  const ctx = await resolveCompanyContext(client, companyId, "request:create");
  const submittedBy = client.id;
  return getPrisma().request.create({
    data: {
      companyId: ctx.companyId,
      submittedBy,
      ...input,
      activities: { create: activity(ctx.companyId, submittedBy, "CREATED", undefined, "DRAFT") },
    },
  });
}

export async function respondToInformationRequest(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  content: string,
) {
  const client = requireClientPrincipal(principal);
  const ctx = await resolveCompanyContext(client, companyId, "request:update");
  const actorId = client.id;
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "INFORMATION_REQUIRED")
      throw new Error("This request is not waiting for information.");
    await tx.message.create({
      data: { companyId: ctx.companyId, requestId: id, authorId: actorId, content },
    });
    await tx.request.update({ where: { id }, data: { status: "IN_REVIEW" } });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(
          ctx.companyId,
          actorId,
          "INFORMATION_PROVIDED",
          "INFORMATION_REQUIRED",
          "IN_REVIEW",
        ),
      },
    });
  });
}

export async function submitRequest(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  input: RequestDraftInput,
) {
  const client = requireClientPrincipal(principal);
  const ctx = await resolveCompanyContext(client, companyId, "request:update");
  const actorId = client.id;
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "DRAFT") throw new Error("This request has already been submitted.");
    const updated = await tx.request.update({
      where: { id },
      data: { ...input, status: "SUBMITTED" },
    });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(ctx.companyId, actorId, "SUBMITTED", "DRAFT", "SUBMITTED"),
      },
    });
    return updated;
  });
}

export async function updateRequestDraft(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  input: RequestDraftInput,
) {
  const client = requireClientPrincipal(principal);
  const ctx = await resolveCompanyContext(client, companyId, "request:update");
  const actorId = client.id;
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "DRAFT") throw new Error("Only draft requests can be edited.");
    const updated = await tx.request.update({ where: { id }, data: input });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(ctx.companyId, actorId, "UPDATED") },
    });
    return updated;
  });
}
