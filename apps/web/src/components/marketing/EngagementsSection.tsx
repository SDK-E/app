import { Card } from "@platform/ui/Card";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import { getTranslations } from "next-intl/server";

export default async function EngagementsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "engagements" });
  const scenarios = t.raw("items") as { title: string; copy: string }[];

  return (
    <Section id="work">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {scenarios.map((scenario, index) => (
          <Card
            key={scenario.title}
            className="flex min-h-[200px] flex-col justify-between"
          >
            <div>
              <p className="text-micro font-bold uppercase tracking-label">0{index + 1}</p>
              <h3 className="mt-8 text-h3">{scenario.title}</h3>
            </div>
            <p className="mt-4 text-body">{scenario.copy}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
