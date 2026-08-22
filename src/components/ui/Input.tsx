import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-control border border-input bg-background px-3 py-2 text-body normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground file:inline-flex file:h-7 file:cursor-pointer file:border-0 file:bg-transparent file:p-0 file:text-label file:font-extrabold file:uppercase file:tracking-eyebrow file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  );
}

export { Input };
