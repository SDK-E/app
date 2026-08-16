import { getTranslations } from "next-intl/server";

import { RequestForm, type RequestFormCopy } from "@/components/portal/RequestForm";
import { saveRequestAction } from "../actions";

export default async function NewRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portal.requests" });
  const copy = { ...(t.raw("form") as Omit<RequestFormCopy, "capabilities">), capabilities: t.raw("capabilities") as Record<string, string> };
  return <section><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-4 text-h1 font-extrabold">{t("new")}</h1><div className="mt-10"><RequestForm action={saveRequestAction.bind(null, locale, null)} copy={copy} /></div></section>;
}

