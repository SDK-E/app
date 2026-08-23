"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import type { UserActionState } from "@/app/[locale]/(app)/app/users/actions";
import { ConfirmButton } from "@/components/portal/users/ConfirmButton";

export function UserActionForm({
  action,
  label,
  confirmLabel,
  children,
  variant = "outline",
}: {
  action: (state: UserActionState, data: FormData) => Promise<UserActionState>;
  label: string;
  confirmLabel?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "dark" | "destructive";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3">
      {children}
      {state.error ? (
        <p role="alert" className="text-body">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-body">
          {state.success}
        </p>
      ) : null}
      {confirmLabel ? (
        <ConfirmButton label={label} confirmLabel={confirmLabel} variant={variant} size="sm" />
      ) : (
        <Button type="submit" variant={variant} size="sm" disabled={pending}>
          {label}
        </Button>
      )}
    </form>
  );
}
