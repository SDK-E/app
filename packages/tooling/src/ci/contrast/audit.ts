/** Per-page theme auditing: collects rendered text pairs and applies WCAG thresholds. */

import type { Page } from "playwright";

import { blend, contrastRatio, format, parseColor } from "./color";
import { EXEMPTIONS } from "./exemptions";
import { COLLECT_PAIRS_SCRIPT } from "./in-page";

const NORMAL_MIN = 7;
const LARGE_MIN = 4.5;

export interface TextPair {
  text: string;
  tag: string;
  color: string;
  bg: string;
  fontSize: number;
  fontWeight: number;
}

export interface Violation extends TextPair {
  urlPath: string;
  theme: "dark" | "light";
  ratio: number;
  required: number;
  fgHex: string;
}

export async function auditTheme(
  page: Page,
  theme: "dark" | "light",
  baseUrl: string,
  urlPath: string,
): Promise<Violation[]> {
  await page.goto(`${baseUrl}${urlPath}`, { waitUntil: "networkidle" });
  // Off-origin landings (Auth0 hosted login) are outside this audit.
  if (!page.url().startsWith(baseUrl)) return [];
  const rootClass = (await page.evaluate("document.documentElement.className")) as string;
  const wantsDark = rootClass.split(/\s+/).includes("dark");
  if (wantsDark !== (theme === "dark")) {
    console.log(
      `WARN ${urlPath}: expected ${theme} but page resolved to ${wantsDark ? "dark" : "light"}`,
    );
  }
  const pairs = await collectPairs(page);
  return judgePairs(page.url(), urlPath, theme, pairs);
}

export async function collectPairs(page: Page): Promise<TextPair[]> {
  const rows = (await page.evaluate(COLLECT_PAIRS_SCRIPT)) as {
    text: unknown;
    tag: unknown;
    color: unknown;
    bg: unknown;
    fontSize: unknown;
    fontWeight: unknown;
  }[];
  return rows.map((row) => ({
    text: String(row.text),
    tag: String(row.tag),
    color: String(row.color),
    bg: String(row.bg),
    fontSize: Number(row.fontSize),
    fontWeight: Number(row.fontWeight),
  }));
}

export function judgePairs(
  pageUrl: string,
  urlPath: string,
  theme: "dark" | "light",
  pairs: TextPair[],
): Violation[] {
  const violations: Violation[] = [];
  for (const pair of pairs) {
    const parsedFg = parseColor(pair.color);
    const bg = parseColor(pair.bg);
    if (!parsedFg || !bg) continue;
    // Text color may itself carry alpha; composite it onto the backdrop.
    const fg =
      parsedFg.a < 1
        ? {
            ...blend({ r: parsedFg.r, g: parsedFg.g, b: parsedFg.b }, parsedFg.a, {
              r: bg.r,
              g: bg.g,
              b: bg.b,
            }),
            a: 1,
          }
        : parsedFg;
    const large = pair.fontSize >= 24 || (pair.fontSize >= 18.66 && pair.fontWeight >= 700);
    const required = large ? LARGE_MIN : NORMAL_MIN;
    const ratio = contrastRatio(fg, bg);
    if (ratio >= required) continue;
    const exempt = EXEMPTIONS.some(
      (entry) =>
        entry.fg.toLowerCase() === format(fg).toLowerCase() &&
        entry.bg.toLowerCase() === format(bg).toLowerCase() &&
        (!entry.theme || entry.theme === theme) &&
        (!entry.urlContains || pageUrl.includes(entry.urlContains)) &&
        (!entry.textContains || pair.text.includes(entry.textContains)),
    );
    if (exempt) continue;
    violations.push({
      ...pair,
      fgHex: format(fg),
      bg: format(bg),
      urlPath,
      theme,
      ratio,
      required,
    });
  }
  return violations;
}
