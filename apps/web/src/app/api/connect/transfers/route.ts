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

    const providerAccountId =
      typeof body.providerAccountId === "string" ? body.providerAccountId : "";
    const amount = typeof body.amount === "number" ? body.amount : 0;
    const currency = typeof body.currency === "string" ? body.currency : "USD";
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";

    if (!providerAccountId || amount <= 0 || !currency) {
      return NextResponse.json(
        { error: "providerAccountId, amount, and currency are required." },
        { status: 400 },
      );
    }

    const connectedAccount = await getPrisma().stripeConnectedAccount.findUnique({
      where: { accountId: providerAccountId },
    });

    if (!connectedAccount) {
      return NextResponse.json({ error: "Connected account not found." }, { status: 404 });
    }

    if (!connectedAccount.capabilities || !connectedAccount.detailsSubmitted) {
      return NextResponse.json(
        { error: "Connected account is not fully set up." },
        { status: 400 },
      );
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      destination: providerAccountId,
    });

    const payment = await getPrisma().payment.create({
      data: {
        invoiceId: invoiceId || "",
        stripePaymentIntentId: transfer.id,
        amount,
        currency: currency.toUpperCase(),
        status: "succeeded",
        providerAccountId,
      },
    });

    return NextResponse.json({ transfer, payment }, { status: 201 });
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
      { error: error instanceof Error ? error.message : "Transfer could not be created." },
      { status: 500 },
    );
  }
}
