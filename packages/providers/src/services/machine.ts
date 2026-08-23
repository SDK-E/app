import { defineStateMachine } from "@sdk-e/core/state-machine";
import type { ServiceStatus } from "@sdk-e/db/client";

export const providerServiceMachine = defineStateMachine<ServiceStatus>({
  initial: "DRAFT",
  transitions: [
    { from: "DRAFT", to: "SUBMITTED" },
    { from: "SUBMITTED", to: "UNDER_REVIEW" },
    { from: "UNDER_REVIEW", to: "CHANGES_REQUESTED" },
    { from: "UNDER_REVIEW", to: "APPROVED" },
    { from: "UNDER_REVIEW", to: "REJECTED" },
    { from: "CHANGES_REQUESTED", to: "SUBMITTED" },
    { from: "REJECTED", to: "DRAFT" },
    { from: "APPROVED", to: "PUBLISHED" },
    { from: "APPROVED", to: "UNPUBLISHED" },
    { from: "PUBLISHED", to: "UNPUBLISHED" },
    { from: "UNPUBLISHED", to: "PUBLISHED" },
    { from: "UNPUBLISHED", to: "DRAFT" },
  ],
});
