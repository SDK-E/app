import type { Metadata } from "next";

import { Button } from "@platform/ui/Button";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { PublicHeader } from "@/components/layout/PublicHeader";

export const dynamic = "force-dynamic";

const ComponentsSection = nextDynamic(() =>
  import("@platform/design-system/ComponentsSection").then((mod) => mod.ComponentsSection),
);
const PaletteSection = nextDynamic(() =>
  import("@platform/design-system/PaletteSection").then((mod) => mod.PaletteSection),
);
const PortalUsersSection = nextDynamic(() =>
  import("@/components/design-system/PortalUsersSection").then((mod) => mod.PortalUsersSection),
);
const PrimitivesSection = nextDynamic(() =>
  import("@platform/design-system/PrimitivesSection").then((mod) => mod.PrimitivesSection),
);
const StatesSection = nextDynamic(() =>
  import("@platform/design-system/StatesSection").then((mod) => mod.StatesSection),
);
const SurfacesSection = nextDynamic(() =>
  import("@platform/design-system/SurfacesSection").then((mod) => mod.SurfacesSection),
);
const TypeSection = nextDynamic(() =>
  import("@platform/design-system/TypeSection").then((mod) => mod.TypeSection),
);

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
  { label: "Primitives", href: "#primitives" },
  { label: "States", href: "#states" },
];

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") {
    notFound();
  }

  const { locale: _locale } = await params;
  return (
    <div className="bg-background text-foreground">
      <PublicHeader
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
          <Button
            href="/"
            variant="dark"
          >
            Primary action →
          </Button>
        </div>
      </Section>

      <PaletteSection />
      <TypeSection />
      <ComponentsSection />
      <PrimitivesSection />
      <StatesSection />
      <SurfacesSection />
      <PortalUsersSection />
    </div>
  );
}
