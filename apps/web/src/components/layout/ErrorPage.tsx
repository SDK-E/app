import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@sdk-e/ui/Container";
import { Section, sectionToneStyles, type SectionTone } from "@sdk-e/ui/Section";
import SiteFooter from "@/components/marketing/SiteFooter";

const logoByTone: Record<SectionTone, string> = {
  light: "/brand/sdk-logo-light.png",
  dark: "/brand/sdk-logo-dark.png",
  brand: "/brand/sdk-logo-dark.png",
};

const borderByTone: Record<SectionTone, string> = {
  light: "border-line",
  dark: "border-dark-deep",
  brand: "border-dark-deep",
};

export async function ErrorPage({
  eyebrow,
  headline,
  description,
  primaryAction,
  secondaryAction,
  tone = "light",
  motif,
  locale,
}: {
  eyebrow: string;
  headline: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: SectionTone;
  motif?: ReactNode;
  locale?: string;
}) {
  const logoSrc = logoByTone[tone];
  const homeHref = locale ? `/${locale}/` : "/";

  return (
    <div style={sectionToneStyles[tone]} className="flex min-h-screen flex-col">
      <header className={`border-b ${borderByTone[tone]}`}>
        <Container>
          <div className="flex h-[78px] items-center">
            <Link href={homeHref} className="block leading-none" aria-label="SDK Enterprises home">
              <Image
                src={logoSrc}
                alt="SDK Enterprises logo"
                width={1429}
                height={495}
                className="h-[26px] w-auto md:h-[30px]"
                priority
                unoptimized
              />
            </Link>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Section tone={tone} borderTop={false} className="min-h-[60vh]">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-[70px]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow">{eyebrow}</p>
              <h1 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
                {headline}
              </h1>
              {description ? (
                <p className="mt-4 max-w-[65ch] text-body text-section-muted">{description}</p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {primaryAction}
                {secondaryAction}
              </div>
            </div>

            {motif ? (
              <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
                {motif}
              </div>
            ) : null}
          </div>
        </Section>
      </main>

      {locale ? <SiteFooter locale={locale} /> : null}
    </div>
  );
}
