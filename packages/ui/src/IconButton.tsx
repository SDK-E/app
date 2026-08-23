"use client";

import * as React from "react";

import { Button } from "@sdk-e/ui/Button";
import { cn } from "@sdk-e/core/utils";

type IconButtonSize = "sm" | "default";

function IconButton({
  className,
  size = "default",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "variant"> & {
  size?: IconButtonSize;
}) {
  if (!ariaLabel && !ariaLabelledBy) {
    console.warn("IconButton requires an accessible name via `aria-label`.");
  }

  return (
    <Button
      data-slot="icon-button"
      variant="ghost"
      aria-label={ariaLabel}
      className={cn(
        "relative rounded-control px-0 after:absolute after:-inset-1.5 after:content-['']",
        size === "default" ? "size-11 after:content-none" : "size-9",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export { IconButton, type IconButtonSize };
