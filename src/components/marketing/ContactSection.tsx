import { Section } from "@/components/layout/Section";
import { siteConfig } from "@/lib/siteConfig";

const contactLines = [
  siteConfig.contact.email,
  siteConfig.contact.phone,
  siteConfig.contact.address,
  siteConfig.contact.domain,
];

export default function ContactSection() {
  return (
    <Section id="about" tone="brand">
      <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-dark">
            Work with SDK
          </p>
          <h2 className="mt-4 text-[36px] font-extrabold tracking-title md:text-title">
            Bring us the problem you need solved.
          </h2>
          <p className="mt-5 max-w-[65ch] text-body text-dark md:text-lead">
            Tell us what you&apos;re trying to build, modernize, automate or fix —
            we&apos;ll tell you honestly whether it&apos;s a fit and what it would take.
          </p>
        </div>
        <div className="rounded-card bg-dark p-6 text-light">
          <p className="text-body leading-relaxed text-fog">
            SDK Enterprises
            <br />
            Registered under {siteConfig.contact.company}
            <br />
            SIREN {siteConfig.contact.siren} · SIRET {siteConfig.contact.siret}
          </p>
          <div className="mt-4 divide-y divide-[#31512c]">
            {contactLines.map((line) => (
              <p key={line} className="py-3 text-label">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
