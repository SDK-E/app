import type { Prisma, RequestActivityType, RequestStatus } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import {
  hasPermission,
  notFound,
  requireClientPrincipal,
  requireCompanyAccess,
  requirePermission,
  requireSdkStaff,
  tenantWhere,
} from "@/lib/authorization";
import type { RequestDraftInput, SdkRequestDecision } from "@/lib/schemas/serviceRequest";
import type { AppPrincipal, AssignedPrincipal, Permission } from "@/types";

const requestDetailInclude = {
  submittedByUser: { select: { id: true, name: true } },
  reviewedByUser: { select: { id: true, name: true } },
  projects: { select: { id: true, name: true, status: true }, take: 1 },
  messages: {
    where: { status: { not: "DELETED" as const } },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  activities: {
    select: {
      id: true,
      type: true,
      fromStatus: true,
      toStatus: true,
      createdAt: true,
      actor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.RequestInclude;

function scope(principal: AppPrincipal, permission: Permission) {
  return requirePermission(principal, permission);
}

function companyScope(principal: AssignedPrincipal, companyId?: string) {
  return requireCompanyAccess(principal, companyId);
}

async function requireActiveCompany(principal: AssignedPrincipal, companyId: string) {
  if (principal.kind === "client") return;
  const company = await getPrisma().company.findFirst({
    where: { id: companyId, isActive: true },
    select: { id: true },
  });
  if (!company) notFound("Company not found.");
}

function activity(
  companyId: string,
  actorId: string,
  type: RequestActivityType,
  fromStatus?: RequestStatus,
  toStatus?: RequestStatus
) {
  return { companyId, actorId, type, fromStatus, toStatus };
}

export function resolveSdkTransition(
  current: RequestStatus,
  decision: SdkRequestDecision
): {
  toStatus: RequestStatus;
  event: RequestActivityType;
  content?: string;
} | null {
  if (decision.decision === "start-review" && current === "SUBMITTED")
    return { toStatus: "IN_REVIEW", event: "REVIEW_STARTED" };
  if (decision.decision === "request-information" && current === "IN_REVIEW")
    return {
      toStatus: "INFORMATION_REQUIRED",
      event: "INFORMATION_REQUESTED",
      content: decision.content,
    };
  if (decision.decision === "proposal-ready" && current === "IN_REVIEW")
    return { toStatus: "PROPOSAL_READY", event: "PROPOSAL_READY", content: decision.content };
  if (
    decision.decision === "reject" &&
    ["SUBMITTED", "IN_REVIEW", "INFORMATION_REQUIRED", "PROPOSAL_READY"].includes(current)
  )
    return { toStatus: "REJECTED", event: "REJECTED", content: decision.content };
  return null;
}

export function groupInvoiceTotals(
  invoices: ReadonlyArray<{
    amount: { toString(): string } | number;
    currency: string;
    status: string;
  }>
) {
  return invoices.reduce<Record<string, { sent: number; overdue: number }>>((totals, invoice) => {
    const row = totals[invoice.currency] ?? { sent: 0, overdue: 0 };
    if (invoice.status === "OVERDUE") row.overdue += Number(invoice.amount);
    else if (invoice.status === "SENT") row.sent += Number(invoice.amount);
    totals[invoice.currency] = row;
    return totals;
  }, {});
}

export async function listRequests(principal: AppPrincipal, requestedCompanyId?: string) {
  const assigned = scope(principal, "request:view");
  const companyId = companyScope(assigned, requestedCompanyId);
  await requireActiveCompany(assigned, companyId);
  return getPrisma().request.findMany({
    where: { companyId },
    select: {
      id: true,
      title: true,
      capability: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      projects: { select: { id: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRequest(principal: AppPrincipal, id: string, requestedCompanyId?: string) {
  const assigned = scope(principal, "request:view");
  const companyId = companyScope(assigned, requestedCompanyId);
  await requireActiveCompany(assigned, companyId);
  const request = await getPrisma().request.findFirst({
    where: tenantWhere(assigned, { id }, requestedCompanyId),
    include: requestDetailInclude,
  });
  return request ?? notFound("Request not found.");
}

export async function createRequestDraft(principal: AppPrincipal, input: RequestDraftInput) {
  scope(principal, "request:create");
  const client = requireClientPrincipal(principal);
  return getPrisma().request.create({
    data: {
      companyId: client.companyId,
      submittedBy: client.id,
      ...input,
      activities: { create: activity(client.companyId, client.id, "CREATED", undefined, "DRAFT") },
    },
  });
}

export async function updateRequestDraft(
  principal: AppPrincipal,
  id: string,
  input: RequestDraftInput
) {
  const client = requireClientPrincipal(principal);
  scope(client, "request:update");
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId: client.companyId } });
    if (!current) notFound("Request not found.");
    if (current.status !== "DRAFT") throw new Error("Only draft requests can be edited.");
    const updated = await tx.request.update({ where: { id }, data: input });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(client.companyId, client.id, "UPDATED") },
    });
    return updated;
  });
}

export async function submitRequest(principal: AppPrincipal, id: string, input: RequestDraftInput) {
  const client = requireClientPrincipal(principal);
  scope(client, "request:update");
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId: client.companyId } });
    if (!current) notFound("Request not found.");
    if (current.status !== "DRAFT") throw new Error("This request has already been submitted.");
    const updated = await tx.request.update({
      where: { id },
      data: { ...input, status: "SUBMITTED" },
    });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(client.companyId, client.id, "SUBMITTED", "DRAFT", "SUBMITTED"),
      },
    });
    return updated;
  });
}

