import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@sdk-e/core/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-label font-extrabold uppercase tracking-eyebrow whitespace-nowrap transition-colors motion-reduce:transition-none outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-dark hover:bg-brand/90",
        outline:
          "border border-current text-current hover:bg-[var(--section-fg)] hover:text-[var(--section-bg)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        dark: "bg-[var(--section-fg)] text-[var(--section-bg)] hover:opacity-90",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-auto px-[18px] py-[14px]",
        xs: "h-auto px-2.5 py-1",
        sm: "h-auto px-3 py-1.5",
        lg: "h-auto px-5 py-4",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  href,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    href?: string;
  }) {
  let Comp: React.ElementType = "button";
  if (href) Comp = "a";
  else if (asChild) Comp = Slot.Root;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(href ? { href } : {})}
      {...props}
    />
  );
}

export { Button, buttonVariants };
