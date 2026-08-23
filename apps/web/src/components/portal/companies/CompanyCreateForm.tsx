"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@sdk-e/ui/Button";
import type { UserActionState } from "@/app/[locale]/(app)/app/companies/new/actions";

export function CompanyCreateForm({
  action,
  backTo,
  nameLabel,
  ownerEmailLabel,
  ownerEmailHelp,
  submitLabel,
  workingLabel,
}: {
  action: (state: UserActionState, data: FormData) => Promise<UserActionState>;
  backTo: string;
  nameLabel: string;
  ownerEmailLabel: string;
  ownerEmailHelp: string;
  submitLabel: string;
  workingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.push(backTo);
  }, [state.success, router, backTo]);

  return (
    <form action={formAction} className="mt-8 space-y-4">
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
      <label className="block text-label font-bold uppercase tracking-eyebrow">
        {ownerEmailLabel}
        <input
          name="ownerEmail"
          required
          type="email"
          autoComplete="email"
          className="mt-2 min-h-11 w-full rounded-control border border-dark/40 bg-paper px-3 text-body text-dark normal-case tracking-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        />
      </label>
      <p className="text-body text-muted-foreground">{ownerEmailHelp}</p>
      {state.error ? (
        <p role="alert" className="text-body">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? workingLabel : submitLabel}
      </Button>
    </form>
  );
}
