"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@sdk-e/core/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer relative inline-flex shrink-0 items-center rounded-full outline-none transition-colors motion-reduce:transition-none after:absolute after:-inset-x-2 after:-inset-y-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-muted data-checked:bg-primary data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=sm]:h-[14px] data-[size=sm]:w-6",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block translate-x-0 rounded-full bg-foreground transition-transform motion-reduce:transition-none data-checked:bg-primary-foreground data-checked:translate-x-[calc(100%-2px)]",
          size === "default" ? "size-4" : "size-3"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
