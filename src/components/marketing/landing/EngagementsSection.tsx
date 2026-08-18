import { getTranslations } from "next-intl/server";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import {
  EngagementComparison,
  type EngagementOption,
} from "@/components/marketing/EngagementComparison";
import { localizePath } from "@/i18n";

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
        tone="dark"
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
        <ArrowLink href={localizePath(locale, "/services#engagements")} className="text-light">
          {t("engagements.link")}
        </ArrowLink>
      </div>
    </Section>
  );
}
