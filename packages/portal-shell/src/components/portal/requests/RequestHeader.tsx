import type { RequestDetail, Translator } from "@platform/requests/types";

import { Badge } from "@platform/ui/Badge";
import Link from "next/link";

export async function RequestHeader({
  locale,
  request,
  t,
  eyebrow,
  submittedByName,
}: {
  locale: string;
  request: RequestDetail;
  t: Translator;
  eyebrow: string;
  submittedByName?: string;
}) {
  const converted = request.projects[0];
  return (
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div>
        <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-h1 font-extrabold">{request.title}</h1>
        <p className="mt-3 text-body text-muted-foreground">
          {submittedByName
            ? t("createdBy", { name: submittedByName })
            : t(`capabilities.${request.capability}`)}
        </p>
      </div>
      <Badge tone={request.status === "INFORMATION_REQUIRED" ? "live" : "neutral"}>
        {converted ? t("converted") : t(`statuses.${request.status}`)}
      </Badge>
      {request.status === "DRAFT" ? (
        <Link
          href={`/${locale}/app/companies/${request.companyId}/requests/${request.id}/edit`}
          className="mt-6 inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-label font-extrabold uppercase tracking-eyebrow text-dark"
        >
          {t("editAndSubmit")}
        </Link>
      ) : null}
    </div>
  );
}
