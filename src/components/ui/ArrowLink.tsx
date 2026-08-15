import Link from "next/link";
import type { ReactNode } from "react";

export function ArrowLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-label font-bold uppercase tracking-eyebrow transition-opacity motion-reduce:transition-none hover:opacity-70 ${className}`}
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
