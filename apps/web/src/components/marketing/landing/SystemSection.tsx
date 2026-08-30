import { getTranslations } from "next-intl/server";

import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { ArrowLink } from "@sdk-e/ui/ArrowLink";
import { HomeSystemMap, type HomeSystemMapItem } from "@/components/marketing/HomeSystemMap";
import { localizePath } from "@sdk-e/i18n";

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
