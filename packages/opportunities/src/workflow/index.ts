export { createOpportunity } from "@sdk-e/opportunities/workflow/create";
export { updateOpportunityDraft } from "@sdk-e/opportunities/workflow/draft";
export {
  transitionOpportunityStatus,
  setVisibilityMode,
} from "@sdk-e/opportunities/workflow/status";
export {
  addPosition,
  updatePosition,
  removePosition,
} from "@sdk-e/opportunities/workflow/positions";
export { addInternalNote } from "@sdk-e/opportunities/workflow/notes";
export { addAttachment } from "@sdk-e/opportunities/workflow/attachments";
export type {
  CreateOpportunityInput,
  UpdateOpportunityDraftInput,
  OpportunityPositionInput,
  AddAttachmentInput,
} from "@sdk-e/opportunities/workflow/shared";
