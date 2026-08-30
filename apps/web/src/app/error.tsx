"use client";

import Image from "next/image";

import { Button } from "@sdk-e/ui/Button";
import { Container } from "@sdk-e/ui/Container";

/**
 * Root error boundary. It renders outside `[locale]/layout.tsx`, so no
 * `NextIntlClientProvider` (and no server-only `getTranslations`) is
 * available here. Copy is the English fallback from
 * `packages/i18n/src/locales/en/shared.json` (`errors` + `footer`).
 */
export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const codeMotif = (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      className="text-muted-foreground opacity-50"
      aria-hidden="true"
    >
      <rect x="40" y="30" width="160" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="50" width="120" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="70" width="140" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="40" y="110" width="100" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <path d="M40 130 L100 130 L120 110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-line">
        <Container>
          <div className="flex h-[78px] items-center">
            <a href="/" className="block leading-none" aria-label="SDK Enterprises home">
              <Image
                src="/brand/sdk-logo-light.png"
                alt="SDK Enterprises logo"
                width={1429}
                height={495}
                className="h-[26px] w-auto md:h-[30px]"
                priority
                unoptimized
              />
            </a>
          </div>
        </Container>
      </header>

      <main className="flex flex-1 items-center">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-[70px]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow">500 / SERVER ERROR</p>
              <h1 className="mt-4 max-w-[15ch] text-[36px] font-extrabold tracking-title md:text-title">
                Something failed on our side.
              </h1>
              <p className="mt-4 max-w-[65ch] text-body text-muted-foreground">
                The issue has been recorded. You can try again or return to the homepage.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-control bg-brand px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-dark transition-colors motion-reduce:transition-none hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  Try again
                </button>
                <Button href="/" variant="outline">
                  Back to home
                </Button>
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
              {codeMotif}
            </div>
          </div>
        </Container>
      </main>

      <footer className="bg-dark py-6 text-micro text-fog">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span>© SDK Enterprises</span>
            <span>AI · Software · Cloud · Systems Engineering</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
