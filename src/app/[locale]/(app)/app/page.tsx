import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getClientDashboard, listActiveCompanies } from "@/lib/data/serviceRequests";
import { getCurrentPrincipal } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Portal | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function AppHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  const t = await getTranslations({ locale, namespace: "portal" });
  if (principal.kind === "sdk-staff") {
    const companies = principal.role === "FINANCE" ? [] : await listActiveCompanies(principal);
    return <section><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">SDK</p><h1 className="mt-4 text-h1 font-extrabold">{t("operations.title")}</h1><p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("operations.intro")}</p><div className="mt-8 grid gap-4 md:grid-cols-2">{companies.map((company) => <Link key={company.id} href={`/${locale}/app/companies/${company.id}/requests`}><Card className="transition-colors hover:border-dark"><h2 className="text-h3 font-extrabold">{company.name}</h2><p className="mt-2 text-body text-muted-foreground">{t("operations.companies")}</p></Card></Link>)}</div>{companies.length === 0 ? <p className="mt-8 text-body text-muted-foreground">{t("operations.none")}</p> : null}</section>;
  }
  const data = await getClientDashboard(principal);
  const attention = data.requests.filter((request) => request.status === "INFORMATION_REQUIRED");
  const overdue = data.invoices.filter((invoice) => invoice.status === "OVERDUE");
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">{t("dashboard.eyebrow")}</p>
      <h1 className="mt-4 max-w-4xl text-h1 font-extrabold">{t("dashboard.title")}</h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("dashboard.intro")}</p>
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Card><h2 className="text-h3 font-extrabold">{t("dashboard.attention")}</h2><div className="mt-5 space-y-3">{attention.map((request) => <Link key={request.id} href={`/${locale}/app/requests/${request.id}`} className="block border-t border-line pt-3 text-body font-semibold underline-offset-4 hover:underline">{request.title} — {t("dashboard.informationNeeded")}</Link>)}{overdue.length ? <p className="border-t border-line pt-3 text-body font-semibold">{t("dashboard.overdueInvoice")}</p> : null}{!attention.length && !overdue.length ? <p className="text-body text-muted-foreground">{t("dashboard.noAttention")}</p> : null}</div></Card>
        <Card><h2 className="text-h3 font-extrabold">{t("dashboard.activeWork")}</h2><div className="mt-5 space-y-4">{data.projects.map((project) => <div key={project.id} className="border-t border-line pt-3"><div className="flex items-center justify-between gap-3"><p className="text-body font-semibold">{project.name}</p><Badge>{project.status.replaceAll("_", " ")}</Badge></div>{project.milestones[0] ? <p className="mt-2 text-body text-muted-foreground">{project.milestones[0].name}</p> : null}</div>)}{!data.projects.length ? <p className="text-body text-muted-foreground">{t("dashboard.noProjects")}</p> : null}</div></Card>
        <Card><div className="flex items-center justify-between gap-4"><h2 className="text-h3 font-extrabold">{t("dashboard.openRequests")}</h2><Link className="text-label font-extrabold uppercase tracking-eyebrow underline" href={`/${locale}/app/requests`}>{t("dashboard.viewRequests")}</Link></div><div className="mt-5 space-y-3">{data.requests.map((request) => <Link key={request.id} href={`/${locale}/app/requests/${request.id}`} className="flex items-center justify-between gap-3 border-t border-line pt-3"><span className="text-body font-semibold">{request.title}</span><Badge tone={request.status === "INFORMATION_REQUIRED" ? "live" : "neutral"}>{t(`requests.statuses.${request.status}`)}</Badge></Link>)}{!data.requests.length ? <p className="text-body text-muted-foreground">{t("dashboard.noRequests")}</p> : null}</div></Card>
        <Card><h2 className="text-h3 font-extrabold">{t("dashboard.invoices")}</h2><div className="mt-5 space-y-3">{Object.entries(data.invoiceTotals).map(([currency, totals]) => <div key={currency} className="border-t border-line pt-3 text-body"><p className="font-semibold">{currency} {new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(totals.sent + totals.overdue)}</p><p className="text-muted-foreground">{t("dashboard.overdue")}: {currency} {new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(totals.overdue)}</p></div>)}{!Object.keys(data.invoiceTotals).length ? <p className="text-body text-muted-foreground">{t("dashboard.noInvoices")}</p> : null}</div></Card>
        <Card><h2 className="text-h3 font-extrabold">{t("dashboard.recentActivity")}</h2><div className="mt-5 space-y-3">{data.recentActivity.map((item) => <Link key={item.id} href={`/${locale}/app/requests/${item.request.id}`} className="block border-t border-line pt-3 text-body"><span className="font-semibold">{item.request.title}</span><span className="block text-muted-foreground">{item.type.replaceAll("_", " ").toLowerCase()} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(item.createdAt)}</span></Link>)}{!data.recentActivity.length ? <p className="text-body text-muted-foreground">{t("dashboard.noActivity")}</p> : null}</div></Card>
        <Card><h2 className="text-h3 font-extrabold">{t("dashboard.next")}</h2><p className="mt-5 text-body text-muted-foreground">{attention.length ? t("dashboard.informationNeeded") : t("dashboard.nextDefault")}</p><Link href={`/${locale}/app/requests/new`} className="mt-5 inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-label font-extrabold uppercase tracking-eyebrow text-dark">{t("dashboard.newRequest")}</Link></Card>
      </div>
    </section>
  );
}
