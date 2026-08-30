import type { OpportunityStatus } from "@platform/db/client";

import { defineStateMachine } from "@platform/core/state-machine";

const ACTIVE_STATES: OpportunityStatus[] = [
  "READY",
  "MATCHING",
  "OPEN",
  "REVIEWING_PROPOSALS",
  "SHORTLISTING",
  "SELECTION",
  "PENDING_PROVIDER_ACCEPTANCE",
];

const NON_TERMINAL_STATES: OpportunityStatus[] = [
  "DRAFT",
  "READY",
  "MATCHING",
  "OPEN",
  "REVIEWING_PROPOSALS",
  "SHORTLISTING",
  "SELECTION",
  "PENDING_PROVIDER_ACCEPTANCE",
  "FILLED",
  "ON_HOLD",
];

const ON_HOLD_RESUME_STATES: OpportunityStatus[] = [
  "READY",
  "MATCHING",
  "OPEN",
  "REVIEWING_PROPOSALS",
  "SHORTLISTING",
  "SELECTION",
];

export const opportunityMachine = defineStateMachine<OpportunityStatus>({
  initial: "DRAFT",
  transitions: [
    { from: "DRAFT", to: "READY" },
    { from: "READY", to: "MATCHING" },
    { from: "MATCHING", to: "OPEN" },
    { from: "OPEN", to: "REVIEWING_PROPOSALS" },
    { from: "REVIEWING_PROPOSALS", to: "SHORTLISTING" },
    { from: "SHORTLISTING", to: "SELECTION" },
    { from: "SELECTION", to: "PENDING_PROVIDER_ACCEPTANCE" },
    { from: "PENDING_PROVIDER_ACCEPTANCE", to: "FILLED" },
    { from: "FILLED", to: "CLOSED" },
    ...ACTIVE_STATES.map((from) => ({ from, to: "ON_HOLD" as OpportunityStatus })),
    ...ON_HOLD_RESUME_STATES.map((to) => ({ from: "ON_HOLD" as OpportunityStatus, to })),
    ...NON_TERMINAL_STATES.map((from) => ({ from, to: "CANCELLED" as OpportunityStatus })),
    ...NON_TERMINAL_STATES.map((from) => ({ from, to: "EXPIRED" as OpportunityStatus })),
  ],
});
