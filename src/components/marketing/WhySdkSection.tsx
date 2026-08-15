import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";

const proofs = [
  {
    kicker: "FR",
    copy: "A France-based B2B company for European and remote clients.",
  },
  {
    kicker: "AI",
    copy: "LLM integrations, agents, automation and internal tooling.",
  },
  {
    kicker: "RT",
    copy: "Realtime and high-volume platform work.",
  },
  {
    kicker: "DIRECT",
    copy: "You talk to the engineers doing the work, not an account layer.",
  },
];

export default function WhySdkSection() {
  return (
    <Section id="why" tone="dark">
      <SectionHeader
        tone="dark"
        eyebrow="Why SDK"
        title="Senior engineering without unnecessary layers."
        intro="Direct communication, fast diagnosis and pragmatic execution."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {proofs.map((proof) => (
          <div
            key={proof.kicker}
            className="flex min-h-[175px] flex-col justify-between rounded-card border border-[#2f4d2b] p-5"
          >
            <strong className="text-[32px] font-extrabold text-brand">
              {proof.kicker}
            </strong>
            <span className="text-micro text-fog">{proof.copy}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
