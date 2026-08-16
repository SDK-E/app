import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/Card";
import { getCurrentPrincipal } from "@/lib/identity";

export const metadata: Metadata = { title: "Profile | SDK Enterprises", robots: { index: false, follow: false } };

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind === "unassigned") return null;
  const t = await getTranslations({ locale, namespace: "portal.profile" });
  const role = principal.kind === "service-provider" ? "service provider" : principal.role.replaceAll("_", " ").toLowerCase();
  return <section className="max-w-3xl">
    <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">{t("eyebrow")}</p>
    <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
    <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>
    <Card className="mt-10">
      <div className="flex items-center gap-5">
        {principal.avatarUrl ? <Image src={principal.avatarUrl} alt="" width={72} height={72} unoptimized className="size-18 rounded-full object-cover" /> : <span className="flex size-18 items-center justify-center rounded-full bg-dark text-h3 text-light">{principal.name.slice(0, 1).toUpperCase()}</span>}
        <div><h2 className="text-h3 font-extrabold">{principal.name}</h2><p className="mt-1 text-body text-muted-foreground">{principal.email}</p></div>
      </div>
      <dl className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
        <div><dt className="text-label font-extrabold uppercase tracking-eyebrow">{t("role")}</dt><dd className="mt-2 text-body capitalize">{role}</dd></div>
        <div><dt className="text-label font-extrabold uppercase tracking-eyebrow">{t("workspace")}</dt><dd className="mt-2 text-body">{principal.kind === "client" ? principal.companyName : "SDK Enterprises"}</dd></div>
        <div><dt className="text-label font-extrabold uppercase tracking-eyebrow">{t("language")}</dt><dd className="mt-2 text-body uppercase">{principal.preferredLocale}</dd></div>
        <div><dt className="text-label font-extrabold uppercase tracking-eyebrow">{t("status")}</dt><dd className="mt-2 text-body capitalize">{principal.kind === "service-provider" ? principal.status.replaceAll("_", " ").toLowerCase() : t("active")}</dd></div>
      </dl>
    </Card>
    <p className="mt-6 text-body text-muted-foreground">{t("identityNote")}</p>
  </section>;
}
