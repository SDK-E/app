/**
 * Documented, reviewed exceptions to the text contrast requirement
 * (7:1 body text, 4.5:1 large text). Matched against rendered pairs.
 *
 * Prefer fixing real issues over adding entries. Fields:
 *   urlContains — page path fragment (optional)
 *   textContains— visible text snippet (optional)
 *   fg / bg     — resolved hex colors, case-insensitive (required)
 *   theme       — "light" | "dark" (optional)
 */

export interface ContrastExemption {
  reason: string;
  urlContains?: string;
  textContains?: string;
  fg: string;
  bg: string;
  theme?: "light" | "dark";
}

export const EXEMPTIONS: ContrastExemption[] = [
  // Example shape — remove unused entries:
  // { fg: "#abc4a6", bg: "#082003", theme: "dark", reason: "decorative watermark" },
];
