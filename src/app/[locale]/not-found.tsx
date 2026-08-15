import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — SDK Enterprises",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-light px-6 text-center">
      <h1 className="text-h1">404</h1>
      <p className="text-body text-muted-foreground">
        This page does not exist or has been moved.
      </p>
    </div>
  );
}
