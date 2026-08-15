"use client";

import type { Metadata } from "next";
import { useEffect } from "react";

export const metadata: Metadata = {
  title: "Something went wrong — SDK Enterprises",
  robots: { index: false, follow: false },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-light px-6 text-center">
      <h1 className="text-h1">Something went wrong</h1>
      <p className="text-body text-muted-foreground">
        We could not load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-control bg-brand px-4 py-2 text-label font-semibold uppercase tracking-eyebrow text-dark transition-colors hover:bg-brand/90"
      >
        Try again
      </button>
    </div>
  );
}
