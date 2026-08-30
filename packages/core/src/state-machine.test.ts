import { describe, expect, it } from "vitest";

import { defineStateMachine } from "@sdk-e/core/state-machine";

describe("state-machine", () => {
  const machine = defineStateMachine({
    initial: "DRAFT",
    transitions: [
      { from: "DRAFT", to: "SUBMITTED" },
      { from: "SUBMITTED", to: "IN_REVIEW" },
      { from: "IN_REVIEW", to: "APPROVED" },
      { from: "IN_REVIEW", to: "REJECTED" },
      { from: "REJECTED", to: "DRAFT" },
    ],
  });

  describe("defineStateMachine", () => {
    it("returns the configured initial state", () => {
      expect(machine.initial).toBe("DRAFT");
    });

    it("allows declared transitions", () => {
      expect(machine.canTransition("DRAFT", "SUBMITTED")).toBe(true);
      expect(machine.canTransition("IN_REVIEW", "APPROVED")).toBe(true);
    });

    it("denies undeclared transitions", () => {
      expect(machine.canTransition("DRAFT", "APPROVED")).toBe(false);
      expect(machine.canTransition("APPROVED", "REJECTED")).toBe(false);
    });

    it("getAllowedTransitions returns the correct set", () => {
      expect(machine.getAllowedTransitions("IN_REVIEW")).toContain("APPROVED");
      expect(machine.getAllowedTransitions("IN_REVIEW")).toContain("REJECTED");
      expect(machine.getAllowedTransitions("IN_REVIEW")).not.toContain("DRAFT");
    });

    it("assertTransition throws for undeclared transitions", () => {
      expect(() => machine.assertTransition("DRAFT", "APPROVED")).toThrow(
        "Invalid state transition"
      );
    });

    it("assertTransition does not throw for declared transitions", () => {
      expect(() => machine.assertTransition("DRAFT", "SUBMITTED")).not.toThrow();
    });
  });
});
