import { hasPermission } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { saveRequestAction } from "@platform/portal-shell/app/companies/[companyId]/requests/actions";
import {
  RequestForm,
  type RequestFormCopy,
} from "@platform/portal-shell/components/portal/RequestForm";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function NewRequestPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  const [{ locale, companyId }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (
    !principal ||
    principal.kind !== "client" ||
    !hasPermission(principal, "request:create", companyId)
  ) {
    redirect(`/${locale}/app/companies/${companyId}/requests`);
  }
  const t = await getTranslations({ locale, namespace: "portal.requests" });
  const copy = {
    ...(t.raw("form") as Omit<RequestFormCopy, "capabilities">),
    capabilities: t.raw("capabilities") as Record<string, string>,
  };
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-h1 font-extrabold">{t("new")}</h1>
      <div className="mt-10">
        <RequestForm
          action={saveRequestAction.bind(null, locale, companyId, null)}
          copy={copy}
        />
      </div>
    </section>
  );
}
