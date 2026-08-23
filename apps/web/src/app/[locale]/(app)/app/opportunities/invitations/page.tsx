import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@sdk-e/ui/Badge";
import { Card } from "@sdk-e/ui/Card";
import { EmptyState } from "@sdk-e/ui/EmptyState";
import { OpportunityCardActions } from "@/components/portal/OpportunityCardActions";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { requireProviderPrincipal } from "@sdk-e/auth/authorization";
import { renderForPage } from "@/lib/app/render-for-page";
import { listProviderInvitations } from "@sdk-e/opportunities/invitations";

export const metadata: Metadata = {
  title: "Invitations | SDK Enterprises",
  robots: { index: false, follow: false },
};

function formatDate(locale: string, value: Date | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export default async function InvitationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal) return null;

  const t = await getTranslations({ locale, namespace: "portal.opportunities" });

  const invitations = await renderForPage(async () => {
    requireProviderPrincipal(principal);
    return listProviderInvitations(principal);
  }, locale);
  const pending = invitations.filter((invitation) => invitation.status === "PENDING");
  const history = invitations.filter((invitation) => invitation.status !== "PENDING");

  return (
    <section className="max-w-3xl">
      <p className="text-label font-extrabold uppercase tracking-eyebrow">
        {t("invitations.eyebrow")}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-h1 font-extrabold">{t("invitations.title")}</h1>
        <Link
          href={`/${locale}/app/opportunities`}
          className="text-label font-extrabold uppercase tracking-eyebrow underline decoration-brand decoration-2 underline-offset-4 hover:opacity-80"
        >
          {t("browse.eyebrow")}
        </Link>
      </div>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("invitations.intro")}</p>

      {pending.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={t("invitations.emptyTitle")}
          description={t("invitations.emptyBody")}
        />
      ) : (
        <div className="mt-10 grid gap-5">
          {pending.map((invitation) => (
            <Card key={invitation.id} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="live">{t("invitations.status.PENDING")}</Badge>
                <span className="text-body">
                  {t("invitations.expires", {
                    date: formatDate(locale, invitation.expiresAt) ?? "",
                  })}
                </span>
              </div>
              <h2 className="mt-4 text-h3 font-extrabold">{invitation.opportunity.title}</h2>
              <p className="mt-3 text-body line-clamp-4">{invitation.opportunity.description}</p>
              <div className="mt-6 border-t border-line pt-5">
                <OpportunityCardActions
                  opportunityId={invitation.opportunityId}
                  invitationId={invitation.id}
                  invitationStatus={invitation.status}
                  providerAction={null}
                  saveLabel={t("browse.save")}
                  savedLabel={t("browse.saved")}
                  hideLabel={t("browse.hide")}
                  acceptLabel={t("invitations.accept")}
                  declineLabel={t("invitations.decline")}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {history.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-h3 font-extrabold">{t("invitations.history")}</h2>
          <ul className="mt-5 divide-y divide-line rounded-card border border-line">
            {history.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="text-body font-semibold">{invitation.opportunity.title}</p>
                  <p className="text-micro uppercase tracking-eyebrow text-muted-foreground">
                    {formatDate(locale, invitation.respondedAt ?? invitation.createdAt)}
                  </p>
                </div>
                <Badge tone="neutral">{t(`invitations.status.${invitation.status}`)}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
