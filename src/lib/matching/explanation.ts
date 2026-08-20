import type { ScoreDimension } from "./types";

export interface BuildExplanationInput {
  dimensions: ScoreDimension[];
  eligibilityWarnings: string[];
}

export function buildExplanation(input: BuildExplanationInput): {
  explanation: { dimension: string; matchQuality: string; detail: string }[];
  warnings: string[];
} {
  const explanation: { dimension: string; matchQuality: string; detail: string }[] = [];
  for (const dim of input.dimensions) {
    let detail = "";
    switch (dim.name) {
      case "skills":
        detail = `${dim.matchQuality} skill alignment (${dim.raw}/100)`;
        break;
      case "seniority":
        detail = `${dim.matchQuality} seniority fit (${dim.raw}/100)`;
        break;
      case "rate":
        detail = `${dim.matchQuality} rate alignment (${dim.raw}/100)`;
        break;
      case "availability":
        detail = `${dim.matchQuality} availability (${dim.raw}/100)`;
        break;
      case "location":
        detail = `${dim.matchQuality} timezone overlap (${dim.raw}/100)`;
        break;
      case "language":
        detail = `${dim.matchQuality} language coverage (${dim.raw}/100)`;
        break;
      case "completeness":
        detail = `${dim.matchQuality} profile completeness (${dim.raw}/100)`;
        break;
      case "serviceFit":
        detail = `${dim.matchQuality} service portfolio fit (${dim.raw}/100)`;
        break;
    }
    explanation.push({ dimension: dim.name, matchQuality: dim.matchQuality, detail });
  }
  return { explanation, warnings: input.eligibilityWarnings };
}
