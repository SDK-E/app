import { localizePath } from "@platform/i18n";
import { getTranslations } from "next-intl/server";

import type { EngagementOption } from "@/components/marketing/EngagementComparison";
import type { HomeSystemMapItem } from "@/components/marketing/HomeSystemMap";
import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import type { QualityFrameworkItem } from "@/components/marketing/QualityFramework";
import type { ScenarioStudyItem } from "@/components/marketing/ScenarioStudy";

export async function getLandingPageData(locale: string) {
  const [t, tNav, tServices, tWork, tProcess, tAbout] = await Promise.all([
    getTranslations({ locale, namespace: "homePage" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "servicesPage" }),
    getTranslations({ locale, namespace: "workPage" }),
    getTranslations({ locale, namespace: "howWeWorkPage" }),
    getTranslations({ locale, namespace: "aboutPage" }),
  ]);

  const serviceAnchors = [
    "/services#modernization",
    "/services#platforms",
    "/services#ai-automation",
    "/services#production-systems",
    "/services#engagements",
  ].map((path) => localizePath(locale, path));

  const startingPoints = (tServices.raw("navigator.items") as ProblemNavigatorItem[]).map(
    (item, index) => ({ ...item, href: serviceAnchors[index] }),
  );
  const openingPrinciples = t.raw("opening.principles") as QualityFrameworkItem[];
  const systemItems = t.raw("system.items") as HomeSystemMapItem[];
  const scenarios = tWork.raw("scenarios.items") as ScenarioStudyItem[];
  const companyModel = tAbout.raw("model.items") as QualityFrameworkItem[];
  const engagementOptions = tServices.raw("engagements.options") as EngagementOption[];
  const processItems = tProcess.raw("process.items") as ProcessTimelineItem[];
  const qualityItems = tProcess.raw("quality.items") as QualityFrameworkItem[];

  return {
    t,
    tNav,
    startingPoints,
    openingPrinciples,
    systemItems,
    scenarios,
    companyModel,
    engagementOptions,
    processItems,
    qualityItems,
  };
}
