import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function SurfacesSection() {
  return (
    <>
      <Section tone="dark" borderTop>
        <SectionHeader
          tone="dark"
          eyebrow="05 · Dark surface"
          title="Dark sections carry the same system."
          intro="Primary text turns light, secondary turns fog, and green is used for highlights. Border line darkens to keep the composition quiet."
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="live">In progress</Badge>
          <Button>Start a project →</Button>
        </div>
      </Section>

      <Section tone="brand" borderTop>
        <SectionHeader
          tone="brand"
          eyebrow="06 · Brand surface"
          title="One brand section per page, at most."
          intro="Green backgrounds carry dark text. Use this sparingly — it is the loudest surface in the system."
        />
        <Button variant="dark">Bring us the problem →</Button>
      </Section>
    </>
  );
}
