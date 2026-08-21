"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import {
  acceptOpportunityInvitationAction,
  declineOpportunityInvitationAction,
  hideOpportunityAction,
  saveOpportunityAction,
} from "@/app/[locale]/(app)/app/opportunities/actions";
import type {
  OpportunityInvitationStatus,
  OpportunityProviderAction,
} from "@/generated/prisma/client";

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
        <span className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
          {savedLabel}
        </span>
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
