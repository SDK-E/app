"use client";

import { ActionForm } from "@sdk-e/portal-shell/components/portal/ActionForm";
import {
  acceptOpportunityInvitationAction,
  declineOpportunityInvitationAction,
  hideOpportunityAction,
  saveOpportunityAction,
} from "@sdk-e/portal-providers/app/opportunities/actions";
import type { OpportunityInvitationStatus, OpportunityProviderAction } from "@sdk-e/db/client";

function HiddenId({ name, value }: { name: string; value: string }) {
  return <input type="hidden" name={name} value={value} />;
}

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
  invitationStatus?: OpportunityInvitationStatus | null;
  providerAction?: OpportunityProviderAction | null;
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
          <HiddenId name="invitationId" value={invitationId} />
        </ActionForm>
        <ActionForm
          action={declineOpportunityInvitationAction}
          buttonLabel={declineLabel}
          variant="outline"
          formClassName=""
        >
          <HiddenId name="invitationId" value={invitationId} />
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
          <HiddenId name="opportunityId" value={opportunityId} />
        </ActionForm>
      )}
      <ActionForm
        action={hideOpportunityAction}
        buttonLabel={hideLabel}
        variant="ghost"
        formClassName=""
      >
        <HiddenId name="opportunityId" value={opportunityId} />
      </ActionForm>
    </div>
  );
}
