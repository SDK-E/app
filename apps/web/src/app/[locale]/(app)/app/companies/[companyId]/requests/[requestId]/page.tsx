import { getTranslations } from "next-intl/server";

import { RequestActionPanels } from "@/components/portal/requests/RequestActionPanels";
import { RequestConversationCard } from "@/components/portal/requests/RequestConversationCard";
import { RequestDetailsCard } from "@/components/portal/requests/RequestDetailsCard";
import { RequestHeader } from "@/components/portal/requests/RequestHeader";
import { RequestHistoryCard } from "@/components/portal/requests/RequestHistoryCard";
import { getRequest } from "@sdk-e/requests";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { renderForPage } from "@/lib/app/render-for-page";

export default async function CompanyRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string; requestId: string }>;
}) {
  const [{ locale, companyId, requestId }, principal] = await Promise.all([
    params,
    getCurrentPrincipal(),
  ]);
  if (!principal || principal.kind === "unassigned") return null;
  const [request, tr, t] = await Promise.all([
    renderForPage(() => getRequest(principal, requestId, companyId), locale),
    getTranslations({ locale, namespace: "portal.requests" }),
    getTranslations({ locale, namespace: "portal.operations" }),
  ]);
  return (
    <article>
      <RequestHeader
        locale={locale}
        request={request}
        t={tr}
        eyebrow={t("title")}
        submittedByName={request.submittedByUser.name}
      />
      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <RequestDetailsCard request={request} t={tr} />
          <RequestConversationCard request={request} t={tr} />
          <RequestHistoryCard locale={locale} request={request} t={tr} />
        </div>
        <aside>
          <RequestActionPanels
            locale={locale}
            companyId={companyId}
            request={request}
            principal={principal}
            staffT={t}
            clientT={tr}
          />
        </aside>
      </div>
    </article>
  );
}
