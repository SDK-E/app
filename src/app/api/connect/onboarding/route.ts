import "server-only";

import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { requireProviderPrincipal } from "@/lib/auth/authorization";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import type { ProviderPrincipal } from "@/types";
import { stripe } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }

    requireProviderPrincipal(principal);

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const returnUrl = typeof body.returnUrl === "string" ? body.returnUrl : "";
    const refreshUrl = typeof body.refreshUrl === "string" ? body.refreshUrl : "";

    if (!returnUrl || !refreshUrl) {
      return NextResponse.json(
        { error: "returnUrl and refreshUrl are required." },
        { status: 400 }
      );
    }

    const connectedAccount = await getPrisma().stripeConnectedAccount.findUnique({
      where: { userId: (principal as ProviderPrincipal).providerId },
    });

    if (!connectedAccount) {
      return NextResponse.json(
        { error: "No connected account found for this provider." },
        { status: 404 }
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: connectedAccount.accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication is required")) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message.includes("Provider access is required")) {
      return NextResponse.json({ error: "Provider access is required." }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onboarding link could not be created." },
      { status: 500 }
    );
  }
}
