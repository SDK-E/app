import { cn } from "@platform/core/utils";
import { buttonVariants } from "@platform/ui/Button";
import Link from "next/link";

export function PaginationNav({
  nextHref,
  prevHref,
  prevVisible,
  label,
}: {
  nextHref?: null | string;
  prevHref?: null | string;
  prevVisible?: boolean;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="mt-4 flex items-center justify-end gap-3"
    >
      <Arrow
        href={prevHref}
        disabled={!prevVisible || !prevHref}
        ariaLabel="Previous page"
      >
        ←
      </Arrow>
      <Arrow
        href={nextHref}
        disabled={!nextHref}
        ariaLabel="Next page"
      >
        →
      </Arrow>
    </nav>
  );
}

function Arrow({
  href,
  disabled,
  children,
  ariaLabel,
}: {
  href?: null | string;
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
        "pointer-events-none opacity-50",
      )}
    >
      {children}
    </span>
  );
}
