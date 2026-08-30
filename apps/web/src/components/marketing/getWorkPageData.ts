import { getTranslations } from "next-intl/server";

import type { ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";

export async function getWorkPageData(locale: string) {
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "workPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const scenarios = t.raw("scenarios.items") as ScenarioStudyItem[];

  return { t, tNav, scenarios };
}
