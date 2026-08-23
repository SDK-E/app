import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function Arrow({
  href,
  disabled,
  children,
  ariaLabel,
}: {
  href?: string | null;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  if (href && !disabled) {
    return (
      <Link
        href={href}
        scroll={false}
        aria-label={ariaLabel}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {children}
      </Link>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "pointer-events-none opacity-50"
      )}
    >
      {children}
    </span>
  );
}

export function PaginationNav({
  nextHref,
  prevHref,
  prevVisible,
  label,
}: {
  nextHref?: string | null;
  prevHref?: string | null;
  prevVisible?: boolean;
  label: string;
}) {
  return (
    <nav aria-label={label} className="mt-4 flex items-center justify-end gap-3">
      <Arrow href={prevHref} disabled={!prevVisible || !prevHref} ariaLabel="Previous page">
        ←
      </Arrow>
      <Arrow href={nextHref} disabled={!nextHref} ariaLabel="Next page">
        →
      </Arrow>
    </nav>
  );
}
