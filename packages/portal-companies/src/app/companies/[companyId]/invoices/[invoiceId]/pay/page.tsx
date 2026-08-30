import { requireCompanyContext } from "@platform/auth/authorization";
import { getCurrentPrincipal } from "@platform/auth/identity";
import { getPrisma } from "@platform/db";
import { renderForPage } from "@platform/portal-shell/lib/render-for-page";
import { redirect } from "next/navigation";

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
    (await params).locale,
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
    },
  );

  if (!response.ok) {
    redirect(
      `/${(await params).locale}/app/companies/${(await params).companyId}/invoices/${(await params).invoiceId}`,
    );
  }

  const data = (await response.json()) as { url?: string };

  if (data.url) {
    redirect(data.url);
  }

  redirect(
    `/${(await params).locale}/app/companies/${(await params).companyId}/invoices/${(await params).invoiceId}`,
  );
}
