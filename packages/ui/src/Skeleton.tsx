import { cn } from "@platform/core/utils";
import * as React from "react";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-control bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
