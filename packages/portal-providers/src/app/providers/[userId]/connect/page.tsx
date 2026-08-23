import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { requireProviderPrincipal } from "@sdk-e/auth/authorization";
import { renderForPage } from "@sdk-e/portal-shell/lib/render-for-page";
import { getPrisma } from "@sdk-e/db";

interface PageProps {
  params: Promise<{ locale: string; userId: string }>;
}

export default async function ProviderConnectPage({ params }: PageProps) {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return null;
  }

  const connectedAccount = await renderForPage(
    async () => {
      requireProviderPrincipal(principal);
      return getPrisma().stripeConnectedAccount.findUnique({
        where: { userId: (await params).userId },
      });
    },
    (await params).locale
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stripe Connect</h1>
        <p className="">Manage your Stripe Express account and payouts.</p>
      </div>

      {connectedAccount ? (
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Account ID: {connectedAccount.accountId}</p>
            <p className="text-sm">
              Status: {connectedAccount.detailsSubmitted ? "Active" : "Incomplete"}
            </p>
            <p className="text-sm">Type: {connectedAccount.type ?? "express"}</p>
          </div>

          <form action={`/${(await params).locale}/api/connect/onboarding`} method="post">
            <input
              type="hidden"
              name="returnUrl"
              value={`/${(await params).locale}/app/providers/${(await params).userId}/connect`}
            />
            <input
              type="hidden"
              name="refreshUrl"
              value={`/${(await params).locale}/app/providers/${(await params).userId}/connect`}
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              {connectedAccount.detailsSubmitted ? "Update Account Info" : "Complete Onboarding"}
            </button>
          </form>
        </div>
      ) : (
        <p className="">No Stripe Connect account linked.</p>
      )}
    </div>
  );
}
