import {
  addMoney,
  assertSameCurrency,
  isValidCurrency,
  moneySchema,
  subtractMoney,
} from "@platform/core/money";
import { describe, expect, it } from "vitest";

describe("money", () => {
  describe("isValidCurrency", () => {
    it.each([["USD"], ["EUR"], ["GBP"]])("accepts %s", (code) => {
      expect(isValidCurrency(code)).toBe(true);
    });

    it.each([["usd"], ["US"], ["USDD"], [""]])("rejects %s", (code) => {
      expect(isValidCurrency(code)).toBe(false);
    });
  });

  describe("assertSameCurrency", () => {
    it("passes for matching currencies", () => {
      expect(() =>
        assertSameCurrency({ amount: 10, currency: "USD" }, { amount: 5, currency: "USD" }),
      ).not.toThrow();
    });

    it("throws for mismatched currencies", () => {
      expect(() =>
        assertSameCurrency({ amount: 10, currency: "USD" }, { amount: 5, currency: "EUR" }),
      ).toThrow("Currency mismatch");
    });
  });

  describe("addMoney", () => {
    it("adds amounts with matching currency", () => {
      expect(addMoney({ amount: 10, currency: "USD" }, { amount: 5, currency: "USD" })).toEqual({
        amount: 15,
        currency: "USD",
      });
    });

    it("rounds floating point sums to 2 decimal places", () => {
      expect(addMoney({ amount: 0.1, currency: "USD" }, { amount: 0.2, currency: "USD" })).toEqual({
        amount: 0.3,
        currency: "USD",
      });
    });

    it("throws on currency mismatch", () => {
      expect(() =>
        addMoney({ amount: 10, currency: "USD" }, { amount: 5, currency: "EUR" }),
      ).toThrow();
    });
  });

  describe("subtractMoney", () => {
    it("subtracts amounts with matching currency", () => {
      expect(
        subtractMoney({ amount: 10, currency: "USD" }, { amount: 3, currency: "USD" }),
      ).toEqual({
        amount: 7,
        currency: "USD",
      });
    });

    it("throws on currency mismatch", () => {
      expect(() =>
        subtractMoney({ amount: 10, currency: "USD" }, { amount: 5, currency: "EUR" }),
      ).toThrow();
    });
  });

  describe("moneySchema", () => {
    it("validates valid inputs", () => {
      expect(moneySchema.safeParse({ amount: 10.5, currency: "USD" })).toHaveProperty(
        "success",
        true,
      );
    });

    it("rejects invalid currency codes", () => {
      expect(moneySchema.safeParse({ amount: 10, currency: "US" })).toHaveProperty(
        "success",
        false,
      );
      expect(moneySchema.safeParse({ amount: 10, currency: "usd" })).toHaveProperty(
        "success",
        false,
      );
    });

    it("rejects non-finite amounts", () => {
      expect(moneySchema.safeParse({ amount: Infinity, currency: "USD" })).toHaveProperty(
        "success",
        false,
      );
    });
  });
});
