import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card">
      <table className={cn("w-full border-collapse text-left", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-line">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ className, children }: { className?: string; children: ReactNode }) {
  return <tr className={cn("border-b border-line last:border-b-0", className)}>{children}</tr>;
}

export function TH({
  className,
  width,
  children,
}: {
  className?: string;
  width?: string;
  children?: ReactNode;
}) {
  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      className={cn(
        "px-4 py-3 text-micro font-extrabold uppercase tracking-eyebrow text-muted-foreground",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TD({ className, children }: { className?: string; children: ReactNode }) {
  return <td className={cn("px-4 py-3 align-middle text-body", className)}>{children}</td>;
}
