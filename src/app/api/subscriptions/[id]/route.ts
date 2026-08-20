import "server-only";

import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { requireCompanyContext } from "@/lib/auth/authorization";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { stripe } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subscription = await getPrisma().subscription.findFirst({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    requireCompanyContext(principal, subscription.companyId, "invoice:view");

    let live: Record<string, unknown> | null = null;
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );
      live = {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodStart: (stripeSubscription as any).current_period_start,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodEnd: (stripeSubscription as any).current_period_end,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      };
    } catch {
      live = null;
    }

    return NextResponse.json({ subscription, live }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication is required")) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message.includes("Cross-company access is denied")) {
      return NextResponse.json({ error: "Cross-company access is denied." }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Missing permission:")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Subscription could not be fetched." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subscription = await getPrisma().subscription.findFirst({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    requireCompanyContext(principal, subscription.companyId, "invoice:view");

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await getPrisma().subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication is required")) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message.includes("Cross-company access is denied")) {
      return NextResponse.json({ error: "Cross-company access is denied." }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Missing permission:")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Subscription could not be cancelled." },
      { status: 500 }
    );
  }
}
