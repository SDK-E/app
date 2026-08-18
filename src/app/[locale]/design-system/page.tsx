import type { Metadata } from "next";

import { ComponentsSection } from "@/components/design-system/ComponentsSection";
import { PaletteSection } from "@/components/design-system/PaletteSection";
import { StatesSection } from "@/components/design-system/StatesSection";
import { SurfacesSection } from "@/components/design-system/SurfacesSection";
import { TypeSection } from "@/components/design-system/TypeSection";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Design System — SDK Enterprises",
    description: "The shared visual foundation for the website and client portal.",
    alternates: {
      canonical: `/${locale}/design-system`,
    },
    robots: { index: false, follow: false },
  };
}

const navLinks = [
  { label: "Colors", href: "#colors" },
  { label: "Type", href: "#type" },
  { label: "Components", href: "#components" },
  { label: "States", href: "#states" },
];

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: _locale } = await params;
  return (
    <div className="bg-light text-dark">
      <Header
        links={navLinks}
        cta={{ label: "Discuss a project", href: "#components" }}
        locale={_locale}
      />

      <Section>
        <SectionHeader
          eyebrow="SDK Enterprises · Design system"
          title="The shared visual foundation for the website and client portal."
          intro="This page renders every token, primitive and state defined in docs/design/design-system.md and docs/design/patterns.md. It is the reference during development. It is intentionally not linked from production navigation."
        />
        <div className="flex flex-wrap gap-3">
          <Button href="/" variant="dark">
            Primary action →
          </Button>
        </div>
      </Section>

      <PaletteSection />
      <TypeSection />
      <ComponentsSection />
      <StatesSection />
      <SurfacesSection />
    </div>
  );
}
