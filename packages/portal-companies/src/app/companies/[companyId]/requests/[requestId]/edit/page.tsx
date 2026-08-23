import { getTranslations } from "next-intl/server";

import {
  RequestForm,
  type RequestFormCopy,
} from "@sdk-e/portal-shell/components/portal/RequestForm";
import { getRequest } from "@sdk-e/requests";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { renderForPage } from "@sdk-e/portal-shell/lib/render-for-page";
import { saveRequestAction } from "@sdk-e/portal-shell/app/companies/[companyId]/requests/actions";

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string; requestId: string }>;
}) {
  const [{ locale, companyId, requestId }, principal] = await Promise.all([
    params,
    getCurrentPrincipal(),
  ]);
  if (!principal || principal.kind !== "client") return null;
  const [request, t] = await Promise.all([
    renderForPage(() => getRequest(principal, requestId, companyId), locale),
    getTranslations({ locale, namespace: "portal.requests" }),
  ]);
  if (request.status !== "DRAFT") throw new Error("Only draft requests can be edited.");
  const copy = {
    ...(t.raw("form") as Omit<RequestFormCopy, "capabilities">),
    capabilities: t.raw("capabilities") as Record<string, string>,
  };
  const initial = {
    title: request.title,
    capability: request.capability,
    description: request.description,
    businessContext: request.businessContext,
    supportingInformation: request.supportingInformation,
    supportingLinks: request.supportingLinks,
  };
  return (
    <section>
      <h1 className="text-h1 font-extrabold">{request.title}</h1>
      <div className="mt-10">
        <RequestForm
          action={saveRequestAction.bind(null, locale, companyId, requestId)}
          copy={copy}
          initial={initial}
        />
      </div>
    </section>
  );
}
