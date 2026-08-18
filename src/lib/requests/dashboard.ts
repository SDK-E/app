import {
  hasPermission,
  requireClientPrincipal,
  requireCompanyPageContext,
} from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import type { AppPrincipal } from "@/types";

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

export async function getClientDashboard(principal: AppPrincipal, companyId: string) {
  requireClientPrincipal(principal);
  const ctx = requireCompanyPageContext(principal, companyId, "company:view");
  const prisma = getPrisma();
  const [requests, projects, invoices, recentActivity] = await Promise.all([
    prisma.request.findMany({
      where: { companyId: ctx.companyId, status: { notIn: ["CLOSED", "REJECTED"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.project.findMany({
      where: { companyId: ctx.companyId, status: { in: ["PLANNING", "ACTIVE", "ON_HOLD"] } },
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
    hasPermission(ctx.principal, "invoice:view", ctx.companyId)
      ? prisma.invoice.findMany({
          where: { companyId: ctx.companyId, status: { in: ["SENT", "OVERDUE"] } },
          select: { amount: true, currency: true, status: true, dueDate: true },
        })
      : Promise.resolve([]),
    prisma.requestActivity.findMany({
      where: { companyId: ctx.companyId },
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
