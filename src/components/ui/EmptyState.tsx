import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-paper px-6 py-12 text-center">
      <h3 className="text-h3">{title}</h3>
      {description ? (
        <p className="max-w-md text-body text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
