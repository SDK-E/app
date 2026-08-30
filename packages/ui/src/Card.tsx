import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-card border border-border bg-card p-6 text-card-foreground ${className}`}
    >
      {children}
    </div>
  );
}
