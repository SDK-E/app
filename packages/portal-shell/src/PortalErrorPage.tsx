import { ErrorState } from "@platform/ui/ErrorState";

export function PortalErrorPage({
  label,
  title,
  description,
  action,
  copyright = "© SDK Enterprises",
}: {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  copyright?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <ErrorState
        label={label}
        title={title}
        description={description}
        action={action}
      />
      <footer className="mt-auto pt-8 text-micro text-muted-foreground">
        <span>{copyright}</span>
      </footer>
    </div>
  );
}
