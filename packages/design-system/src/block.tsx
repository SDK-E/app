import { ReactNode } from "react";

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-72 flex-1 space-y-4 rounded-card border border-border bg-card p-6">
      <h3 className="text-label font-extrabold uppercase tracking-label text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
