import Image from "next/image";
import Link from "next/link";

import type { UnassignedPrincipal } from "@/types";

export function AccessPending({ principal }: { principal: UnassignedPrincipal }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-card border border-line bg-paper p-8 md:p-12">
        <Image
          src="/brand/sdk-logo-light.png"
          alt="SDK Enterprises"
          width={140}
          height={43}
          priority
          className="h-auto w-[140px]"
        />
        <p className="mt-12 text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
          Access pending
        </p>
        <h1 className="mt-4 text-h1 font-extrabold">Your identity is confirmed.</h1>
        <p className="mt-6 max-w-[60ch] text-body text-muted-foreground">
          {principal.email} is signed in, but it has not been assigned to an SDK role or client
          company. Contact your SDK Enterprises representative to complete access.
        </p>
        <Link
          href="/auth/logout"
          className="mt-8 inline-flex rounded-control bg-dark px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-light hover:bg-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
        >
          Log out
        </Link>
      </section>
    </main>
  );
}
