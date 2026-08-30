import { localizePath } from "@platform/i18n";
import { Section } from "@platform/ui/Section";
import { getTranslations } from "next-intl/server";

import { ProjectCta } from "@/components/marketing/ProjectCta";

export async function CtaSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "homePage" });
  return (
    <Section tone="brand">
      <ProjectCta
        eyebrow={t("cta.eyebrow")}
        title={t("cta.title")}
        body={t("cta.body")}
        cta={{ label: t("cta.label"), href: localizePath(locale, "/start-a-project") }}
      />
    </Section>
  );
}
