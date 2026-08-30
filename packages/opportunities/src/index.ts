export { opportunityMachine } from "@platform/opportunities/machine";
export {
  getOpportunity,
  getOpportunityAttachments,
  getOpportunityPositions,
  listOpportunities,
} from "@platform/opportunities/queries";
export type { ListOpportunitiesFilters } from "@platform/opportunities/queries";
export {
  canViewOpportunity,
  selectOpportunityPositionSafe,
  selectOpportunitySafe,
} from "@platform/opportunities/safe";
export type {
  OpportunityClientRecord,
  OpportunityInternalRecord,
  OpportunityPositionClientRecord,
  OpportunityPositionPublicRecord,
  OpportunityPublicRecord,
  OpportunitySafeRecord,
} from "@platform/opportunities/safe";
export {
  addAttachment,
  addInternalNote,
  addPosition,
  createOpportunity,
  removePosition,
  setVisibilityMode,
  transitionOpportunityStatus,
  updateOpportunityDraft,
  updatePosition,
} from "@platform/opportunities/workflow";
export type {
  AddAttachmentInput,
  CreateOpportunityInput,
  OpportunityPositionInput,
  UpdateOpportunityDraftInput,
} from "@platform/opportunities/workflow";
