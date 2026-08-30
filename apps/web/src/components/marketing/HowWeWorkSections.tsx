import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

import type { ProblemNavigatorItem } from "@/components/marketing/ProblemNavigator";
import type { ProcessTimelineItem } from "@/components/marketing/ProcessTimeline";
import type { QualityFrameworkItem } from "@/components/marketing/QualityFramework";

import { ProblemNavigator } from "@/components/marketing/ProblemNavigator";
import { ProcessTimeline } from "@/components/marketing/ProcessTimeline";
import { QualityFramework } from "@/components/marketing/QualityFramework";

interface HowWeWorkSectionsProps {
  t: NamespaceTranslator;
  entryPaths: ProblemNavigatorItem[];
  process: ProcessTimelineItem[];
  responsibility: QualityFrameworkItem[];
  quality: QualityFrameworkItem[];
  scopeSteps: string[];
}

type NamespaceTranslator = (key: string, values?: Record<string, Date | number | string>) => string;

export function HowWeWorkSections({
  t,
  entryPaths,
  process,
  responsibility,
  quality,
  scopeSteps,
}: HowWeWorkSectionsProps) {
  return (
    <>
      <Section>
        <ProblemNavigator
          heading={t("entryPaths.heading")}
          intro={t("entryPaths.intro")}
          items={entryPaths}
        />
      </Section>

      <Section
        id="process"
        tone="dark"
      >
        <SectionHeader
          eyebrow={t("process.eyebrow")}
          title={t("process.heading")}
          intro={t("process.intro")}
        />
        <ProcessTimeline
          items={process}
          labels={{ output: t("process.labels.output"), decision: t("process.labels.decision") }}
        />
      </Section>

      <Section>
        <SectionHeader
          eyebrow={t("responsibility.eyebrow")}
          title={t("responsibility.heading")}
          intro={t("responsibility.body")}
        />
        <QualityFramework items={responsibility} />
      </Section>

      <Section tone="dark">
        <SectionHeader
          eyebrow={t("quality.eyebrow")}
          title={t("quality.heading")}
          intro={t("quality.intro")}
        />
        <QualityFramework items={quality} />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-[70px]">
          <div>
            <p className="text-label font-bold uppercase tracking-eyebrow">{t("scope.eyebrow")}</p>
            <h2 className="mt-4 max-w-[17ch] text-[36px] font-extrabold tracking-title md:text-title">
              {t("scope.heading")}
            </h2>
            <p className="mt-5 max-w-[58ch] text-body text-section-muted">{t("scope.body")}</p>
          </div>
          <ol className="border-t-2 border-current">
            {scopeSteps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[48px_1fr] border-b border-line py-5 text-body"
              >
                <span className="text-label font-bold text-section-muted">0{index + 1}</span>
                <span className="font-bold">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
