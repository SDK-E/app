import { getTranslations } from "next-intl/server";

import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import type { QualityFrameworkItem } from "@/components/marketing/QualityFramework";

export async function getHowWeWorkPageData(locale: string) {
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "howWeWorkPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const entryPaths = (t.raw("entryPaths.items") as ProblemNavigatorItem[]).map((item) => ({
    ...item,
    href: "#process",
  }));
  const process = t.raw("process.items") as ProcessTimelineItem[];
  const responsibility = t.raw("responsibility.items") as QualityFrameworkItem[];
  const quality = t.raw("quality.items") as QualityFrameworkItem[];
  const scopeSteps = t.raw("scope.steps") as string[];

  return { t, tNav, entryPaths, process, responsibility, quality, scopeSteps };
}
