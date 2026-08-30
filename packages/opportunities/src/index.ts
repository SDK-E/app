export { opportunityMachine } from "@sdk-e/opportunities/machine";
export {
  selectOpportunitySafe,
  selectOpportunityPositionSafe,
  canViewOpportunity,
} from "@sdk-e/opportunities/safe";
export type {
  OpportunityInternalRecord,
  OpportunityClientRecord,
  OpportunityPublicRecord,
  OpportunitySafeRecord,
  OpportunityPositionClientRecord,
  OpportunityPositionPublicRecord,
} from "@sdk-e/opportunities/safe";
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
} from "@sdk-e/opportunities/workflow";
export type {
  CreateOpportunityInput,
  UpdateOpportunityDraftInput,
  OpportunityPositionInput,
  AddAttachmentInput,
} from "@sdk-e/opportunities/workflow";
export {
  listOpportunities,
  getOpportunity,
  getOpportunityPositions,
  getOpportunityAttachments,
} from "@sdk-e/opportunities/queries";
export type { ListOpportunitiesFilters } from "@sdk-e/opportunities/queries";
