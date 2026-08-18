import type { SessionData } from "@auth0/nextjs-auth0/types";
import { cache } from "react";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import type { AppPrincipal, ClientRole, SdkStaffRole } from "@/types";

const auth0IdentitySchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
  picture: z.string().url().optional(),
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class IdentityError extends Error {
  constructor(
    public readonly code: "INVALID_IDENTITY" | "INACTIVE_USER" | "IDENTITY_CONFLICT",
    message: string
  ) {
    super(message);
    this.name = "IdentityError";
  }
}

const principalSelect = {
  id: true,
  auth0Sub: true,
  email: true,
  name: true,
  avatarUrl: true,
  preferredLocale: true,
  isActive: true,
  sdkStaffRole: true,
  memberships: {
    select: {
      role: true,
      company: { select: { id: true, name: true, isActive: true } },
    },
  },
} as const;

function isUniqueConstraintViolation(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function identityConflict(): IdentityError {
  return new IdentityError(
    "IDENTITY_CONFLICT",
    "This email is already registered to another SDK account. Sign in with the account that originally registered it."
  );
}

export async function resolveAppPrincipal(session: SessionData): Promise<AppPrincipal> {
  const parsed = auth0IdentitySchema.safeParse(session.user);
  if (!parsed.success) {
    throw new IdentityError("INVALID_IDENTITY", "The Auth0 identity is missing required claims.");
  }

  const identity = parsed.data;
  const db = getPrisma();
  const profile = {
    email: normalizeEmail(identity.email),
    name: identity.name ?? identity.email,
    avatarUrl: identity.picture ?? null,
    lastLoginAt: new Date(),
  };

  let user;
  try {
    user = await db.user.upsert({
      where: { auth0Sub: identity.sub },
      create: { auth0Sub: identity.sub, ...profile },
      update: profile,
      select: principalSelect,
    });
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) {
      throw error;
    }
    // Two concurrent first logins for the same Auth0 identity can race on the
    // upsert. Re-resolve by the identity key only, never by email: the email
    // belongs to a different account, that is a real identity conflict.
    const existing = await db.user.findUnique({
      where: { auth0Sub: identity.sub },
      select: { id: true },
    });
    if (!existing) {
      throw identityConflict();
    }
    try {
      user = await db.user.update({
        where: { id: existing.id },
        data: profile,
        select: principalSelect,
      });
    } catch (updateError) {
      if (!isUniqueConstraintViolation(updateError)) {
        throw updateError;
      }
      throw identityConflict();
    }
  }

  if (!user.isActive) {
    throw new IdentityError("INACTIVE_USER", "This application user is inactive.");
  }

  if (user.sdkStaffRole && user.memberships.length > 0) {
    throw new IdentityError(
      "IDENTITY_CONFLICT",
      "An SDK staff user cannot also have a client-company membership."
    );
  }

  const common = {
    id: user.id,
    auth0Sub: user.auth0Sub,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    preferredLocale: user.preferredLocale,
  };

  if (user.sdkStaffRole) {
    return { ...common, kind: "sdk-staff", role: user.sdkStaffRole as SdkStaffRole };
  }

  const memberships = user.memberships
    .filter((membership) => membership.company.isActive)
    .map((membership) => ({
      companyId: membership.company.id,
      companyName: membership.company.name,
      role: membership.role as ClientRole,
    }));

  if (memberships.length > 0) {
    return { ...common, kind: "client", memberships };
  }

  return { ...common, kind: "unassigned" };
}

export const getCurrentPrincipal = cache(async (): Promise<AppPrincipal | null> => {
  const { getAuth0Client } = await import("@/lib/auth");
  const session = await getAuth0Client().getSession();
  return session ? resolveAppPrincipal(session) : null;
});
