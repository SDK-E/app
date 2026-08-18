import { defineStateMachine } from "@/lib/state-machine";
import type { ProviderStatus } from "@/generated/prisma/client";

export const providerApplicationMachine = defineStateMachine<ProviderStatus>({
  initial: "DRAFT",
  transitions: [
    { from: "DRAFT", to: "SUBMITTED" },
    { from: "SUBMITTED", to: "UNDER_REVIEW" },
    { from: "UNDER_REVIEW", to: "CHANGES_REQUESTED" },
    { from: "UNDER_REVIEW", to: "APPROVED" },
    { from: "UNDER_REVIEW", to: "REJECTED" },
    { from: "CHANGES_REQUESTED", to: "SUBMITTED" },
    { from: "REJECTED", to: "DRAFT" },
  ],
});
