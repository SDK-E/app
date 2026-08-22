import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const metrics: [string, string][] = [
  ["Active projects", "03"],
  ["Open requests", "02"],
  ["Outstanding", "€4.8k"],
  ["Pending actions", "02"],
];

export function ComponentsSection() {
  return (
    <Section id="components">
      <SectionHeader
        eyebrow="03 · Components"
        title="Restrained primitives, aligned to the reference."
        intro="Buttons, badges, cards and links. One radius family, 1px borders, and no decoration beyond what the approved designs use."
      />

      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-h3">Buttons</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Start a project →</Button>
            <Button variant="outline">Explore services</Button>
            <Button variant="dark">Discuss a project →</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-h3">Badges</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="live">In progress</Badge>
            <Badge tone="review">Review</Badge>
            <Badge tone="neutral">Pending</Badge>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-h3">Cards & links</h3>
          <div className="grid gap-3 lg:grid-cols-3">
            <Card className="flex min-h-40 flex-col justify-between">
              <div>
                <p className="text-micro font-bold uppercase tracking-label">01 / Card</p>
                <h3 className="mt-8 text-h3">Platforms, APIs & SaaS</h3>
              </div>
              <p className="mt-4 text-body">
                PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs and realtime backend
                architecture.
              </p>
            </Card>
            <Card className="flex min-h-40 flex-col justify-between">
              <div>
                <p className="text-micro font-bold uppercase tracking-label">02 / Card</p>
                <h3 className="mt-8 text-h3">Cloud & infrastructure</h3>
              </div>
              <p className="mt-4 text-body">
                AWS, GCP, Azure, Kubernetes, Helm, CI/CD and deployment architecture.
              </p>
            </Card>
            <Card className="flex min-h-40 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-h3">Current projects</h3>
                <ArrowLink href="#components">View all</ArrowLink>
              </div>
              <div className="mt-8 flex items-center justify-between gap-3">
                <span className="text-body">AI Support Automation</span>
                <Badge tone="live">In progress</Badge>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-h3">Metrics grid (responsive: 4 → 2 → 1)</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-micro font-bold uppercase tracking-label">{label}</p>
                <p className="mt-4 text-h1 tracking-h1">{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
