import { ActionForm } from "@sdk-e/portal-shell/components/portal/ActionForm";
import { Card } from "@sdk-e/ui/Card";
import {
  acceptProposalAction,
  convertAction,
  replyAction,
  sdkDecisionAction,
} from "@sdk-e/portal-shell/app/companies/[companyId]/requests/actions";
import type { AssignedPrincipal } from "@sdk-e/types";
import type { RequestDetail, Translator } from "@sdk-e/requests/types";

const control =
  "mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-4 py-3 text-body text-dark outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export async function RequestActionPanels({
  locale,
  companyId,
  request,
  principal,
  staffT,
  clientT,
}: {
  locale: string;
  companyId: string;
  request: RequestDetail;
  principal: AssignedPrincipal;
  staffT: Translator;
  clientT: Translator;
}) {
  if (principal.kind !== "sdk-staff") {
    return (
      <div className="space-y-6">
        {request.status === "INFORMATION_REQUIRED" ? (
          <Card>
            <ActionForm
              action={replyAction.bind(null, locale, companyId, request.id)}
              buttonLabel={clientT("reply")}
              pendingLabel={clientT("form.working")}
            >
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {clientT("reply")}
                <textarea className={control} name="content" rows={5} required />
              </label>
            </ActionForm>
          </Card>
        ) : null}
        {request.status === "PROPOSAL_READY" ? (
          <Card>
            <ActionForm
              action={acceptProposalAction.bind(null, locale, companyId, request.id)}
              buttonLabel={clientT("accept")}
              pendingLabel={clientT("form.working")}
            />
          </Card>
        ) : null}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {request.status === "SUBMITTED" ? (
        <Card>
          <ActionForm
            action={sdkDecisionAction.bind(null, locale, companyId, request.id)}
            buttonLabel={staffT("startReview")}
          >
            <input type="hidden" name="decision" value="start-review" />
          </ActionForm>
        </Card>
      ) : null}
      {request.status === "IN_REVIEW" ? (
        <>
          <Card>
            <ActionForm
              action={sdkDecisionAction.bind(null, locale, companyId, request.id)}
              buttonLabel={staffT("requestInformation")}
            >
              <input type="hidden" name="decision" value="request-information" />
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {staffT("response")}
                <textarea className={control} name="content" rows={5} required />
              </label>
            </ActionForm>
          </Card>
          <Card>
            <ActionForm
              action={sdkDecisionAction.bind(null, locale, companyId, request.id)}
              buttonLabel={staffT("proposalReady")}
            >
              <input type="hidden" name="decision" value="proposal-ready" />
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {staffT("response")}
                <textarea className={control} name="content" rows={5} required />
              </label>
            </ActionForm>
          </Card>
        </>
      ) : null}
      {["SUBMITTED", "IN_REVIEW", "INFORMATION_REQUIRED", "PROPOSAL_READY"].includes(
        request.status
      ) ? (
        <Card>
          <ActionForm
            action={sdkDecisionAction.bind(null, locale, companyId, request.id)}
            buttonLabel={staffT("reject")}
            variant="destructive"
          >
            <input type="hidden" name="decision" value="reject" />
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {staffT("response")}
              <textarea className={control} name="content" rows={4} required />
            </label>
          </ActionForm>
        </Card>
      ) : null}
      {request.status === "APPROVED" && !request.projects.length ? (
        <Card>
          <h2 className="text-h3 font-extrabold">{staffT("convert")}</h2>
          <div className="mt-5">
            <ActionForm
              action={convertAction.bind(null, locale, companyId, request.id)}
              buttonLabel={staffT("convert")}
            >
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {staffT("projectName")}
                <input className={control} name="name" required />
              </label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {staffT("projectDescription")}
                <textarea className={control} name="description" rows={5} required />
              </label>
            </ActionForm>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
