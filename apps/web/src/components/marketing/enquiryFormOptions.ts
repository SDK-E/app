import { type EnquiryResult } from "@platform/marketing/enquiries";

export const capabilityOptions = [
  { value: "aiEngineering", labelKey: "capabilities.aiEngineering" },
  { value: "softwareEngineering", labelKey: "capabilities.softwareEngineering" },
  { value: "frontendProduct", labelKey: "capabilities.frontendProduct" },
  { value: "cloudInfrastructure", labelKey: "capabilities.cloudInfrastructure" },
  { value: "dataCacheSearch", labelKey: "capabilities.dataCacheSearch" },
  { value: "modernization", labelKey: "capabilities.modernization" },
  { value: "other", labelKey: "capabilities.other" },
];

export const timelineOptions = [
  { value: "asap", labelKey: "timelines.asap" },
  { value: "oneToThreeMonths", labelKey: "timelines.oneToThreeMonths" },
  { value: "threeToSixMonths", labelKey: "timelines.threeToSixMonths" },
  { value: "sixPlusMonths", labelKey: "timelines.sixPlusMonths" },
  { value: "notSure", labelKey: "timelines.notSure" },
];

export const budgetOptions = [
  { value: "under10k", labelKey: "budgets.under10k" },
  { value: "tenToTwentyFiveK", labelKey: "budgets.tenToTwentyFiveK" },
  { value: "twentyFiveToFiftyK", labelKey: "budgets.twentyFiveToFiftyK" },
  { value: "fiftyPlusK", labelKey: "budgets.fiftyPlusK" },
  { value: "notSure", labelKey: "budgets.notSure" },
];

export function getErrorFromResult(result: EnquiryResult | null, name: string): string | undefined {
  if (!result || result.success) return undefined;
  return result.errors[name];
}

export function getFieldClass(result: EnquiryResult | null, name: string): string {
  const base =
    "w-full rounded-control border bg-paper px-4 py-3 text-body transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";
  const hasError = result && !result.success && result.errors[name];
  return hasError ? `${base} border-dark` : `${base} border-muted-foreground`;
}
