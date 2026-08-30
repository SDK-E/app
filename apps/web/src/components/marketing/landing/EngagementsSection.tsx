import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import {
  EngagementComparison,
  type EngagementOption,
} from "@/components/marketing/EngagementComparison";

export async function EngagementsSection({
  locale,
  options,
}: {
  locale: string;
  options: EngagementOption[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tServices = await getTranslations({ locale, namespace: "servicesPage" });
  return (
    <Section tone="dark">
      <SectionHeader
        eyebrow={t("engagements.eyebrow")}
        title={t("engagements.heading")}
        intro={t("engagements.intro")}
      />
      <EngagementComparison
        labels={{
          bestFor: tServices("engagements.labels.bestFor"),
          output: tServices("engagements.labels.output"),
          commitment: tServices("engagements.labels.commitment"),
        }}
        options={options}
      />
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/services#engagements")}>
          {t("engagements.link")}
        </ArrowLink>
      </div>
    </Section>
  );
}
