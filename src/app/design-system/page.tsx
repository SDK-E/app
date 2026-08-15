import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Design System — SDK Enterprises",
  robots: { index: false, follow: false },
};

const palette: { token: string; value: string; className: string }[] = [
  { token: "dark", value: "#082003", className: "bg-dark" },
  { token: "accent", value: "#2cdb16", className: "bg-accent" },
  { token: "light", value: "#d7e8d3", className: "bg-light border border-line" },
  { token: "paper", value: "#f8fbf7", className: "bg-paper border border-line" },
  { token: "muted", value: "#536b4f", className: "bg-muted" },
  { token: "fog", value: "#abc4a6", className: "bg-fog" },
  { token: "line", value: "#9db497", className: "bg-line" },
];

const typeRamp: { token: string; className: string; sample: string }[] = [
  { token: "display", className: "text-display tracking-display", sample: "display — 76px" },
  { token: "title", className: "text-title tracking-title", sample: "title — 52px" },
  { token: "h1", className: "text-h1 tracking-h1", sample: "h1 — 42px" },
  { token: "h3", className: "text-h3", sample: "h3 — 23px" },
  { token: "lead", className: "text-lead", sample: "lead — 18px" },
  { token: "body", className: "text-body", sample: "body — 14px (a11y floor)" },
  { token: "label", className: "text-label uppercase tracking-eyebrow", sample: "label — 11px" },
  { token: "micro", className: "text-micro uppercase tracking-label", sample: "micro — 10px" },
];

const navLinks = [
  { label: "Colors", href: "#colors" },
  { label: "Type", href: "#type" },
  { label: "Components", href: "#components" },
  { label: "States", href: "#states" },
];

export default function DesignSystemPage() {
  return (
    <div className="bg-light text-dark">
      <Header
        links={navLinks}
        cta={{ label: "Discuss a project", href: "#components" }}
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

      <Section id="colors">
        <SectionHeader
          eyebrow="01 · Palette"
          title="A small palette, used with intent."
          intro="Accent green is for actions and meaningful highlights only — never decoration. Green backgrounds always carry dark text; green text only appears on dark surfaces."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {palette.map((color) => (
            <Card key={color.token} className="flex min-h-40 flex-col justify-between gap-8">
              <div className={`h-16 w-full rounded-control ${color.className}`} />
              <div>
                <p className="text-label font-bold uppercase tracking-eyebrow">{color.token}</p>
                <p className="mt-1 text-micro text-muted">{color.value}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="type" tone="dark">
        <SectionHeader
          tone="dark"
          eyebrow="02 · Typography"
          title="JetBrains Mono, tuned like an editorial type system."
          intro="Headlines set tight and large; labels set small, uppercase and tracked. Body copy never goes below 14px."
        />
        <div className="grid gap-px overflow-hidden rounded-card border border-[#2d4b28] bg-[#2d4b28]">
          {typeRamp.map((row) => (
            <div key={row.token} className="bg-dark px-6 py-5">
              <p className={`text-light ${row.className}`}>{row.sample}</p>
            </div>
          ))}
        </div>
      </Section>

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
                  <p className="text-micro font-bold uppercase tracking-label text-muted">01 / Card</p>
                  <h3 className="mt-8 text-h3">Platforms, APIs & SaaS</h3>
                </div>
                <p className="mt-4 text-body text-muted">
                  PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs and realtime backend architecture.
                </p>
              </Card>
              <Card className="flex min-h-40 flex-col justify-between">
                <div>
                  <p className="text-micro font-bold uppercase tracking-label text-muted">02 / Card</p>
                  <h3 className="mt-8 text-h3">Cloud & infrastructure</h3>
                </div>
                <p className="mt-4 text-body text-muted">
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
              {[
                ["Active projects", "03"],
                ["Open requests", "02"],
                ["Outstanding", "€4.8k"],
                ["Pending actions", "02"],
              ].map(([label, value]) => (
                <Card key={label} className="p-4">
                  <p className="text-micro font-bold uppercase tracking-label text-muted">{label}</p>
                  <p className="mt-4 text-h1 tracking-h1">{value}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="states">
        <SectionHeader
          eyebrow="04 · States"
          title="Loading, empty and error — consistent surfaces."
          intro="No color inventions. Skeleton uses the line tone, empty states a dashed border, errors stay on the paper surface with strong dark emphasis."
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="flex min-h-48 flex-col gap-3 rounded-card border border-line bg-paper p-6">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
          <EmptyState
            title="No requests yet"
            description="When a project or request exists, it will appear here."
            action={<Button variant="dark">Request a service</Button>}
          />
          <ErrorState
            title="Something failed to load"
            description="Try again, or contact support if the problem persists."
            action={<Button variant="outline">Retry</Button>}
          />
        </div>
      </Section>

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

      <Section tone="accent" borderTop>
        <SectionHeader
          tone="accent"
          eyebrow="06 · Accent surface"
          title="One accent section per page, at most."
          intro="Green backgrounds carry dark text. Use this sparingly — it is the loudest surface in the system."
        />
        <Button variant="dark">Bring us the problem →</Button>
      </Section>
    </div>
  );
}
