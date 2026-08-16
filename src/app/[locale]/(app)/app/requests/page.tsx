import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentPrincipal } from "@/lib/identity";
import { listRequests } from "@/lib/data/serviceRequests";

export default async function RequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind !== "client") return null;
  const [requests, t] = await Promise.all([
    listRequests(principal),
    getTranslations({ locale, namespace: "portal.requests" }),
  ]);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-h1 font-extrabold">{t("title")}</h1>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>
        </div>
        <Link
          href={`/${locale}/app/requests/new`}
          className="inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-label font-extrabold uppercase tracking-eyebrow text-dark"
        >
          {t("new")}
        </Link>
      </div>
      <div className="mt-10 space-y-4">
        {requests.map((request) => (
          <Link key={request.id} href={`/${locale}/app/requests/${request.id}`}>
            <Card className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-dark">
              <div>
                <h2 className="text-h3 font-extrabold">{request.title}</h2>
                <p className="mt-2 text-body text-muted-foreground">
                  {t(`capabilities.${request.capability}`)}
                </p>
              </div>
              <Badge tone={request.status === "INFORMATION_REQUIRED" ? "live" : "neutral"}>
                {request.projects.length ? t("converted") : t(`statuses.${request.status}`)}
              </Badge>
            </Card>
          </Link>
        ))}
        {!requests.length ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyBody")}
            action={
              <Link className="underline" href={`/${locale}/app/requests/new`}>
                {t("new")}
              </Link>
            }
          />
        ) : null}
      </div>
    </section>
  );
}
