import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";

const scenarios = [
  {
    title: "A system too old to keep patching.",
    copy: "You need a migration plan, not a wish — an audit of what runs, what breaks, and the order to move in.",
  },
  {
    title: "Volume your current stack wasn't built for.",
    copy: "Realtime ingestion, high-throughput backends and the infrastructure to keep them stable.",
  },
  {
    title: "AI you can put to work.",
    copy: "LLM integrations, agents and automation that change an internal workflow — not a demo that stops at the pitch.",
  },
  {
    title: "A team that needs senior hands.",
    copy: "Direct engineering delivery on your codebase, without a middle layer slowing decisions.",
  },
];

export default function EngagementsSection() {
  return (
    <Section id="work">
      <SectionHeader
        eyebrow="Work with SDK"
        title="Bring a specific problem. Get a specific answer."
        intro="You know when something in your stack is costing you. Here are the situations SDK is set up for."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {scenarios.map((scenario, index) => (
          <Card
            key={scenario.title}
            className="flex min-h-[200px] flex-col justify-between"
          >
            <div>
              <p className="text-micro font-bold uppercase tracking-label text-muted-foreground">
                0{index + 1}
              </p>
              <h3 className="mt-8 text-h3">{scenario.title}</h3>
            </div>
            <p className="mt-4 text-body text-muted-foreground">{scenario.copy}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
