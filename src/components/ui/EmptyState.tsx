import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-paper px-6 py-12 text-center text-dark ${className}`}
    >
      <h3 className="text-h3">{title}</h3>
      {description ? <p className="max-w-md text-body">{description}</p> : null}
      {action}
    </div>
  );
}
