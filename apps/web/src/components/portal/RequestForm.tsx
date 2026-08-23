"use client";

import { useActionState, useState } from "react";

import { Button } from "@sdk-e/ui/Button";
import type { RequestActionState } from "@/app/[locale]/(app)/app/companies/[companyId]/requests/actions";

const field =
  "mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-4 py-3 text-body text-dark outline-none focus-visible:border-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export interface RequestFormCopy {
  title: string;
  capability: string;
  description: string;
  businessContext: string;
  supportingInformation: string;
  supportingLinks: string;
  saveDraft: string;
  review: string;
  back: string;
  submit: string;
  reviewHeading: string;
  working: string;
  capabilities: Record<string, string>;
}

export function RequestForm({
  action,
  copy,
  initial,
}: {
  action: (state: RequestActionState, formData: FormData) => Promise<RequestActionState>;
  copy: RequestFormCopy;
  initial?: Record<string, string | string[] | null>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [reviewing, setReviewing] = useState(false);
  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {reviewing ? (
        <div className="rounded-card border border-line bg-paper p-6">
          <h2 className="text-h3 font-extrabold">{copy.reviewHeading}</h2>
          <p className="mt-3 text-body">
            Review the information below, then submit it to SDK. You can return to make changes.
          </p>
        </div>
      ) : null}
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.title}
        <input
          className={field}
          name="title"
          required
          maxLength={255}
          defaultValue={String(initial?.title ?? "")}
        />
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.capability}
        <select
          className={field}
          name="capability"
          required
          defaultValue={String(initial?.capability ?? "")}
        >
          <option value="" disabled>
            —
          </option>
          {Object.entries(copy.capabilities).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.description}
        <textarea
          className={field}
          name="description"
          required
          rows={7}
          maxLength={4000}
          defaultValue={String(initial?.description ?? "")}
        />
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.businessContext}
        <textarea
          className={field}
          name="businessContext"
          rows={5}
          maxLength={4000}
          defaultValue={String(initial?.businessContext ?? "")}
        />
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.supportingInformation}
        <textarea
          className={field}
          name="supportingInformation"
          rows={4}
          maxLength={4000}
          defaultValue={String(initial?.supportingInformation ?? "")}
        />
      </label>
      <label className="block text-label font-extrabold uppercase tracking-eyebrow">
        {copy.supportingLinks}
        <textarea
          className={field}
          name="supportingLinks"
          rows={4}
          defaultValue={
            Array.isArray(initial?.supportingLinks) ? initial.supportingLinks.join("\n") : ""
          }
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-body text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button name="intent" value="draft" variant="outline" disabled={pending}>
          {pending ? copy.working : copy.saveDraft}
        </Button>
        {reviewing ? (
          <>
            <Button type="button" variant="outline" onClick={() => setReviewing(false)}>
              {copy.back}
            </Button>
            <Button name="intent" value="submit" disabled={pending}>
              {pending ? copy.working : copy.submit}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => setReviewing(true)}>
            {copy.review}
          </Button>
        )}
      </div>
    </form>
  );
}
