import { getTranslations } from "next-intl/server";

import { Section } from "@/components/layout/Section";
import {
  QualityFramework,
  type QualityFrameworkItem,
} from "@/components/marketing/QualityFramework";

export async function OpeningSection({
  locale,
  items,
}: {
  locale: string;
  items: QualityFrameworkItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  return (
    <Section tone="dark">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-section-accent">
            {t("opening.eyebrow")}
          </p>
          <h2 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
            {t("opening.heading")}
          </h2>
        </div>
        <div>
          <p className="max-w-[65ch] text-body text-section-muted md:text-lead">
            {t("opening.body")}
          </p>
          <p className="mt-5 max-w-[65ch] text-body text-section-muted">{t("opening.body2")}</p>
        </div>
      </div>
      <div className="mt-12">
        <QualityFramework items={items} />
      </div>
    </Section>
  );
}
