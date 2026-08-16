import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export function PageHero({
  eyebrow,
  title,
  intro,
  primaryCta,
  secondaryCta,
  signals,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  signals: string[];
}) {
  return (
    <section className="bg-light py-12 text-dark md:py-16 lg:py-[96px]">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-[70px]">
          <div>
            <p className="text-label font-bold uppercase tracking-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-[14ch] text-[40px] font-extrabold leading-[0.98] tracking-title md:text-[58px] lg:text-display">
              {title}
            </h1>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-[58ch] text-body text-muted-foreground md:text-lead">
              {intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={primaryCta.href}>{primaryCta.label} →</Button>
              {secondaryCta ? (
                <Button href={secondaryCta.href} variant="outline">
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <ul className="mt-12 grid border-y border-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {signals.map((signal, index) => (
            <li
              key={signal}
              className={`flex min-h-20 items-center py-5 text-label font-bold uppercase tracking-eyebrow sm:px-5 ${
                index > 0 ? "border-t border-line sm:border-t-0" : ""
              } ${index % 2 === 1 ? "sm:border-l sm:border-line" : ""} ${
                index > 1 ? "lg:border-l lg:border-line" : ""
              }`}
            >
              <span className="mr-3 text-brand" aria-hidden>
                ●
              </span>
              {signal}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
