import "server-only";
import { getPrisma } from "@platform/db";
import { getServerEnv } from "@platform/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = getServerEnv();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getServerEnv().STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${error instanceof Error ? error.message : "unknown error"}`,
      },
      { status: 400 },
    );
  }

  const db = getPrisma();

  try {
    await db.$transaction(async (tx) => {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status && session.payment_status !== "unpaid") {
            const invoiceId = session.metadata?.invoiceId;
            if (invoiceId) {
              await tx.invoice.updateMany({
                where: { id: invoiceId, status: { not: "PAID" } },
                data: { status: "PAID", paidAt: new Date() },
              });
            }
          }
          break;
        }
        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object as Stripe.Checkout.Session;
          const invoiceId = session.metadata?.invoiceId;
          if (invoiceId) {
            await tx.invoice.updateMany({
              where: { id: invoiceId, status: { not: "PAID" } },
              data: { status: "PAID", paidAt: new Date() },
            });
          }
          break;
        }
        case "checkout.session.async_payment_failed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const invoiceId = session.metadata?.invoiceId;
          if (invoiceId) {
            await tx.invoice.updateMany({
              where: { id: invoiceId },
              data: { status: "OVERDUE" },
            });
          }
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const localInvoiceId = invoice.metadata?.invoiceId;
          if (localInvoiceId) {
            await tx.invoice.updateMany({
              where: { id: localInvoiceId, status: { not: "PAID" } },
              data: { status: "PAID", paidAt: new Date() },
            });
            const existingPayment = await tx.payment.findFirst({
              where: { invoiceId: localInvoiceId },
            });
            if (!existingPayment && invoice.amount_paid && invoice.currency) {
              await tx.payment.create({
                data: {
                  invoiceId: localInvoiceId,
                  amount: invoice.amount_paid / 100,
                  currency: invoice.currency.toUpperCase(),
                  status: "succeeded",
                },
              });
            }
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const localInvoiceId = invoice.metadata?.invoiceId;
          if (localInvoiceId) {
            await tx.invoice.updateMany({
              where: { id: localInvoiceId },
              data: { status: "OVERDUE" },
            });
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await tx.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: subscription.status,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              currentPeriodStart: (subscription as any).current_period_start
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  new Date((subscription as any).current_period_start * 1000)
                : null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              currentPeriodEnd: (subscription as any).current_period_end
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  new Date((subscription as any).current_period_end * 1000)
                : null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            },
          });
          break;
        }
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          await tx.stripeConnectedAccount.updateMany({
            where: { accountId: account.id },
            data: {
              capabilities: account.capabilities as unknown as Parameters<
                typeof tx.stripeConnectedAccount.update
              >[0]["data"]["capabilities"],
              requirements: account.requirements as unknown as Parameters<
                typeof tx.stripeConnectedAccount.update
              >[0]["data"]["requirements"],
              detailsSubmitted: account.details_submitted,
            },
          });
          break;
        }
      }
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Webhook handler failed: ${error instanceof Error ? error.message : "unknown error"}`,
      },
      { status: 500 },
    );
  }
}
