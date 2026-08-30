import { siteConfig } from "@platform/config/site";
import { Section } from "@platform/ui/Section";

import { EnquiryForm } from "@/components/marketing/EnquiryForm";

interface EnquirySectionProps {
  t: NamespaceTranslator;
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function EnquirySection({ t }: EnquirySectionProps) {
  return (
    <Section
      id="project-form"
      tone="dark"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-section-accent">
            {t("formEyebrow")}
          </p>
          <h2 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
            {t("formHeading")}
          </h2>
          <p className="mt-5 max-w-[52ch] text-body text-section-muted">{t("formIntro")}</p>
          <div className="mt-8 border-t border-dark-deep pt-6 text-body text-section-muted">
            <p>{t("body")}</p>
            <p className="mt-4">
              <a
                className="font-bold underline underline-offset-4"
                href={`mailto:${siteConfig.contact.email}`}
              >
                {siteConfig.contact.email}
              </a>
              <br />
              <a
                className="font-bold underline underline-offset-4"
                href={`tel:${siteConfig.contact.phone.replaceAll(" ", "")}`}
              >
                {siteConfig.contact.phone}
              </a>
            </p>
          </div>
        </div>
        <div className="rounded-card border border-line bg-light p-5 text-dark md:p-8">
          <EnquiryForm />
        </div>
      </div>
    </Section>
  );
}
