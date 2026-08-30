import { Button } from "@platform/ui/Button";
import { Container } from "@platform/ui/Container";

import { RootErrorMotif } from "@/components/Error/RootErrorMotif";

interface RootErrorMainProps {
  reset: () => void;
}

export function RootErrorMain({ reset }: RootErrorMainProps) {
  return (
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
              <Button
                href="/"
                variant="outline"
              >
                Back to home
              </Button>
            </div>
          </div>
          <div
            className="hidden items-center justify-center lg:flex"
            aria-hidden="true"
          >
            <RootErrorMotif />
          </div>
        </div>
      </Container>
    </main>
  );
}
