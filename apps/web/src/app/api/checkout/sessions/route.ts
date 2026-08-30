import "server-only";
import { requireCompanyContext } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { getPrisma } from "@platform/db";
import { getServerEnv } from "@platform/env";
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

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
    const mode = body.mode === "subscription" ? "subscription" : "payment";

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required." }, { status: 400 });
    }

    const ctx = requireCompanyContext(principal, invoiceId, "invoice:view");

    const invoice = await getPrisma().invoice.findFirst({
      where: { id: invoiceId, companyId: ctx.companyId },
      include: { company: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    let customer = await getPrisma().stripeCustomer.findUnique({
      where: { companyId: ctx.companyId },
    });

    if (!customer) {
      const stripeCustomer = await stripe.customers.create({
        email: principal.email,
        metadata: { companyId: ctx.companyId },
      });

      customer = await getPrisma().stripeCustomer.create({
        data: {
          companyId: ctx.companyId,
          stripeCustomerId: stripeCustomer.id,
          email: stripeCustomer.email || principal.email,
        },
      });
    }

    const amount = Number(invoice.amount);
    const currency = invoice.currency.toLowerCase();
    const baseUrl = (getServerEnv().AUTH0_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customer.stripeCustomerId,
      metadata: { invoiceId: invoice.id },
      success_url: `${baseUrl}/app/invoices/${invoice.id}?status=paid`,
      cancel_url: `${baseUrl}/app/invoices/${invoice.id}?status=cancelled`,
      line_items:
        mode === "subscription"
          ? [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: `Subscription for ${invoice.company.name}`,
                  },
                  unit_amount: Math.round(amount * 100),
                  recurring: { interval: "month" },
                },
              },
            ]
          : [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: `Invoice ${invoice.id}`,
                  },
                  unit_amount: Math.round(amount * 100),
                },
              },
            ],
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication is required")) {
      return NextResponse.json(
        { error: "Your session has ended. Sign in and try again." },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message.includes("Cross-company access is denied")) {
      return NextResponse.json({ error: "Cross-company access is denied." }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Missing permission:")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout session could not be created." },
      { status: 500 },
    );
  }
}
