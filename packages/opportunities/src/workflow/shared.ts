import { Prisma } from "@sdk-e/db/client";
import type {
  OpportunityActivityType,
  OpportunityStatus,
  OpportunityVisibilityMode,
} from "@sdk-e/db/client";

export function toDecimal(
  value: Prisma.Decimal | number | string | null | undefined
): Prisma.Decimal | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
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
  }> = {}
) {
  return { companyId, actorId, type, ...extra };
}

export interface CreateOpportunityInput {
  title: string;
  description: string;
  clientName?: string | null;
  ndaRequired?: boolean;
  clientIdentityVisible?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: string | null;
  engagementType?: string | null;
  budgetMin?: Prisma.Decimal | number | string | null;
  budgetMax?: Prisma.Decimal | number | string | null;
  currency?: string;
  duration?: string | null;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: string | null;
  languages?: string[];
  deliverables?: string | null;
  providerCount?: number;
  visibilityMode?: OpportunityVisibilityMode;
}

export interface UpdateOpportunityDraftInput {
  title?: string;
  description?: string;
  clientName?: string | null;
  ndaRequired?: boolean;
  clientIdentityVisible?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: string | null;
  engagementType?: string | null;
  budgetMin?: Prisma.Decimal | number | string | null;
  budgetMax?: Prisma.Decimal | number | string | null;
  currency?: string;
  duration?: string | null;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: string | null;
  languages?: string[];
  deliverables?: string | null;
  providerCount?: number;
}

export interface OpportunityPositionInput {
  title: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: string | null;
  engagementType?: string | null;
  budgetMin?: Prisma.Decimal | number | string | null;
  budgetMax?: Prisma.Decimal | number | string | null;
  currency?: string;
  duration?: string | null;
  startDate?: Date | null;
  deadline?: Date | null;
  locationTimezone?: string | null;
  languages?: string[];
  deliverables?: string | null;
  providerCount?: number;
  internalNotes?: string | null;
  sortOrder?: number;
}

export interface AddAttachmentInput {
  name: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  opportunityPositionId?: string | null;
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
