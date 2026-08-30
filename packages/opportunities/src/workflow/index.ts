export { addAttachment } from "@platform/opportunities/workflow/attachments";
export { createOpportunity } from "@platform/opportunities/workflow/create";
export { updateOpportunityDraft } from "@platform/opportunities/workflow/draft";
export { addInternalNote } from "@platform/opportunities/workflow/notes";
export {
  addPosition,
  removePosition,
  updatePosition,
} from "@platform/opportunities/workflow/positions";
export type {
  AddAttachmentInput,
  CreateOpportunityInput,
  OpportunityPositionInput,
  UpdateOpportunityDraftInput,
} from "@platform/opportunities/workflow/shared";
export {
  setVisibilityMode,
  transitionOpportunityStatus,
} from "@platform/opportunities/workflow/status";
