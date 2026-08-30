import { cn } from "@platform/core/utils";
import * as React from "react";

function Spinner({
  className,
  label = "Loading",
  size = "default",
  ...props
}: {
  label?: string;
  size?: "default" | "lg" | "sm";
} & React.ComponentProps<"svg">) {
  return (
    <span
      role="status"
      className="inline-flex"
    >
      <span className="sr-only">{label}</span>
      <svg
        data-slot="spinner"
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        className={cn(
          "animate-spin motion-reduce:animate-none",
          size === "sm" && "size-4",
          size === "default" && "size-5",
          size === "lg" && "size-6",
          className,
        )}
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </span>
  );
}

export { Spinner };
