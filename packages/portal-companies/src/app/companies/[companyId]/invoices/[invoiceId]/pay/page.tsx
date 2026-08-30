import { redirect } from "next/navigation";

import { getCurrentPrincipal } from "@sdk-e/auth/identity";
import { requireCompanyContext } from "@sdk-e/auth/authorization";
import { renderForPage } from "@sdk-e/portal-shell/lib/render-for-page";
import { getPrisma } from "@sdk-e/db";

interface PageProps {
  params: Promise<{ locale: string; companyId: string; invoiceId: string }>;
}

export default async function InvoicePayPage({ params }: PageProps) {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    redirect(`/${(await params).locale}/login`);
  }

  const ctx = await renderForPage(
    async () => {
      return requireCompanyContext(principal, (await params).companyId, "invoice:view");
    },
    (await params).locale
  );

  const invoice = await getPrisma().invoice.findFirst({
    where: { id: (await params).invoiceId, companyId: ctx.companyId },
  });

  if (!invoice) {
    redirect(`/${(await params).locale}/app/companies/${(await params).companyId}/invoices`);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/checkout/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: invoice.id }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    redirect(
      `/${(await params).locale}/app/companies/${(await params).companyId}/invoices/${(await params).invoiceId}`
    );
  }

  const data = (await response.json()) as { url?: string };

  if (data.url) {
    redirect(data.url);
  }

  redirect(
    `/${(await params).locale}/app/companies/${(await params).companyId}/invoices/${(await params).invoiceId}`
  );
}
