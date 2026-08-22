"use client";

import { useActionState } from "react";

import type { AccessRequestState } from "@/app/[locale]/(app)/app/access/actions";
import { Button } from "@/components/ui/Button";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-control border border-dark/40 bg-paper px-3 text-body text-dark normal-case tracking-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export function AccessRequestForm({
  action,
  submitLabel,
  codeLabel,
  roleLabel,
}: {
  action: (state: AccessRequestState, data: FormData) => Promise<AccessRequestState>;
  submitLabel: string;
  codeLabel: string;
  roleLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {codeLabel}
        <input
          name="code"
          required
          minLength={4}
          maxLength={16}
          autoComplete="off"
          spellCheck={false}
          className={`${fieldClass} font-mono uppercase tracking-widest`}
          placeholder="A1B2-C3D4"
        />
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {roleLabel}
        <select name="requestedRole" className={fieldClass} defaultValue="VIEWER">
          <option value="VIEWER">VIEWER</option>
          <option value="PROJECT_MEMBER">PROJECT_MEMBER</option>
          <option value="BILLING">BILLING</option>
        </select>
      </label>
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
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
