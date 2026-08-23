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
import { listOpportunities } from "@sdk-e/opportunities/queries";
import { listProviderInvitations } from "@sdk-e/opportunities/invitations";
import type { OpportunityPublicRecord } from "@sdk-e/opportunities/safe";

export const metadata: Metadata = {
  title: "Opportunities | SDK Enterprises",
  robots: { index: false, follow: false },
};

function formatDate(locale: string, value: Date | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export default async function OpportunitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal) return null;

  const t = await getTranslations({ locale, namespace: "portal.opportunities" });

  const [opportunities, invitations] = await renderForPage(async () => {
    requireProviderPrincipal(principal);
    return Promise.all([
      listOpportunities(principal, "", {}) as Promise<OpportunityPublicRecord[]>,
      listProviderInvitations(principal),
    ]);
  }, locale);

  const pendingByOpportunity = new Map(
    invitations
      .filter((invitation) => invitation.status === "PENDING")
      .map((invitation) => [invitation.opportunityId, invitation])
  );

  return (
    <section className="max-w-5xl">
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("browse.eyebrow")}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-h1 font-extrabold">{t("browse.title")}</h1>
        <Link
          href={`/${locale}/app/opportunities/invitations`}
          className="text-label font-extrabold uppercase tracking-eyebrow underline decoration-brand decoration-2 underline-offset-4 hover:opacity-80"
        >
          {t("browse.viewInvitations")}
        </Link>
      </div>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("browse.intro")}</p>

      {opportunities.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={t("browse.emptyTitle")}
          description={t("browse.emptyBody")}
        />
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {opportunities.map((opportunity) => {
            const invitation = pendingByOpportunity.get(opportunity.id);
            const visibilityLabel = t(`visibility.${opportunity.visibilityMode}`);
            return (
              <Card key={opportunity.id} className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={invitation ? "live" : "neutral"}>
                    {invitation ? t("browse.invited") : visibilityLabel}
                  </Badge>
                  <Badge tone="review">{t(`statuses.${opportunity.status}`)}</Badge>
                </div>
                <h2 className="mt-4 text-h3 font-extrabold">{opportunity.title}</h2>
                <p className="mt-3 text-body line-clamp-4">{opportunity.description}</p>
                {opportunity.requiredSkills.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {opportunity.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-control border border-line px-2 py-1 text-micro font-extrabold uppercase tracking-widest"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
                <dl className="mt-4 space-y-1 text-body">
                  {opportunity.clientIdentityVisible &&
                  (opportunity as OpportunityPublicRecord & { clientName?: string | null })
                    .clientName ? (
                    <div className="flex gap-2">
                      <dt className="font-semibold">{t("browse.client")}:</dt>
                      <dd>
                        {
                          (opportunity as OpportunityPublicRecord & { clientName?: string | null })
                            .clientName
                        }
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <dt className="font-semibold">{t("browse.deadline")}:</dt>
                    <dd>{formatDate(locale, opportunity.deadline) ?? t("browse.noDeadline")}</dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-line pt-5">
                  <OpportunityCardActions
                    opportunityId={opportunity.id}
                    invitationId={invitation?.id}
                    invitationStatus={invitation?.status ?? null}
                    providerAction={opportunity.providerAction ?? null}
                    saveLabel={t("browse.save")}
                    savedLabel={t("browse.saved")}
                    hideLabel={t("browse.hide")}
                    acceptLabel={t("browse.accept")}
                    declineLabel={t("browse.decline")}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
