import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";
import { getTranslations } from "next-intl/server";

export default async function ServicesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services" });
  const services = t.raw("items") as Array<{
    number: string;
    category: string;
    title: string;
    copy: string;
  }>;

  return (
    <Section id="services">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} className="flex min-h-[250px] flex-col justify-between">
            <p className="text-micro font-bold uppercase tracking-label">
              {service.number} / {service.category.toUpperCase()}
            </p>
            <div>
              <h3 className="mt-8 text-h3">{service.title}</h3>
              <p className="mt-4 text-body">{service.copy}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
