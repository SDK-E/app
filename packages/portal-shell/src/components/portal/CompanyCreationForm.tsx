"use client";

import type { CompanyCreationState } from "@platform/portal-shell/app/company/actions";

import { Button } from "@platform/ui/Button";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export function CompanyCreationForm({
  action,
  label,
  nameLabel,
}: {
  action: (state: CompanyCreationState, data: FormData) => Promise<CompanyCreationState>;
  label: string;
  nameLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-4"
    >
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {nameLabel}
        <input
          name="name"
          required
          minLength={2}
          maxLength={255}
          autoComplete="organization"
          className="mt-2 min-h-11 w-full rounded-control border border-dark/40 bg-paper px-3 text-body text-dark normal-case tracking-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        />
      </label>
      {state.error ? (
        <p
          role="alert"
          className="text-body"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
      >
        {label}
      </Button>
    </form>
  );
}
