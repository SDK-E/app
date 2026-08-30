import { getTranslations } from "next-intl/server";

import type { EngagementOption } from "@/components/marketing/EngagementComparison";
import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ServiceChapterItem } from "@/components/marketing/ServiceChapter";

interface TeamModelItem {
  number: string;
  title: string;
  copy: string;
}

export async function getServicesPageData(locale: string) {
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "servicesPage" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const serviceAnchors = [
    "#modernization",
    "#platforms",
    "#ai-automation",
    "#production-systems",
    "#engagements",
  ];
  const navigatorItems = (t.raw("navigator.items") as ProblemNavigatorItem[]).map(
    (item, index) => ({ ...item, href: serviceAnchors[index] }),
  );
  const capabilityAnchors = [
    "modernization",
    "platforms",
    "ai-automation",
    "production-systems",
    "data-interfaces",
  ];
  const capabilities = (t.raw("capabilities.items") as ServiceChapterItem[]).map((item, index) => ({
    ...item,
    id: capabilityAnchors[index],
  }));
  const engagementOptions = t.raw("engagements.options") as EngagementOption[];
  const teamSteps = t.raw("teamModel.steps") as TeamModelItem[];

  return {
    t,
    tNav,
    navigatorItems,
    capabilities,
    engagementOptions,
    teamSteps,
  };
}
