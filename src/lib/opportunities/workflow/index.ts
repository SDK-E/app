export { createOpportunity } from "@/lib/opportunities/workflow/create";
export { updateOpportunityDraft } from "@/lib/opportunities/workflow/draft";
export {
  transitionOpportunityStatus,
  setVisibilityMode,
} from "@/lib/opportunities/workflow/status";
export {
  addPosition,
  updatePosition,
  removePosition,
} from "@/lib/opportunities/workflow/positions";
export { addInternalNote } from "@/lib/opportunities/workflow/notes";
export { addAttachment } from "@/lib/opportunities/workflow/attachments";
export type {
  CreateOpportunityInput,
  UpdateOpportunityDraftInput,
  OpportunityPositionInput,
  AddAttachmentInput,
} from "@/lib/opportunities/workflow/shared";
