import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listRequests } from "@/lib/data/serviceRequests";
import { getCurrentPrincipal } from "@/lib/identity";

export default async function CompanyRequestsPage({ params }: { params: Promise<{ locale: string; companyId: string }> }) {
  const [{ locale, companyId }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind !== "sdk-staff") return null;
  const [requests, t, tr] = await Promise.all([listRequests(principal, companyId), getTranslations({ locale, namespace: "portal.operations" }), getTranslations({ locale, namespace: "portal.requests" })]);
  return <section><h1 className="text-h1 font-extrabold">{t("title")}</h1><p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p><div className="mt-10 space-y-4">{requests.map((request) => <Link key={request.id} href={`/${locale}/app/companies/${companyId}/requests/${request.id}`}><Card className="flex items-center justify-between gap-4 transition-colors hover:border-dark"><div><h2 className="text-h3 font-extrabold">{request.title}</h2><p className="mt-2 text-body text-muted-foreground">{tr(`capabilities.${request.capability}`)}</p></div><Badge>{request.projects.length ? tr("converted") : tr(`statuses.${request.status}`)}</Badge></Card></Link>)}</div></section>;
}

