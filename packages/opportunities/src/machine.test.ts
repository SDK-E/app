import { describe, expect, it } from "vitest";
import { opportunityMachine } from "@sdk-e/opportunities/machine";

describe("opportunity state machine", () => {
  it("allows the linear happy path", () => {
    const path: [string, string][] = [
      ["DRAFT", "READY"],
      ["READY", "MATCHING"],
      ["MATCHING", "OPEN"],
      ["OPEN", "REVIEWING_PROPOSALS"],
      ["REVIEWING_PROPOSALS", "SHORTLISTING"],
      ["SHORTLISTING", "SELECTION"],
      ["SELECTION", "PENDING_PROVIDER_ACCEPTANCE"],
      ["PENDING_PROVIDER_ACCEPTANCE", "FILLED"],
      ["FILLED", "CLOSED"],
    ];
    for (const [from, to] of path) {
      expect(opportunityMachine.canTransition(from as never, to as never), `${from} -> ${to}`).toBe(
        true
      );
    }
  });

  it("allows any active state to go ON_HOLD", () => {
    for (const from of [
      "READY",
      "MATCHING",
      "OPEN",
      "REVIEWING_PROPOSALS",
      "SHORTLISTING",
      "SELECTION",
      "PENDING_PROVIDER_ACCEPTANCE",
    ]) {
      expect(opportunityMachine.canTransition(from as never, "ON_HOLD")).toBe(true);
    }
  });

  it("allows ON_HOLD to resume to active states but never to DRAFT", () => {
    for (const to of [
      "READY",
      "MATCHING",
      "OPEN",
      "REVIEWING_PROPOSALS",
      "SHORTLISTING",
      "SELECTION",
    ]) {
      expect(opportunityMachine.canTransition("ON_HOLD", to as never)).toBe(true);
    }
    expect(opportunityMachine.canTransition("ON_HOLD", "DRAFT")).toBe(false);
  });

  it("allows any non-terminal state to CANCELLED or EXPIRED", () => {
    for (const from of [
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
    ]) {
      expect(opportunityMachine.canTransition(from as never, "CANCELLED")).toBe(true);
      expect(opportunityMachine.canTransition(from as never, "EXPIRED")).toBe(true);
    }
  });

  it("rejects terminal states transitioning out", () => {
    expect(opportunityMachine.canTransition("CLOSED", "DRAFT")).toBe(false);
    expect(opportunityMachine.canTransition("CANCELLED", "DRAFT")).toBe(false);
    expect(opportunityMachine.canTransition("EXPIRED", "DRAFT")).toBe(false);
  });

  it("rejects skipping states in the happy path", () => {
    expect(opportunityMachine.canTransition("DRAFT", "OPEN")).toBe(false);
    expect(opportunityMachine.canTransition("READY", "OPEN")).toBe(false);
    expect(opportunityMachine.canTransition("DRAFT", "FILLED")).toBe(false);
  });

  it("asserts valid transitions", () => {
    expect(() => opportunityMachine.assertTransition("DRAFT", "READY")).not.toThrow();
  });

  it("throws on invalid transitions", () => {
    expect(() => opportunityMachine.assertTransition("DRAFT", "OPEN")).toThrow(
      "Invalid state transition from DRAFT to OPEN"
    );
  });

  it("returns allowed transitions for each state", () => {
    expect(opportunityMachine.getAllowedTransitions("DRAFT")).toEqual([
      "READY",
      "CANCELLED",
      "EXPIRED",
    ]);
    expect(opportunityMachine.getAllowedTransitions("READY")).toEqual([
      "MATCHING",
      "ON_HOLD",
      "CANCELLED",
      "EXPIRED",
    ]);
    expect(opportunityMachine.getAllowedTransitions("ON_HOLD")).toEqual([
      "READY",
      "MATCHING",
      "OPEN",
      "REVIEWING_PROPOSALS",
      "SHORTLISTING",
      "SELECTION",
      "CANCELLED",
      "EXPIRED",
    ]);
    expect(opportunityMachine.getAllowedTransitions("CLOSED")).toEqual([]);
  });
});
