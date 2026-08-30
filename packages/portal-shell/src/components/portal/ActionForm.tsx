"use client";

import type { RequestActionState } from "@platform/portal-shell/app/companies/[companyId]/requests/actions";

import { Button } from "@platform/ui/Button";
import { useActionState } from "react";

export function ActionForm({
  action,
  buttonLabel,
  pendingLabel,
  children,
  variant = "default",
  formClassName = "space-y-4",
}: {
  action: (state: RequestActionState, formData: FormData) => Promise<RequestActionState>;
  buttonLabel: string;
  pendingLabel?: string;
  children?: React.ReactNode;
  variant?: "dark" | "default" | "destructive" | "ghost" | "outline";
  formClassName?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form
      action={formAction}
      className={formClassName}
    >
      {children}
      {state.error ? (
        <p
          role="alert"
          className="text-body text-destructive"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant={variant}
        disabled={pending}
      >
        {pending ? (pendingLabel ?? buttonLabel) : buttonLabel}
      </Button>
    </form>
  );
}
