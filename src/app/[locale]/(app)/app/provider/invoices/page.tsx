import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireServiceProvider } from "@/lib/authorization";
import { getPrisma } from "@/lib/db";
import { getCurrentPrincipal } from "@/lib/identity";

export const metadata: Metadata = { title: "Supplier invoices | SDK Enterprises", robots: { index: false, follow: false } };

export default async function ProviderInvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal) return null;
  const provider = requireServiceProvider(principal);
  const invoices = await getPrisma().providerInvoice.findMany({ where: { providerId: provider.providerId }, include: { assignment: { include: { project: { select: { name: true } } } }, lines: true }, orderBy: { createdAt: "desc" } });
  return <section><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">Invoices payable by SDK</p><h1 className="mt-4 text-[32px] font-extrabold md:text-h1">Your supplier invoices.</h1><p className="mt-5 max-w-[65ch] text-body text-muted-foreground">These invoices are submitted to SDK Enterprises, never to the client.</p><div className="mt-10 space-y-4">{invoices.map(invoice => <Card key={invoice.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-h3 font-extrabold">{invoice.supplierInvoiceNumber}</h2><p className="mt-2 text-body text-muted-foreground">{invoice.assignment.project.name} · {invoice.issueDate.toLocaleDateString(locale)}</p></div><Badge>{invoice.status}</Badge></div><p className="mt-5 text-body font-semibold">{invoice.currency} {invoice.total.toString()}</p><p className="mt-1 text-body text-muted-foreground">{invoice.lines.length} line items</p></Card>)}{!invoices.length ? <p className="text-body text-muted-foreground">No supplier invoices yet. Approved time becomes available for invoicing.</p> : null}</div></section>;
}
