import type { ReactNode } from "react";

export function ErrorState({
  title,
  description,
  action,
  label = "Error",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-paper px-6 py-12 text-center text-dark">
      <p className="text-micro font-extrabold uppercase tracking-label">{label}</p>
      <h3 className="text-h3">{title}</h3>
      {description ? <p className="max-w-md text-body">{description}</p> : null}
      {action}
    </div>
  );
}
