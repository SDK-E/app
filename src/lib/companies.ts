import { randomBytes } from "node:crypto";

import { AuthorizationError } from "@/lib/authorization";
import { getPrisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { AppPrincipal } from "@/types";

export function buildCompanySlug(name: string, suffix = randomBytes(3).toString("hex")): string {
  const base = slugify(name).slice(0, 80) || "company";
  return `${base}-${suffix}`;
}

export function generateAccessCode(): string {
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export async function createOwnedCompany(principal: AppPrincipal, name: string) {
  if (principal.kind !== "unassigned") {
    throw new AuthorizationError(403, "FORBIDDEN", "Only unassigned users can create a company.");
  }
  return getPrisma().$transaction(async (transaction) => {
    const user = await transaction.user.findUniqueOrThrow({
      where: { id: principal.id },
      include: { memberships: true },
    });
    if (user.sdkStaffRole || user.memberships.length > 0 || !user.isActive) {
      throw new AuthorizationError(
        403,
        "FORBIDDEN",
        "This account already has an assignment or is inactive."
      );
    }
    return transaction.company.create({
      data: {
        name,
        slug: buildCompanySlug(name),
        accessCode: generateAccessCode(),
        memberships: {
          create: { userId: user.id, role: "OWNER", joinedAt: new Date() },
        },
      },
      include: { memberships: true },
    });
  });
}
