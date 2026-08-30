import { Section } from "@platform/ui/Section";
import { getTranslations } from "next-intl/server";

import {
  ProblemNavigator,
  type ProblemNavigatorItem,
} from "@/components/marketing/ProblemNavigator";

export async function StartingPointsSection({
  locale,
  items,
}: {
  locale: string;
  items: ProblemNavigatorItem[];
}) {
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return (
    <Section id="starting-points">
      <ProblemNavigator
        heading={t("navigator.heading")}
        intro={t("navigator.intro")}
        items={items}
      />
    </Section>
  );
}
