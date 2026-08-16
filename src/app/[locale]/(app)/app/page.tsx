import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default function AppHomePage() {
  return (
    <section className="max-w-3xl">
      <p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
        Secure workspace
      </p>
      <h1 className="mt-4 text-h1 font-extrabold">Your portal foundation is ready.</h1>
      <p className="mt-6 max-w-[60ch] text-body text-muted-foreground">
        Projects, requests, documents, invoices and messages will appear here as they become
        available. Access will follow your current company or SDK role.
      </p>
    </section>
  );
}
