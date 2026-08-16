import type { SessionData } from "@auth0/nextjs-auth0/types";
import { z } from "zod";

import { prisma } from "@/lib/db";
import type { AppPrincipal, ClientRole, SdkStaffRole } from "@/types";

const auth0IdentitySchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
  picture: z.string().url().optional(),
});

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
  isActive: true,
  sdkStaffRole: true,
  memberships: {
    select: {
      role: true,
      company: { select: { id: true, name: true, isActive: true } },
    },
  },
} as const;

export async function resolveAppPrincipal(session: SessionData): Promise<AppPrincipal> {
  const parsed = auth0IdentitySchema.safeParse(session.user);
  if (!parsed.success) {
    throw new IdentityError("INVALID_IDENTITY", "The Auth0 identity is missing required claims.");
  }

  const identity = parsed.data;
  const user = await prisma.user.upsert({
    where: { auth0Sub: identity.sub },
    create: {
      auth0Sub: identity.sub,
      email: identity.email,
      name: identity.name ?? identity.email,
      avatarUrl: identity.picture ?? null,
      lastLoginAt: new Date(),
    },
    update: {
      email: identity.email,
      name: identity.name ?? identity.email,
      avatarUrl: identity.picture ?? null,
      lastLoginAt: new Date(),
    },
    select: principalSelect,
  });

  if (!user.isActive) {
    throw new IdentityError("INACTIVE_USER", "This application user is inactive.");
  }

  const membership = user.memberships[0];
  if (user.sdkStaffRole && membership) {
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
  };

  if (user.sdkStaffRole) {
    return { ...common, kind: "sdk-staff", role: user.sdkStaffRole as SdkStaffRole };
  }

  if (membership) {
    if (!membership.company.isActive) {
      throw new IdentityError("INACTIVE_USER", "This client company is inactive.");
    }
    return {
      ...common,
      kind: "client",
      companyId: membership.company.id,
      companyName: membership.company.name,
      role: membership.role as ClientRole,
    };
  }

  return { ...common, kind: "unassigned" };
}

export async function getCurrentPrincipal(): Promise<AppPrincipal | null> {
  const { getAuth0Client } = await import("@/lib/auth");
  const session = await getAuth0Client().getSession();
  return session ? resolveAppPrincipal(session) : null;
}
