import { z } from "zod";

export interface Money {
  amount: number;
  currency: string;
}

const ISO_4217_REGEX = /^[A-Z]{3}$/;

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return {
    amount: roundCurrency(a.amount + b.amount),
    currency: a.currency,
  };
}

export function assertSameCurrency(a: Money, b: Money): void {
  if (!isSameCurrency(a, b)) {
    throw new Error(`Currency mismatch: ${a.currency} !== ${b.currency}`);
  }
}

export function isSameCurrency(a: Money, b: Money): boolean {
  return a.currency === b.currency;
}

export function isValidCurrency(code: string): boolean {
  return ISO_4217_REGEX.test(code);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return {
    amount: roundCurrency(a.amount - b.amount),
    currency: a.currency,
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export const moneySchema = z.object({
  amount: z.number().finite(),
  currency: z
    .string()
    .regex(ISO_4217_REGEX, "Currency must be a valid ISO 4217 code (e.g. USD, EUR)."),
});

export type MoneySchema = z.infer<typeof moneySchema>;
