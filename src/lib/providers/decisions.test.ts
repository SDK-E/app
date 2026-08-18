import { describe, expect, it } from "vitest";
import { defineStateMachine } from "@/lib/state-machine";
import type { ProviderStatus } from "@/generated/prisma/client";

const providerApplicationMachine = defineStateMachine<ProviderStatus>({
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

describe("provider application state machine", () => {
  it("allows start-review from SUBMITTED", () => {
    expect(providerApplicationMachine.canTransition("SUBMITTED", "UNDER_REVIEW")).toBe(true);
  });

  it("allows request-changes from UNDER_REVIEW", () => {
    expect(providerApplicationMachine.canTransition("UNDER_REVIEW", "CHANGES_REQUESTED")).toBe(
      true
    );
  });

  it("allows approve from UNDER_REVIEW", () => {
    expect(providerApplicationMachine.canTransition("UNDER_REVIEW", "APPROVED")).toBe(true);
  });

  it("allows reject from UNDER_REVIEW", () => {
    expect(providerApplicationMachine.canTransition("UNDER_REVIEW", "REJECTED")).toBe(true);
  });

  it("allows re-submit after changes", () => {
    expect(providerApplicationMachine.canTransition("CHANGES_REQUESTED", "SUBMITTED")).toBe(true);
  });

  it("allows re-submit after rejection via DRAFT", () => {
    expect(providerApplicationMachine.canTransition("REJECTED", "DRAFT")).toBe(true);
    expect(providerApplicationMachine.canTransition("DRAFT", "SUBMITTED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(providerApplicationMachine.canTransition("DRAFT", "APPROVED")).toBe(false);
    expect(providerApplicationMachine.canTransition("SUBMITTED", "APPROVED")).toBe(false);
    expect(providerApplicationMachine.canTransition("APPROVED", "REJECTED")).toBe(false);
    expect(providerApplicationMachine.canTransition("REJECTED", "APPROVED")).toBe(false);
    expect(providerApplicationMachine.canTransition("CHANGES_REQUESTED", "APPROVED")).toBe(false);
  });

  it("returns allowed transitions for each status", () => {
    expect(providerApplicationMachine.getAllowedTransitions("DRAFT")).toEqual(["SUBMITTED"]);
    expect(providerApplicationMachine.getAllowedTransitions("SUBMITTED")).toEqual(["UNDER_REVIEW"]);
    expect(providerApplicationMachine.getAllowedTransitions("UNDER_REVIEW")).toEqual([
      "CHANGES_REQUESTED",
      "APPROVED",
      "REJECTED",
    ]);
    expect(providerApplicationMachine.getAllowedTransitions("CHANGES_REQUESTED")).toEqual([
      "SUBMITTED",
    ]);
    expect(providerApplicationMachine.getAllowedTransitions("REJECTED")).toEqual(["DRAFT"]);
  });

  it("asserts valid transitions", () => {
    expect(() =>
      providerApplicationMachine.assertTransition("SUBMITTED", "UNDER_REVIEW")
    ).not.toThrow();
  });

  it("throws on invalid transition", () => {
    expect(() => providerApplicationMachine.assertTransition("DRAFT", "APPROVED")).toThrow(
      "Invalid state transition from DRAFT to APPROVED"
    );
  });
});
