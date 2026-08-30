import type { Prisma } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

import { notFound, requireCompanyPageContext, tenantWhere } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { requireActiveCompany } from "@platform/requests/guards";

export const requestDetailInclude = {
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

export async function getRequest(principal: AppPrincipal, id: string, companyId: string) {
  const ctx = requireCompanyPageContext(principal, companyId, "request:view");
  await requireActiveCompany(ctx.principal, ctx.companyId);
  const request = await getPrisma().request.findFirst({
    where: tenantWhere(ctx.principal, { id }, companyId),
    include: requestDetailInclude,
  });
  return request ?? notFound("Request not found.");
}

export async function listRequests(principal: AppPrincipal, companyId?: string) {
  const ctx = requireCompanyPageContext(principal, companyId ?? "", "request:view");
  await requireActiveCompany(ctx.principal, ctx.companyId);
  return getPrisma().request.findMany({
    where: { companyId: ctx.companyId },
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
