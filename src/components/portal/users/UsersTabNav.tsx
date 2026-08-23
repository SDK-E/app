import Link from "next/link";

import { cn } from "@/lib/utils";

export interface UsersTabLink {
  key: string;
  label: string;
  count?: number;
  href: string;
}

export function UsersTabNav({ tabs, active }: { tabs: UsersTabLink[]; active: string }) {
  return (
    <div role="tablist" aria-label="Sections" className="mt-8 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            href={tab.href}
            scroll={false}
            className={cn(
              "inline-flex items-center gap-2 rounded-control border px-4 py-2 text-label font-extrabold uppercase tracking-eyebrow outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
              isActive
                ? "border-transparent bg-brand text-dark"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-control px-1.5 py-0.5 text-micro",
                  isActive ? "bg-dark/10" : "border border-current"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
