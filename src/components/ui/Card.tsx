import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-card border border-line bg-paper p-6 text-dark ${className}`}>
      {children}
    </div>
  );
}
