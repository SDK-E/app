import { getCurrentPrincipal } from "@/lib/auth/identity";
import { requireCompanyContext } from "@/lib/auth/authorization";
import { renderForPage } from "@/lib/app/render-for-page";
import { getPrisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string; companyId: string }>;
}

export default async function SubscriptionsPage({ params }: PageProps) {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return null;
  }

  const subscriptions = await renderForPage(
    async () => {
      const ctx = requireCompanyContext(principal, (await params).companyId, "invoice:view");
      return getPrisma().subscription.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
      });
    },
    (await params).locale
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="">Manage recurring billing for this company.</p>
      </div>

      {subscriptions.length === 0 ? (
        <p className="">No subscriptions yet.</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{subscription.stripeSubscriptionId}</p>
                  <p className="text-sm">Status: {subscription.status}</p>
                </div>
                <div className="text-right text-sm">
                  {subscription.currentPeriodEnd && (
                    <p>Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-orange-600">Cancels at period end</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
