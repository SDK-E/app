"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuth0Client } from "@/lib/auth/auth0";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { acceptInvitation } from "@/lib/users";

export interface InvitationActionState {
  error?: string;
}

const claimsSchema = z.object({
  email: z.string().email(),
});

export async function acceptInvitationAction(
  locale: string,
  token: string,
  _state: InvitationActionState,
  _formData: FormData
): Promise<InvitationActionState> {
  void _state;
  void _formData;
  const [session, principal] = await Promise.all([
    getAuth0Client().getSession(),
    getCurrentPrincipal(),
  ]);
  if (!session || !principal) return { error: "Sign in to accept this invitation." };
  const claims = claimsSchema.safeParse(session.user);
  if (!claims.success)
    return {
      error: "Your Auth0 profile does not include the details needed to accept this invitation.",
    };
  try {
    await acceptInvitation({
      token,
      userId: principal.id,
      email: claims.data.email,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The invitation could not be accepted.",
    };
  }
  redirect(`/${locale}/app`);
}
