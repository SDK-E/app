import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "next-intl/server";

export default async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "hero" });

  return (
    <Section borderTop={false} className="lg:pb-[76px]">
      <p className="text-label font-bold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[70px]">
        <h1 className="text-[40px] font-extrabold leading-[0.95] tracking-display md:text-display">{t("heading")}</h1>
        <div>
          <p className="text-body text-muted-foreground md:text-lead">{t("leadParagraph")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#about">{t("ctaStartProject")} →</Button>
            <Button href="#services" variant="outline">{t("ctaExploreServices")}</Button>
          </div>
        </div>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {["trustFrance", "trustSenior", "trustAI", "trustClients"].map((key) => (
          <p key={key} className="border-t border-dark pt-3 text-micro text-muted-foreground">{t(key)}</p>
        ))}
      </div>
    </Section>
  );
}
