import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getTranslations } from "next-intl/server";

export default async function WhySdkSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "whySdk" });
  const proofs = t.raw("items") as Array<{ kicker: string; copy: string }>;

  return (
    <Section id="why" tone="dark">
      <SectionHeader tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {proofs.map((proof) => (
          <div
            key={proof.kicker}
            className="flex min-h-[175px] flex-col justify-between rounded-card border border-[#2f4d2b] p-5"
          >
            <strong className="text-[32px] font-extrabold text-brand">{proof.kicker}</strong>
            <span className="text-micro text-fog">{proof.copy}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
