import "server-only";
import { requireSdkStaff } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { getPrisma } from "@platform/db";
import { stripe } from "@platform/payments/stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 },
      );
    }

    requireSdkStaff(principal, ["ADMIN", "FINANCE"]);

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const userId = typeof body.userId === "string" ? body.userId : "";
    const email = typeof body.email === "string" ? body.email : "";
    const country = typeof body.country === "string" ? body.country : "";
    const type = body.type === "custom" ? "custom" : "express";

    if (!userId || !email || !country) {
      return NextResponse.json(
        { error: "userId, email, and country are required." },
        { status: 400 },
      );
    }

    const user = await getPrisma().user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const existing = await getPrisma().stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Connected account already exists for this user." },
        { status: 409 },
      );
    }

    const account = await stripe.v2.core.accounts.create({
      country: body.country as string,
      contact_email: email,
      type: type as "custom" | "express",
      dashboard: "express",
      defaults: {
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await getPrisma().stripeConnectedAccount.create({
      data: {
        userId,
        accountId: account.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: (account as any).type || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        capabilities: (account as any).capabilities,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requirements: (account as any).requirements,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detailsSubmitted: (account as any).details_submitted,
      },
    });

    return NextResponse.json(
      {
        id: account.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: (account as any).type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detailsSubmitted: (account as any).details_submitted,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication is required")) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message.includes("SDK staff access is required")) {
      return NextResponse.json({ error: "SDK staff access is required." }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connected account could not be created." },
      { status: 500 },
    );
  }
}
