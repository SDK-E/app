import { getCurrentPrincipal } from "@platform/auth/identity";
import { saveRequestAction } from "@platform/portal-shell/app/companies/[companyId]/requests/actions";
import {
  RequestForm,
  type RequestFormCopy,
} from "@platform/portal-shell/components/portal/RequestForm";
import { renderForPage } from "@platform/portal-shell/lib/render-for-page";
import { getRequest } from "@platform/requests";
import { getTranslations } from "next-intl/server";

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
