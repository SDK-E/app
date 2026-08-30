import type {
  OpportunityActivityType,
  OpportunityStatus,
  OpportunityVisibilityMode,
} from "@platform/db/client";

import { Prisma } from "@platform/db/client";

export interface AddAttachmentInput {
  name: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  opportunityPositionId?: null | string;
}

export interface CreateOpportunityInput {
  title: string;
  description: string;
  clientName?: null | string;
  ndaRequired?: boolean;
  clientIdentityVisible?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: null | string;
  engagementType?: null | string;
  budgetMin?: null | number | Prisma.Decimal | string;
  budgetMax?: null | number | Prisma.Decimal | string;
  currency?: string;
  duration?: null | string;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: null | string;
  languages?: string[];
  deliverables?: null | string;
  providerCount?: number;
  visibilityMode?: OpportunityVisibilityMode;
}

export interface OpportunityPositionInput {
  title: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: null | string;
  engagementType?: null | string;
  budgetMin?: null | number | Prisma.Decimal | string;
  budgetMax?: null | number | Prisma.Decimal | string;
  currency?: string;
  duration?: null | string;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: null | string;
  languages?: string[];
  deliverables?: null | string;
  providerCount?: number;
  internalNotes?: null | string;
  sortOrder?: number;
}

export interface UpdateOpportunityDraftInput {
  title?: string;
  description?: string;
  clientName?: null | string;
  ndaRequired?: boolean;
  clientIdentityVisible?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: null | string;
  engagementType?: null | string;
  budgetMin?: null | number | Prisma.Decimal | string;
  budgetMax?: null | number | Prisma.Decimal | string;
  currency?: string;
  duration?: null | string;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: null | string;
  languages?: string[];
  deliverables?: null | string;
  providerCount?: number;
}

export function buildOpportunityData(input: CreateOpportunityInput) {
  return {
    title: input.title,
    description: input.description,
    clientName: input.clientName ?? null,
    ndaRequired: input.ndaRequired ?? false,
    clientIdentityVisible: input.clientIdentityVisible ?? false,
    requiredSkills: input.requiredSkills ?? [],
    preferredSkills: input.preferredSkills ?? [],
    seniority: input.seniority ?? null,
    engagementType: input.engagementType ?? null,
    budgetMin: toDecimal(input.budgetMin),
    budgetMax: toDecimal(input.budgetMax),
    currency: input.currency ?? "USD",
    duration: input.duration ?? null,
    startDate: input.startDate ?? null,
    deadline: input.deadline ?? null,
    locationTimezone: input.locationTimezone ?? null,
    languages: input.languages ?? [],
    deliverables: input.deliverables ?? null,
    providerCount: input.providerCount ?? 1,
    visibilityMode: input.visibilityMode ?? "INVITE_ONLY",
  };
}

export function buildPositionData(input: OpportunityPositionInput) {
  return {
    title: input.title,
    description: input.description,
    requiredSkills: input.requiredSkills ?? [],
    preferredSkills: input.preferredSkills ?? [],
    seniority: input.seniority ?? null,
    engagementType: input.engagementType ?? null,
    budgetMin: toDecimal(input.budgetMin),
    budgetMax: toDecimal(input.budgetMax),
    currency: input.currency ?? "USD",
    duration: input.duration ?? null,
    startDate: input.startDate ?? null,
    deadline: input.deadline ?? null,
    locationTimezone: input.locationTimezone ?? null,
    languages: input.languages ?? [],
    deliverables: input.deliverables ?? null,
    providerCount: input.providerCount ?? 1,
    internalNotes: input.internalNotes ?? null,
    sortOrder: input.sortOrder ?? 0,
  };
}

export function opportunityActivity(
  companyId: string,
  actorId: string,
  type: OpportunityActivityType,
  extra: Partial<{
    fromStatus: OpportunityStatus;
    toStatus: OpportunityStatus;
    fromVisibility: OpportunityVisibilityMode;
    toVisibility: OpportunityVisibilityMode;
  }> = {},
) {
  return { companyId, actorId, type, ...extra };
}

export function toDecimal(
  value: null | number | Prisma.Decimal | string | undefined,
): null | Prisma.Decimal | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}
