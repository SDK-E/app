import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

export default async function ProcessSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "process" });
  const steps = t.raw("items") as Array<{ title: string; copy: string }>;

  return (
    <Section id="process">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px]">
        {steps.map((step, index) => (
          <div key={step.title} className="border-t-2 border-current pt-4">
            <h3 className="text-lg font-extrabold">
              0{index + 1} · {step.title}
            </h3>
            <p className="mt-3 text-body text-section-muted">{step.copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
