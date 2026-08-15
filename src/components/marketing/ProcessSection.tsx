import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";

const steps = [
  {
    title: "Understand",
    copy: "Business goal, stack, constraints and success criteria.",
  },
  {
    title: "Design",
    copy: "Architecture, scope, risks and milestones.",
  },
  {
    title: "Build",
    copy: "Implementation with visible progress.",
  },
  {
    title: "Handover",
    copy: "Deploy, document and transfer ownership.",
  },
];

export default function ProcessSection() {
  return (
    <Section id="process">
      <SectionHeader
        eyebrow="How we work"
        title="A clear path from problem to production."
        intro="Four steps, visible progress at every stage."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px]">
        {steps.map((step, index) => (
          <div key={step.title} className="border-t-2 border-dark pt-4">
            <h3 className="text-lg font-extrabold">
              0{index + 1} · {step.title}
            </h3>
            <p className="mt-3 text-body text-muted">{step.copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
