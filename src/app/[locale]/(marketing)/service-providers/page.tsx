import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

import { submitProviderApplicationAction } from "./actions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "providers.meta" });
  return buildMetadata({ title: t("title"), description: t("description"), path: "/service-providers", locale });
}

const inputClass = "mt-2 min-h-11 w-full rounded-control border border-dark/40 bg-paper px-4 py-3 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";

export default async function ServiceProvidersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const [t, nav] = await Promise.all([getTranslations({ locale, namespace: "providers" }), getTranslations({ locale, namespace: "nav" })]);
  const action = submitProviderApplicationAction.bind(null, locale);
  return <div className="min-h-screen bg-light text-dark">
    <Header links={[{ label: nav("services"), href: "/services" }, { label: nav("work"), href: "/work" }, { label: nav("about"), href: "/about" }]} cta={{ label: nav("discussProject"), href: "/start-a-project" }} secondaryCta={{ label: nav("signIn"), href: `/${locale}/login` }} locale={locale} />
    <main>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-4 text-[40px] font-extrabold tracking-title md:text-title">{t("title")}</h1><p className="mt-5 max-w-[65ch] text-lead">{t("intro")}</p></div>
          <div className="rounded-card border border-line bg-paper p-6 md:p-8">
            {query.submitted === "1" ? <div><h2 className="text-h3 font-extrabold">{t("successTitle")}</h2><p className="mt-4 text-body text-muted-foreground">{t("successBody")}</p></div> : <form action={action} className="space-y-5">
              <h2 className="text-h3 font-extrabold">{t("form.title")}</h2>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.name")}<input className={inputClass} name="name" required maxLength={255} /></label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.email")}<input className={inputClass} name="email" type="email" required /></label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.country")}<input className={inputClass} name="countryCode" required minLength={2} maxLength={2} placeholder="FR" /></label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.headline")}<input className={inputClass} name="professionalHeadline" required maxLength={255} /></label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.summary")}<textarea className={inputClass} name="profileSummary" required minLength={20} maxLength={5000} rows={7} /></label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">{t("form.portfolio")}<input className={inputClass} name="portfolioUrl" type="url" /></label>
              <label className="flex items-start gap-3 text-body"><input className="mt-1 size-5" name="privacyAccepted" type="checkbox" required />{t("form.privacy")}</label>
              <Button type="submit">{t("form.submit")}</Button>
            </form>}
          </div>
        </div>
      </Section>
    </main>
  </div>;
}
