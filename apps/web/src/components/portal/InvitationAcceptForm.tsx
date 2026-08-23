"use client";

import { useActionState } from "react";

import type { InvitationActionState } from "@/app/[locale]/invite/[token]/actions";
import { Button } from "@sdk-e/ui/Button";

export function InvitationAcceptForm({
  action,
  label,
}: {
  action: (state: InvitationActionState, data: FormData) => Promise<InvitationActionState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="mt-6">
      {state.error ? (
        <p role="alert" className="mb-4 text-body">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
