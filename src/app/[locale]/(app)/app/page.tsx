import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/Card";
import { listActiveCompanies } from "@/lib/requests";
import { getCurrentPrincipal } from "@/lib/auth/identity";

export const metadata: Metadata = {
  title: "Portal | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function AppHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  if (principal.kind === "client") {
    const first = principal.memberships[0];
    if (!first) redirect(`/${locale}/app`);
    redirect(`/${locale}/app/companies/${first.companyId}`);
  }
  if (principal.kind !== "sdk-staff") return null;
  const t = await getTranslations({ locale, namespace: "portal" });
  const companies = principal.role === "FINANCE" ? [] : await listActiveCompanies(principal);
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
        SDK
      </p>
      <h1 className="mt-4 text-h1 font-extrabold">{t("operations.title")}</h1>
      <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">{t("operations.intro")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <Link key={company.id} href={`/${locale}/app/companies/${company.id}/requests`}>
            <Card className="transition-colors hover:border-dark">
              <h2 className="text-h3 font-extrabold">{company.name}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t("operations.companies")}</p>
            </Card>
          </Link>
        ))}
      </div>
      {companies.length === 0 ? (
        <p className="mt-8 text-body text-muted-foreground">{t("operations.none")}</p>
      ) : null}
    </section>
  );
}
