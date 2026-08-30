import { getTranslations } from "next-intl/server";

import type { QualityFrameworkItem } from "./QualityFramework";

export async function getAboutPageData(locale: string) {
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "aboutPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const modelItems = t.raw("model.items") as QualityFrameworkItem[];
  const selectionItems = t.raw("selection.items") as QualityFrameworkItem[];
  const responsibilities = t.raw("responsibility.items") as string[];
  return { t, tNav, modelItems, selectionItems, responsibilities };
}
