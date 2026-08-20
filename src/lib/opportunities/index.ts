export { opportunityMachine } from "@/lib/opportunities/machine";
export {
  selectOpportunitySafe,
  selectOpportunityPositionSafe,
  canViewOpportunity,
} from "@/lib/opportunities/safe";
export type {
  OpportunityInternalRecord,
  OpportunityClientRecord,
  OpportunityPublicRecord,
  OpportunitySafeRecord,
  OpportunityPositionClientRecord,
  OpportunityPositionPublicRecord,
} from "@/lib/opportunities/safe";
export {
  createOpportunity,
  updateOpportunityDraft,
  transitionOpportunityStatus,
  setVisibilityMode,
  addPosition,
  updatePosition,
  removePosition,
  addInternalNote,
  addAttachment,
} from "@/lib/opportunities/workflow";
export type {
  CreateOpportunityInput,
  UpdateOpportunityDraftInput,
  OpportunityPositionInput,
  AddAttachmentInput,
} from "@/lib/opportunities/workflow";
export {
  listOpportunities,
  getOpportunity,
  getOpportunityPositions,
  getOpportunityAttachments,
} from "@/lib/opportunities/queries";
export type { ListOpportunitiesFilters } from "@/lib/opportunities/queries";
