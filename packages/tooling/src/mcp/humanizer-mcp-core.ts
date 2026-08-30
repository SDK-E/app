export const patterns = [
  /https?:\/\/[^\s)\]}>,]+/gu,
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu,
  /`[^`\n]+`/gu,
  /\b(?:\d[\d,.]*)(?:%|ms|s|MB|GB|TB|px|rem|em|€|\$|£)?\b/gu,
  /\b[A-Z][A-Z0-9_]{2,}\b/gu,
  /\b(?:[A-Za-z_$][\w$]*\.)+[A-Za-z_$][\w$]*\b/gu,
];

export const supportedFileExtensions = new Set([".adoc", ".md", ".mdx", ".rst", ".txt"]);
export const maxFileBytes = 200_000;

export const lightEdits: readonly (readonly [RegExp, string])[] = [
  [/\bit is important to note that\s+/giu, ""],
  [/\bit should be noted that\s+/giu, ""],
  [/\bin order to\b/giu, "to"],
  [/\bdue to the fact that\b/giu, "because"],
  [/\bat this point in time\b/giu, "now"],
  [/\b(?:has|have) the ability to\b/giu, "can"],
  [/\bmake use of\b/giu, "use"],
  [/\butili[sz]e\b/giu, "use"],
];

export const standardEdits: readonly (readonly [RegExp, string])[] = [
  [/\bfurthermore,?\s*/giu, ""],
  [/\bmoreover,?\s*/giu, ""],
  [/\badditionally,?\s*/giu, ""],
  [/\bin today(?:'|’)s (?:fast-paced|ever-changing) (?:world|landscape),?\s*/giu, ""],
  [/\bserves as a testament to\b/giu, "shows"],
  [/\bplays a crucial role in\b/giu, "helps"],
  [/\bnavigate the complexities of\b/giu, "handle"],
  [/\bdelve into\b/giu, "examine"],
  [/\bleverage\b/giu, "use"],
  [/\bseamlessly\s+/giu, ""],
  [/\binnovative solutions?\b/giu, "software"],
  [/\bcutting-edge\b/giu, "current"],
  [/\bgame-changing\b/giu, "significant"],
  [/\bbest-in-class\b/giu, "well-designed"],
];

export function changedProtectedValues(
  original: string,
  rewritten: string,
  explicit: string[] = [],
): string[] {
  return protectedValues(original, explicit).filter(
    (value) => original.split(value).length !== rewritten.split(value).length,
  );
}

export function humanizeChecked(
  text: string,
  intensity: "light" | "standard",
  protectedTerms: string[],
): { text: string; changed: string[] } {
  const rewritten = humanizeLocally(text, intensity, protectedTerms);
  return {
    text: rewritten,
    changed: changedProtectedValues(text, rewritten, protectedTerms),
  };
}

export function humanizeLocally(
  text: string,
  intensity: "light" | "standard" = "standard",
  explicit: string[] = [],
): string {
  const guarded = protect(text, protectedValues(text, explicit));
  const edits = intensity === "light" ? lightEdits : [...lightEdits, ...standardEdits];
  let edited = guarded.masked;
  for (const [pattern, replacement] of edits) edited = edited.replace(pattern, replacement);
  edited = edited
    .split(/(\n{2,})/u)
    .map((part) => (part.startsWith("\n") ? part : tidyParagraph(part)))
    .join("");
  return guarded.restore(edited);
}

export function processingError(scope: string, error: unknown): string {
  return `Unable to humanize ${scope}: ${error instanceof Error ? error.message : "unknown error"}`;
}

export function protectedError(changed: string[]): string {
  return `Humanization rejected because protected values changed: ${changed.map((value) => JSON.stringify(value)).join(", ")}. Keep the original and revise manually.`;
}

export function protectedValues(text: string, explicit: string[] = []): string[] {
  const values = [...explicit, ...fencedBlocks(text)];
  patterns.forEach((pattern, index) => {
    const matches = text.match(pattern) ?? [];
    values.push(
      ...(index === 0 ? matches.map((value) => value.replace(/[.,;:!?]+$/u, "")) : matches),
    );
  });
  return [...new Set(values.filter(Boolean))];
}

function fencedBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.match(/[^\n]*(?:\n|$)/gu) ?? [];
  let offset = 0;
  let open: { character: "`" | "~"; length: number; start: number } | undefined;

  for (const lineWithEnding of lines) {
    if (lineWithEnding === "") continue;
    const line = lineWithEnding.replace(/\r?\n$/u, "");
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u);
    if (!open && fence) {
      open = {
        character: fence[1][0] as "`" | "~",
        length: fence[1].length,
        start: offset,
      };
    } else if (open && fence) {
      const marker = fence[1];
      const remainder = fence[2];
      if (marker[0] === open.character && marker.length >= open.length && remainder.trim() === "") {
        blocks.push(text.slice(open.start, offset + lineWithEnding.length));
        open = undefined;
      }
    }
    offset += lineWithEnding.length;
  }

  if (open) {
    throw new Error("unclosed Markdown code fence; input was not modified");
  }
  return blocks;
}

function protect(
  text: string,
  terms: string[],
): { masked: string; restore: (value: string) => string } {
  const replacements = [...terms].sort((left, right) => right.length - left.length);
  let masked = text;
  const tokens = new Map<string, string>();
  replacements.forEach((term, index) => {
    const token = `\uE000PROTECTED_${index}\uE001`;
    if (masked.includes(term)) {
      masked = masked.split(term).join(token);
      tokens.set(token, term);
    }
  });
  return {
    masked,
    restore: (value) => {
      let restored = value;
      for (const [token, term] of tokens) restored = restored.split(token).join(term);
      return restored;
    },
  };
}

function tidyParagraph(paragraph: string): string {
  const tidied = paragraph
    .replace(/[ \t]{2,}/gu, " ")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .trim();
  return tidied.replace(
    /(^|[.!?]\s+)([a-z])/gu,
    (_match, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`,
  );
}
