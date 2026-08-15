import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "dark";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-dark hover:bg-accent/90",
  outline: "border border-dark text-dark hover:bg-dark hover:text-light",
  dark: "bg-dark text-light hover:bg-dark/90",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-control px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: {
  variant?: Variant;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children" | "href">) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
