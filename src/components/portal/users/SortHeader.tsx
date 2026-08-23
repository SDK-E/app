import Link from "next/link";

import { cn } from "@/lib/utils";
import { TH } from "@/components/ui/Table";

export function SortHeader({
  label,
  field,
  activeSort,
  activeDir,
  nextHref,
}: {
  label: string;
  field: string;
  activeSort?: string;
  activeDir?: "asc" | "desc";
  nextHref: string;
}) {
  const isActive = activeSort === field;
  const arrow = isActive ? (activeDir === "asc" ? "↑" : "↓") : "↕";
  return (
    <TH>
      <Link
        href={nextHref}
        scroll={false}
        aria-label={`Sort by ${label}`}
        className={cn(
          "inline-flex items-center gap-1 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
          isActive && "text-foreground"
        )}
      >
        {label}
        <span aria-hidden="true">{arrow}</span>
      </Link>
    </TH>
  );
}
