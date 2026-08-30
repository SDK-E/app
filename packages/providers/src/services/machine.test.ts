import { providerServiceMachine } from "@platform/providers/services/machine";
import { describe, expect, it } from "vitest";

describe("provider service state machine", () => {
  it("allows submit from DRAFT", () => {
    expect(providerServiceMachine.canTransition("DRAFT", "SUBMITTED")).toBe(true);
  });

  it("allows start-review from SUBMITTED", () => {
    expect(providerServiceMachine.canTransition("SUBMITTED", "UNDER_REVIEW")).toBe(true);
  });

  it("allows approve from UNDER_REVIEW", () => {
    expect(providerServiceMachine.canTransition("UNDER_REVIEW", "APPROVED")).toBe(true);
  });

  it("allows reject from UNDER_REVIEW", () => {
    expect(providerServiceMachine.canTransition("UNDER_REVIEW", "REJECTED")).toBe(true);
  });

  it("allows request-changes from UNDER_REVIEW", () => {
    expect(providerServiceMachine.canTransition("UNDER_REVIEW", "CHANGES_REQUESTED")).toBe(true);
  });

  it("allows re-submit after changes", () => {
    expect(providerServiceMachine.canTransition("CHANGES_REQUESTED", "SUBMITTED")).toBe(true);
  });

  it("allows re-submit after rejection via DRAFT", () => {
    expect(providerServiceMachine.canTransition("REJECTED", "DRAFT")).toBe(true);
    expect(providerServiceMachine.canTransition("DRAFT", "SUBMITTED")).toBe(true);
  });

  it("allows publish from APPROVED", () => {
    expect(providerServiceMachine.canTransition("APPROVED", "PUBLISHED")).toBe(true);
  });

  it("allows unpublish from APPROVED", () => {
    expect(providerServiceMachine.canTransition("APPROVED", "UNPUBLISHED")).toBe(true);
  });

  it("allows unpublish from PUBLISHED", () => {
    expect(providerServiceMachine.canTransition("PUBLISHED", "UNPUBLISHED")).toBe(true);
  });

  it("allows republish from UNPUBLISHED", () => {
    expect(providerServiceMachine.canTransition("UNPUBLISHED", "PUBLISHED")).toBe(true);
  });

  it("allows revert to DRAFT from UNPUBLISHED", () => {
    expect(providerServiceMachine.canTransition("UNPUBLISHED", "DRAFT")).toBe(true);
  });

  it("rejects direct DRAFT to PUBLISHED", () => {
    expect(providerServiceMachine.canTransition("DRAFT", "PUBLISHED")).toBe(false);
  });

  it("rejects direct SUBMITTED to PUBLISHED", () => {
    expect(providerServiceMachine.canTransition("SUBMITTED", "PUBLISHED")).toBe(false);
  });

  it("rejects direct DRAFT to APPROVED", () => {
    expect(providerServiceMachine.canTransition("DRAFT", "APPROVED")).toBe(false);
  });

  it("rejects PUBLISHED to DRAFT", () => {
    expect(providerServiceMachine.canTransition("PUBLISHED", "DRAFT")).toBe(false);
  });

  it("rejects PUBLISHED to SUBMITTED", () => {
    expect(providerServiceMachine.canTransition("PUBLISHED", "SUBMITTED")).toBe(false);
  });

  it("rejects APPROVED to REJECTED", () => {
    expect(providerServiceMachine.canTransition("APPROVED", "REJECTED")).toBe(false);
  });

  it("returns allowed transitions for each status", () => {
    expect(providerServiceMachine.getAllowedTransitions("DRAFT")).toEqual(["SUBMITTED"]);
    expect(providerServiceMachine.getAllowedTransitions("SUBMITTED")).toEqual(["UNDER_REVIEW"]);
    expect(providerServiceMachine.getAllowedTransitions("UNDER_REVIEW")).toEqual([
      "CHANGES_REQUESTED",
      "APPROVED",
      "REJECTED",
    ]);
    expect(providerServiceMachine.getAllowedTransitions("CHANGES_REQUESTED")).toEqual([
      "SUBMITTED",
    ]);
    expect(providerServiceMachine.getAllowedTransitions("REJECTED")).toEqual(["DRAFT"]);
    expect(providerServiceMachine.getAllowedTransitions("APPROVED")).toEqual([
      "PUBLISHED",
      "UNPUBLISHED",
    ]);
    expect(providerServiceMachine.getAllowedTransitions("PUBLISHED")).toEqual(["UNPUBLISHED"]);
    expect(providerServiceMachine.getAllowedTransitions("UNPUBLISHED")).toEqual([
      "PUBLISHED",
      "DRAFT",
    ]);
  });

  it("asserts valid transitions", () => {
    expect(() => providerServiceMachine.assertTransition("DRAFT", "SUBMITTED")).not.toThrow();
  });

  it("throws on invalid transition", () => {
    expect(() => providerServiceMachine.assertTransition("DRAFT", "PUBLISHED")).toThrow(
      "Invalid state transition from DRAFT to PUBLISHED",
    );
  });
});
