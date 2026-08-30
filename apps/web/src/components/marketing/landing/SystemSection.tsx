import { localizePath } from "@platform/i18n";
import { ArrowLink } from "@platform/ui/ArrowLink";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

import { HomeSystemMap, type HomeSystemMapItem } from "@/components/marketing/HomeSystemMap";

export async function SystemSection({
  locale,
  items,
}: {
  locale: string;
  items: HomeSystemMapItem[];
}) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  const tServices = await getTranslations({ locale, namespace: "servicesPage" });
  return (
    <Section>
      <SectionHeader
        eyebrow={t("system.eyebrow")}
        title={t("system.heading")}
        intro={t("system.intro")}
      />
      <HomeSystemMap items={items} />
      <div className="mt-8">
        <ArrowLink href={localizePath(locale, "/services")}>
          {tServices("hero.secondaryCta")}
        </ArrowLink>
      </div>
    </Section>
  );
}
