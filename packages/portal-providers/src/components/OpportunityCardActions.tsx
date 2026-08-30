"use client";

import type { OpportunityInvitationStatus, OpportunityProviderAction } from "@platform/db/client";

import {
  acceptOpportunityInvitationAction,
  declineOpportunityInvitationAction,
  hideOpportunityAction,
  saveOpportunityAction,
} from "@platform/portal-providers/app/opportunities/actions";
import { ActionForm } from "@platform/portal-shell/components/portal/ActionForm";

export function OpportunityCardActions({
  opportunityId,
  invitationId,
  invitationStatus,
  providerAction,
  saveLabel,
  savedLabel,
  hideLabel,
  acceptLabel,
  declineLabel,
}: {
  opportunityId: string;
  invitationId?: string;
  invitationStatus?: null | OpportunityInvitationStatus;
  providerAction?: null | OpportunityProviderAction;
  saveLabel: string;
  savedLabel: string;
  hideLabel: string;
  acceptLabel: string;
  declineLabel: string;
}) {
  if (invitationStatus === "PENDING" && invitationId) {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionForm
          action={acceptOpportunityInvitationAction}
          buttonLabel={acceptLabel}
          variant="default"
          formClassName=""
        >
          <HiddenId
            name="invitationId"
            value={invitationId}
          />
        </ActionForm>
        <ActionForm
          action={declineOpportunityInvitationAction}
          buttonLabel={declineLabel}
          variant="outline"
          formClassName=""
        >
          <HiddenId
            name="invitationId"
            value={invitationId}
          />
        </ActionForm>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {providerAction === "SAVED" ? (
        <span className="text-label font-extrabold uppercase tracking-eyebrow">{savedLabel}</span>
      ) : (
        <ActionForm
          action={saveOpportunityAction}
          buttonLabel={saveLabel}
          variant="outline"
          formClassName=""
        >
          <HiddenId
            name="opportunityId"
            value={opportunityId}
          />
        </ActionForm>
      )}
      <ActionForm
        action={hideOpportunityAction}
        buttonLabel={hideLabel}
        variant="ghost"
        formClassName=""
      >
        <HiddenId
          name="opportunityId"
          value={opportunityId}
        />
      </ActionForm>
    </div>
  );
}

function HiddenId({ name, value }: { name: string; value: string }) {
  return (
    <input
      type="hidden"
      name={name}
      value={value}
    />
  );
}
