import { getTranslations } from "next-intl/server";

import type { QualityFrameworkItem } from "@/components/marketing/QualityFramework";

export async function getStartAProjectPageData(locale: string) {
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "enquiry" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const reasons = t.raw("reasons") as QualityFrameworkItem[];
  const nextSteps: QualityFrameworkItem[] = [1, 2, 3, 4].map((number) => ({
    number: `0${number}`,
    title: t(`nextStep${number}Title`),
    copy: t(`nextStep${number}Body`),
  }));

  return { t, tNav, reasons, nextSteps };
}
