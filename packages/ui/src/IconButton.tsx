"use client";

import { cn } from "@platform/core/utils";
import { Button } from "@platform/ui/Button";
import * as React from "react";

type IconButtonSize = "default" | "sm";

function IconButton({
  className,
  size = "default",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  ...props
}: {
  size?: IconButtonSize;
} & Omit<React.ComponentProps<typeof Button>, "size" | "variant">) {
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
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export { IconButton, type IconButtonSize };
