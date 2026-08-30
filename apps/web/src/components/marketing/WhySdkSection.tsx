import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

export default async function WhySdkSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "whySdk" });
  const proofs = t.raw("items") as Array<{ kicker: string; copy: string }>;

  return (
    <Section id="why" tone="dark">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {proofs.map((proof) => (
          <div
            key={proof.kicker}
            className="flex min-h-[175px] flex-col justify-between rounded-card border border-dark-deep p-5"
          >
            <strong className="text-[32px] font-extrabold text-section-accent">
              {proof.kicker}
            </strong>
            <span className="text-micro text-section-muted">{proof.copy}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
