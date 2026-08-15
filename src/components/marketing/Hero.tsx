import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

const trustItems = [
  "France-based B2B company",
  "Senior engineering delivery",
  "AI + backend + cloud",
  "European & remote clients",
];

export default function Hero() {
  return (
    <Section borderTop={false} className="lg:pb-[76px]">
      <p className="text-label font-bold uppercase tracking-eyebrow">
        B2B AI · Software · Cloud · Systems Engineering
      </p>
      <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[70px]">
        <h1 className="text-[40px] font-extrabold leading-[0.95] tracking-display md:text-display">
          One engineering partner for the stack your company needs.
        </h1>
        <div>
          <p className="text-body text-muted md:text-lead">
            SDK Enterprises builds, modernizes and operates software across the
            stack — backend platforms, cloud infrastructure, AI automation,
            realtime systems and internal tooling. You engage on one
            specialized problem or own a broader workstream; either way, the
            people doing the work are the people you talk to.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#about">Start a project →</Button>
            <Button href="#services" variant="outline">
              Explore services
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <p
            key={item}
            className="border-t border-dark pt-3 text-micro text-muted"
          >
            {item}
          </p>
        ))}
      </div>
    </Section>
  );
}
