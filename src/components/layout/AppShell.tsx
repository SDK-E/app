import Image from "next/image";
import Link from "next/link";

import type { AssignedPrincipal } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  principal: AssignedPrincipal;
}

export function AppShell({ children, locale, principal }: AppShellProps) {
  const context = principal.kind === "client" ? principal.companyName : "SDK Enterprises";
  const areaLabel = principal.kind === "client" ? "Client portal" : "SDK workspace";

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-dark text-light lg:min-h-screen lg:border-r lg:border-b-0 lg:border-r-[#2d4b28]">
        <div className="flex min-h-20 items-center justify-between px-6 lg:block lg:px-7 lg:py-8">
          <Image
            src="/brand/sdk-logo-dark.png"
            alt="SDK Enterprises"
            width={140}
            height={43}
            priority
            className="h-auto w-[120px]"
          />
          <span className="text-micro uppercase tracking-eyebrow text-fog lg:mt-8 lg:block">
            {areaLabel}
          </span>
        </div>
        <nav aria-label="Application" className="border-t border-[#2d4b28] px-3 py-3 lg:px-4">
          <Link
            href={`/${locale}/app`}
            className="block rounded-nav bg-brand px-4 py-3 text-label font-extrabold uppercase tracking-eyebrow text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Portal home
          </Link>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-6 border-b border-line px-6 lg:px-10">
          <div>
            <p className="text-micro uppercase tracking-eyebrow text-muted-foreground">{context}</p>
            <p className="mt-1 text-body font-semibold">{principal.name}</p>
          </div>
          <Link
            href="/auth/logout"
            className="rounded-control border border-dark px-4 py-3 text-label font-extrabold uppercase tracking-eyebrow transition-colors hover:bg-dark hover:text-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
          >
            Log out
          </Link>
        </header>
        <main className="px-6 py-12 lg:px-10 lg:py-16">{children}</main>
      </div>
    </div>
  );
}
