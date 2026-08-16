import { getTranslations } from "next-intl/server";

import { RequestForm, type RequestFormCopy } from "@/components/portal/RequestForm";
import { getRequest } from "@/lib/data/serviceRequests";
import { getCurrentPrincipal } from "@/lib/identity";
import { saveRequestAction } from "../../actions";

export default async function EditRequestPage({
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
          action={saveRequestAction.bind(null, locale, requestId)}
          copy={copy}
          initial={initial}
        />
      </div>
    </section>
  );
}
