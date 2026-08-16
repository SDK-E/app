import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ActionForm } from "@/components/portal/ActionForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getRequest } from "@/lib/data/serviceRequests";
import { getCurrentPrincipal } from "@/lib/identity";
import { acceptProposalAction, replyAction } from "../actions";

const control =
  "mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-4 py-3 text-body outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; requestId: string }>;
}) {
  const [{ locale, requestId }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind !== "client") return null;
  const [request, t] = await Promise.all([
    getRequest(principal, requestId),
    getTranslations({ locale, namespace: "portal.requests" }),
  ]);
  const converted = request.projects[0];
  return (
    <article>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-h1 font-extrabold">{request.title}</h1>
          <p className="mt-3 text-body text-muted-foreground">
            {t("createdBy", { name: request.submittedByUser.name })}
          </p>
        </div>
        <Badge tone={request.status === "INFORMATION_REQUIRED" ? "live" : "neutral"}>
          {converted ? t("converted") : t(`statuses.${request.status}`)}
        </Badge>
      </div>
      {request.status === "DRAFT" ? (
        <Link
          href={`/${locale}/app/requests/${request.id}/edit`}
          className="mt-6 inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-label font-extrabold uppercase tracking-eyebrow text-dark"
        >
          {t("editAndSubmit")}
        </Link>
      ) : null}
      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-h3 font-extrabold">{t("details")}</h2>
            <dl className="mt-5 space-y-4 text-body">
              <div>
                <dt className="font-semibold">{t("form.capability")}</dt>
                <dd className="text-muted-foreground">{t(`capabilities.${request.capability}`)}</dd>
              </div>
              <div>
                <dt className="font-semibold">{t("form.description")}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {request.description}
                </dd>
              </div>
              {request.businessContext ? (
                <div>
                  <dt className="font-semibold">{t("form.businessContext")}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {request.businessContext}
                  </dd>
                </div>
              ) : null}
              {request.supportingInformation ? (
                <div>
                  <dt className="font-semibold">{t("form.supportingInformation")}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {request.supportingInformation}
                  </dd>
                </div>
              ) : null}
              {request.supportingLinks.length ? (
                <div>
                  <dt className="font-semibold">{t("form.supportingLinks")}</dt>
                  <dd className="mt-2 space-y-1">
                    {request.supportingLinks.map((link) => (
                      <a
                        key={link}
                        className="block break-all underline"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link}
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>
          <Card>
            <h2 className="text-h3 font-extrabold">{t("conversation")}</h2>
            <div className="mt-5 space-y-4">
              {request.messages.map((item) => (
                <div key={item.id} className="border-t border-line pt-4">
                  <p className="text-body font-semibold">{item.author.name}</p>
                  <p className="mt-1 whitespace-pre-wrap text-body text-muted-foreground">
                    {item.content}
                  </p>
                </div>
              ))}
              {!request.messages.length ? (
                <p className="text-body text-muted-foreground">{t("noMessages")}</p>
              ) : null}
            </div>
          </Card>
          {request.status === "INFORMATION_REQUIRED" ? (
            <Card>
              <ActionForm
                action={replyAction.bind(null, locale, request.id)}
                buttonLabel={t("reply")}
                pendingLabel={t("form.working")}
              >
                <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                  {t("reply")}
                  <textarea className={control} name="content" rows={5} required />
                </label>
              </ActionForm>
            </Card>
          ) : null}
          {request.status === "PROPOSAL_READY" ? (
            <Card>
              <ActionForm
                action={acceptProposalAction.bind(null, locale, request.id)}
                buttonLabel={t("accept")}
                pendingLabel={t("form.working")}
              />
            </Card>
          ) : null}
        </div>
        <Card>
          <h2 className="text-h3 font-extrabold">{t("history")}</h2>
          <ol className="mt-5 space-y-4">
            {request.activities.map((item) => (
              <li key={item.id} className="border-l border-line pl-4 text-body">
                <p className="font-semibold">{item.type.replaceAll("_", " ").toLowerCase()}</p>
                <p className="text-muted-foreground">
                  {item.actor.name} ·{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(item.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </article>
  );
}
