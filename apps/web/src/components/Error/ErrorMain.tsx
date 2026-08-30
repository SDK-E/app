import { Button } from "@platform/ui/Button";
import { Section } from "@platform/ui/Section";
import { useTranslations } from "next-intl";

import { ErrorCodeMotif } from "./ErrorCodeMotif";

interface ErrorMainProps {
  locale: string;
  reset: () => void;
}

export function ErrorMain({ locale, reset }: ErrorMainProps) {
  const t = useTranslations("errors");
  return (
    <Section
      tone="light"
      borderTop={false}
      className="min-h-[60vh]"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow">
            {t("serverErrorEyebrow")}
          </p>
          <h1 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
            {t("serverErrorTitle")}
          </h1>
          <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">
            {t("serverErrorDescription")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-control bg-brand px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-dark transition-colors motion-reduce:transition-none hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {t("tryAgain")}
            </button>
            <Button
              href={`/${locale}/`}
              variant="outline"
            >
              {t("backToHome")}
            </Button>
          </div>
        </div>
        <div
          className="hidden lg:flex items-center justify-center"
          aria-hidden="true"
        >
          <ErrorCodeMotif />
        </div>
      </div>
    </Section>
  );
}
