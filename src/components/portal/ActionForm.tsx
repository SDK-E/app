"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import type { RequestActionState } from "@/app/[locale]/(app)/app/companies/[companyId]/requests/actions";

export function ActionForm({
  action,
  buttonLabel,
  pendingLabel,
  children,
  variant = "default",
}: {
  action: (state: RequestActionState, formData: FormData) => Promise<RequestActionState>;
  buttonLabel: string;
  pendingLabel?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "dark" | "destructive";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error ? (
        <p role="alert" className="text-body text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant={variant} disabled={pending}>
        {pending ? (pendingLabel ?? buttonLabel) : buttonLabel}
      </Button>
    </form>
  );
}