export async function respondToInformationRequest(
  principal: AppPrincipal,
  id: string,
  content: string
) {
  const client = requireClientPrincipal(principal);
  scope(client, "request:update");
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId: client.companyId } });
    if (!current) notFound("Request not found.");
    if (current.status !== "INFORMATION_REQUIRED")
      throw new Error("This request is not waiting for information.");
    await tx.message.create({
      data: { companyId: client.companyId, requestId: id, authorId: client.id, content },
    });
    await tx.request.update({ where: { id }, data: { status: "IN_REVIEW" } });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(
          client.companyId,
          client.id,
          "INFORMATION_PROVIDED",
          "INFORMATION_REQUIRED",
          "IN_REVIEW"
        ),
      },
    });
  });
}

export async function acceptProposal(principal: AppPrincipal, id: string) {
  const client = requireClientPrincipal(principal);
  scope(client, "request:update");
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId: client.companyId } });
    if (!current) notFound("Request not found.");
    if (current.status !== "PROPOSAL_READY")
      throw new Error("This proposal is no longer available to accept.");
    await tx.request.update({ where: { id }, data: { status: "APPROVED", closedAt: null } });
    await tx.requestActivity.create({
      data: {
        requestId: id,
        ...activity(client.companyId, client.id, "ACCEPTED", "PROPOSAL_READY", "APPROVED"),
      },
    });
  });
}

export async function decideRequest(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  decision: SdkRequestDecision
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "request:update");
  await requireActiveCompany(staff, companyId);
  await getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({ where: { id, companyId } });
    if (!current) notFound("Request not found.");
    const transition = resolveSdkTransition(current.status, decision);
    if (!transition) throw new Error("That workflow action is no longer available.");
    const { toStatus, event, content } = transition;
    if (content)
      await tx.message.create({ data: { companyId, requestId: id, authorId: staff.id, content } });
    await tx.request.update({
      where: { id },
      data: {
        status: toStatus,
        reviewedBy: staff.id,
        reviewedAt: new Date(),
        closedAt: toStatus === "REJECTED" ? new Date() : null,
      },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, event, current.status, toStatus) },
    });
  });
}

export async function convertRequestToProject(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  input: { name: string; description: string }
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "project:create");
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId },
      include: { projects: { select: { id: true }, take: 1 } },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "APPROVED")
      throw new Error("Only accepted requests can become projects.");
    if (current.projects.length) throw new Error("This request is already linked to a project.");
    const project = await tx.project.create({
      data: { companyId, requestId: id, createdBy: staff.id, ...input },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, "CONVERTED_TO_PROJECT") },
    });
    return project;
  });
}

export async function listActiveCompanies(principal: AppPrincipal) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  return getPrisma().company.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getClientDashboard(principal: AppPrincipal) {
  const client = requireClientPrincipal(principal);
  requirePermission(client, "company:view");
  const prisma = getPrisma();
  const [requests, projects, invoices, recentActivity] = await Promise.all([
    prisma.request.findMany({
      where: { companyId: client.companyId, status: { notIn: ["CLOSED", "REJECTED"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.project.findMany({
      where: { companyId: client.companyId, status: { in: ["PLANNING", "ACTIVE", "ON_HOLD"] } },
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
        milestones: {
          where: { status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] } },
          select: { name: true, status: true, dueDate: true },
          orderBy: { dueDate: "asc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    hasPermission(client, "invoice:view")
      ? prisma.invoice.findMany({
          where: { companyId: client.companyId, status: { in: ["SENT", "OVERDUE"] } },
          select: { amount: true, currency: true, status: true, dueDate: true },
        })
      : Promise.resolve([]),
    prisma.requestActivity.findMany({
      where: { companyId: client.companyId },
      select: {
        id: true,
        type: true,
        createdAt: true,
        request: { select: { id: true, title: true } },
        actor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  const invoiceTotals = groupInvoiceTotals(invoices);
  return { requests, projects, invoices, invoiceTotals, recentActivity };
}
