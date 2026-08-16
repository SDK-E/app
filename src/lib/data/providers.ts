import { Prisma } from "@/generated/prisma/client";

import { AuthorizationError, requireActiveServiceProvider, requirePermission, requireServiceProvider } from "@/lib/authorization";
import { getPrisma } from "@/lib/db";
import { encryptSensitiveValue } from "@/lib/sensitiveData";
import type { AppPrincipal } from "@/types";

import { providerApplicationSchema, providerInvoiceSchema, providerProfileSchema, timeEntrySchema } from "../providerSchemas";

function forbidden(message: string): never {
  throw new AuthorizationError(403, "FORBIDDEN", message);
}

async function audit(actorId: string | null, providerId: string | null, entityType: string, entityId: string, action: string, metadata?: Prisma.InputJsonValue) {
  await getPrisma().providerAuditEvent.create({ data: { actorId, providerId, entityType, entityId, action, metadata } });
}

export async function submitProviderApplication(raw: unknown) {
  const input = providerApplicationSchema.parse(raw);
  const duplicate = await getPrisma().providerApplication.findFirst({
    where: { email: input.email, rejectedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new Error("An active application already exists for this email address.");
  return getPrisma().providerApplication.create({
    data: {
      email: input.email,
      name: input.name,
      countryCode: input.countryCode,
      professionalHeadline: input.professionalHeadline,
      profileSummary: input.profileSummary,
      portfolioUrl: input.portfolioUrl || null,
      privacyAcceptedAt: new Date(),
    },
  });
}

export async function getProviderDashboard(principal: AppPrincipal) {
  const provider = requireServiceProvider(principal);
  return getPrisma().serviceProviderProfile.findUniqueOrThrow({
    where: { id: provider.providerId },
    select: {
      id: true,
      status: true,
      legalName: true,
      professionalHeadline: true,
      requirements: { select: { id: true, label: true, status: true, expiresAt: true }, orderBy: { createdAt: "asc" } },
      assignments: {
        where: { status: { in: ["INVITED", "ACTIVE", "PAUSED"] } },
        select: { id: true, roleTitle: true, status: true, project: { select: { id: true, name: true, status: true } }, company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      invoices: { select: { id: true, supplierInvoiceNumber: true, total: true, currency: true, status: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

export async function updateOwnProviderProfile(principal: AppPrincipal, raw: unknown) {
  const provider = requireServiceProvider(principal);
  if (!["ONBOARDING", "UNDER_REVIEW", "ACTIVE"].includes(provider.status)) forbidden("This provider profile cannot be changed.");
  const input = providerProfileSchema.parse(raw);
  const updated = await getPrisma().serviceProviderProfile.update({
    where: { id: provider.providerId },
    data: {
      legalName: input.legalName,
      tradingName: input.tradingName || null,
      professionalHeadline: input.professionalHeadline,
      professionalEmail: input.professionalEmail,
      professionalPhone: input.professionalPhone || null,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      postalCode: input.postalCode,
      countryCode: input.countryCode,
      taxResidenceCode: input.taxResidenceCode,
      registrationIdEncrypted: encryptSensitiveValue(input.registrationId),
      taxIdEncrypted: encryptSensitiveValue(input.taxId),
      vatIdEncrypted: input.vatId ? encryptSensitiveValue(input.vatId) : null,
      payoutDetailsEncrypted: encryptSensitiveValue(input.payoutDetails),
      declarations: input.declarations,
      status: "UNDER_REVIEW",
      submittedAt: new Date(),
    },
  });
  await audit(principal.id, provider.providerId, "provider", provider.providerId, "PROFILE_SUBMITTED");
  return updated;
}

export async function listProviderApplications(principal: AppPrincipal) {
  requirePermission(principal, "provider:view");
  return getPrisma().providerApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function reviewProviderStatus(principal: AppPrincipal, providerId: string, status: "ACTIVE" | "SUSPENDED" | "REJECTED" | "ARCHIVED") {
  requirePermission(principal, "provider:review");
  const provider = await getPrisma().serviceProviderProfile.findUniqueOrThrow({ where: { id: providerId }, include: { requirements: true } });
  if (status === "ACTIVE" && provider.requirements.some(requirement => !["VERIFIED", "WAIVED"].includes(requirement.status))) {
    throw new Error("Every compliance requirement must be verified or waived before activation.");
  }
  const updated = await getPrisma().serviceProviderProfile.update({
    where: { id: providerId },
    data: { status, approvedAt: status === "ACTIVE" ? new Date() : provider.approvedAt, suspendedAt: status === "SUSPENDED" ? new Date() : null },
  });
  await audit(principal.id, providerId, "provider", providerId, `STATUS_${status}`);
  return updated;
}

export async function listProviderProjects(principal: AppPrincipal) {
  const provider = requireActiveServiceProvider(principal);
  return getPrisma().providerAssignment.findMany({
    where: { providerId: provider.providerId, status: { in: ["ACTIVE", "PAUSED"] } },
    select: {
      id: true, roleTitle: true, status: true, startsOn: true, endsOn: true,
      company: { select: { name: true } },
      project: { select: { id: true, name: true, description: true, status: true, startDate: true, dueDate: true, milestones: { select: { id: true, name: true, description: true, status: true, dueDate: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTimeEntry(principal: AppPrincipal, raw: unknown) {
  const provider = requireActiveServiceProvider(principal);
  const input = timeEntrySchema.parse(raw);
  const assignment = await getPrisma().providerAssignment.findFirst({ where: { id: input.assignmentId, providerId: provider.providerId, status: "ACTIVE" }, include: { project: { select: { milestones: { select: { id: true } } } } } });
  if (!assignment) forbidden("This assignment is not available.");
  if (input.milestoneId && !assignment.project.milestones.some(item => item.id === input.milestoneId)) forbidden("This milestone is not part of the assigned project.");
  return getPrisma().timeEntry.create({ data: { ...input, milestoneId: input.milestoneId ?? null } });
}

export async function submitTimeEntry(principal: AppPrincipal, timeEntryId: string) {
  const provider = requireActiveServiceProvider(principal);
  return getPrisma().$transaction(async tx => {
    const entry = await tx.timeEntry.findFirst({ where: { id: timeEntryId, assignment: { providerId: provider.providerId } }, include: { assignment: true } });
    if (!entry || !["DRAFT", "CHANGES_REQUIRED"].includes(entry.status)) forbidden("This time entry cannot be submitted.");
    const status = entry.assignment.clientTimeApprovalRequired ? "CLIENT_REVIEW" : "SDK_REVIEW";
    const updated = await tx.timeEntry.update({ where: { id: entry.id }, data: { status, submittedAt: new Date() } });
    await tx.providerAuditEvent.create({ data: { actorId: principal.id, providerId: provider.providerId, entityType: "time-entry", entityId: entry.id, action: "SUBMITTED" } });
    return updated;
  });
}

export async function reviewTimeEntry(principal: AppPrincipal, timeEntryId: string, decision: "APPROVE" | "CHANGES_REQUIRED" | "REJECT", notes?: string) {
  const permission = principal.kind === "client" ? "provider:time:view" : "provider:time:review";
  if (principal.kind === "client") {
    if (!principal.companyId) forbidden("Client access is required.");
  } else requirePermission(principal, permission);
  const entry = await getPrisma().timeEntry.findUniqueOrThrow({ where: { id: timeEntryId }, include: { assignment: true } });
  if (principal.kind === "client") {
    if (entry.assignment.companyId !== principal.companyId || entry.status !== "CLIENT_REVIEW") forbidden("This time entry is not available for client review.");
    const status = decision === "APPROVE" ? "SDK_REVIEW" : decision === "REJECT" ? "REJECTED" : "CHANGES_REQUIRED";
    return getPrisma().timeEntry.update({ where: { id: entry.id }, data: { status, clientReviewedAt: new Date(), reviewNotes: notes } });
  }
  if (entry.status !== "SDK_REVIEW") forbidden("This time entry is not ready for SDK review.");
  const status = decision === "APPROVE" ? "APPROVED" : decision === "REJECT" ? "REJECTED" : "CHANGES_REQUIRED";
  return getPrisma().timeEntry.update({ where: { id: entry.id }, data: { status, sdkReviewedAt: new Date(), reviewedBy: principal.id, reviewNotes: notes } });
}

export async function createProviderInvoice(principal: AppPrincipal, raw: unknown) {
  const provider = requireActiveServiceProvider(principal);
  const input = providerInvoiceSchema.parse(raw);
  return getPrisma().$transaction(async tx => {
    const assignment = await tx.providerAssignment.findFirst({ where: { id: input.assignmentId, providerId: provider.providerId, status: "ACTIVE" } });
    if (!assignment) forbidden("This assignment is not available.");
    const timeEntries = await tx.timeEntry.findMany({ where: { id: { in: input.timeEntryIds }, assignmentId: assignment.id, status: "APPROVED", invoiceLine: null } });
    if (timeEntries.length !== input.timeEntryIds.length) throw new Error("Every selected time entry must be approved and uninvoiced.");
    if (assignment.compensationType === "FIXED_FEE" && timeEntries.length) throw new Error("Fixed-fee assignments cannot invoice time entries.");
    const unitRate = assignment.rateAmount;
    const timeLines = timeEntries.map(entry => {
      const quantity = assignment.compensationType === "DAILY"
        ? new Prisma.Decimal(entry.durationMinutes).div(new Prisma.Decimal(60 * Number(assignment.unitsPerDay ?? 8)))
        : new Prisma.Decimal(entry.durationMinutes).div(60);
      return { type: "TIME" as const, description: entry.description.slice(0, 500), quantity, unitAmount: unitRate, netAmount: quantity.mul(unitRate), timeEntryId: entry.id };
    });
    const fixedLines = input.fixedFeeMilestoneIds.map(milestoneId => ({ type: "FIXED_FEE" as const, description: "Fixed-fee milestone", quantity: new Prisma.Decimal(1), unitAmount: unitRate, netAmount: unitRate, milestoneId }));
    if (fixedLines.length && assignment.compensationType !== "FIXED_FEE") throw new Error("Only fixed-fee assignments can invoice milestones.");
    const adjustmentLines = input.adjustments.map(item => ({ type: "ADJUSTMENT" as const, description: item.description, quantity: new Prisma.Decimal(item.quantity), unitAmount: new Prisma.Decimal(item.unitAmount), netAmount: new Prisma.Decimal(item.quantity).mul(item.unitAmount), adjustmentReason: item.reason }));
    const lines = [...timeLines, ...fixedLines, ...adjustmentLines];
    if (!lines.length) throw new Error("An invoice must contain at least one line.");
    const subtotal = lines.reduce((sum, line) => sum.add(line.netAmount), new Prisma.Decimal(0));
    const taxAmount = new Prisma.Decimal(input.taxAmount);
    const profile = await tx.serviceProviderProfile.findUniqueOrThrow({ where: { id: provider.providerId } });
    return tx.providerInvoice.create({
      data: {
        providerId: provider.providerId,
        assignmentId: assignment.id,
        supplierInvoiceNumber: input.supplierInvoiceNumber,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        currency: assignment.currency,
        subtotal,
        taxAmount,
        total: subtotal.add(taxAmount),
        providerLegalSnapshot: { legalName: profile.legalName, tradingName: profile.tradingName, countryCode: profile.countryCode },
        sdkBillingEntitySnapshot: { name: "SDK Enterprises" },
        lines: { create: lines },
      },
      include: { lines: true },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function submitProviderInvoice(principal: AppPrincipal, invoiceId: string) {
  const provider = requireActiveServiceProvider(principal);
  return getPrisma().providerInvoice.update({ where: { id: invoiceId, providerId: provider.providerId, status: { in: ["DRAFT", "CHANGES_REQUIRED"] } }, data: { status: "SUBMITTED", submittedAt: new Date() } });
}

export async function reviewProviderInvoice(principal: AppPrincipal, invoiceId: string, decision: "APPROVE" | "CHANGES_REQUIRED" | "REJECT", notes?: string) {
  requirePermission(principal, "provider:invoice:review");
  return getPrisma().$transaction(async tx => {
    const invoice = await tx.providerInvoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true } });
    if (invoice.status !== "SUBMITTED") forbidden("This invoice is not ready for review.");
    const status = decision === "APPROVE" ? "APPROVED" : decision === "REJECT" ? "REJECTED" : "CHANGES_REQUIRED";
    if (status === "APPROVED") {
      const ids = invoice.lines.flatMap(line => line.timeEntryId ? [line.timeEntryId] : []);
      await tx.timeEntry.updateMany({ where: { id: { in: ids }, status: "APPROVED" }, data: { status: "INVOICED" } });
    }
    return tx.providerInvoice.update({ where: { id: invoice.id }, data: { status, reviewerNotes: notes, reviewedBy: principal.id, approvedAt: status === "APPROVED" ? new Date() : null } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
