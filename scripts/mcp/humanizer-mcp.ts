import { readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "project-copy-humanizer", version: "1.0.0" });
const patterns = [
  /https?:\/\/[^\s)\]}>,]+/gu,
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu,
  /`[^`\n]+`/gu,
  /\b(?:\d[\d,.]*)(?:%|ms|s|MB|GB|TB|px|rem|em|€|\$|£)?\b/gu,
  /\b[A-Z][A-Z0-9_]{2,}\b/gu,
  /\b(?:[A-Za-z_$][\w$]*\.)+[A-Za-z_$][\w$]*\b/gu,
];

const supportedFileExtensions = new Set([".adoc", ".md", ".mdx", ".rst", ".txt"]);
const maxFileBytes = 200_000;

const lightEdits: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bit is important to note that\s+/giu, ""],
  [/\bit should be noted that\s+/giu, ""],
  [/\bin order to\b/giu, "to"],
  [/\bdue to the fact that\b/giu, "because"],
  [/\bat this point in time\b/giu, "now"],
  [/\b(?:has|have) the ability to\b/giu, "can"],
  [/\bmake use of\b/giu, "use"],
  [/\butili[sz]e\b/giu, "use"],
];

const standardEdits: ReadonlyArray<readonly [RegExp, string]> = [
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

export function protectedValues(text: string, explicit: string[] = []): string[] {
  const values = [...explicit, ...fencedBlocks(text)];
  patterns.forEach((pattern, index) => {
    const matches = text.match(pattern) ?? [];
    values.push(
      ...(index === 0 ? matches.map((value) => value.replace(/[.,;:!?]+$/u, "")) : matches)
    );
  });
  return [...new Set(values.filter(Boolean))];
}

export function changedProtectedValues(
  original: string,
  rewritten: string,
  explicit: string[] = []
): string[] {
  return protectedValues(original, explicit).filter(
    (value) => original.split(value).length !== rewritten.split(value).length
  );
}

function protect(
  text: string,
  terms: string[]
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
    (_match, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`
  );
}

export function humanizeLocally(
  text: string,
  intensity: "light" | "standard" = "standard",
  explicit: string[] = []
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

function humanizeChecked(
  text: string,
  intensity: "light" | "standard",
  protectedTerms: string[]
): { text: string; changed: string[] } {
  const rewritten = humanizeLocally(text, intensity, protectedTerms);
  return {
    text: rewritten,
    changed: changedProtectedValues(text, rewritten, protectedTerms),
  };
}

function protectedError(changed: string[]): string {
  return `Humanization rejected because protected values changed: ${changed.map((value) => JSON.stringify(value)).join(", ")}. Keep the original and revise manually.`;
}

function processingError(scope: string, error: unknown): string {
  return `Unable to humanize ${scope}: ${error instanceof Error ? error.message : "unknown error"}`;
}

async function readableProjectFile(filePath: string): Promise<string> {
  const projectRoot = await realpath(process.cwd());
  const requestedPath = isAbsolute(filePath) ? filePath : resolve(projectRoot, filePath);
  const resolvedPath = await realpath(requestedPath);
  const projectRelativePath = relative(projectRoot, resolvedPath);
  if (projectRelativePath.startsWith("..") || isAbsolute(projectRelativePath)) {
    throw new Error("file must be inside the project workspace");
  }
  if (!supportedFileExtensions.has(extname(resolvedPath).toLowerCase())) {
    throw new Error("file must be human-readable prose (.md, .mdx, .txt, .rst, or .adoc)");
  }
  const fileStat = await stat(resolvedPath);
  if (!fileStat.isFile()) throw new Error("path must identify a regular file");
  if (fileStat.size > maxFileBytes) throw new Error(`file exceeds ${maxFileBytes} bytes`);
  return readFile(resolvedPath, "utf8");
}

server.registerTool(
  "humanize_text",
  {
    description:
      "Conservatively edit human-facing prose by removing formulaic transitions, filler, bureaucratic phrasing, and common buzzwords while preserving protected facts. Runs locally in every MCP host with no sampling, model, API key, network call, or external service. Use selectively for public copy, documentation, UI/product text, emails, and long prose. Treat the result as an editing pass, not a source of truth. Never use to evade AI detection or on source code, machine-readable data, exact legal/verbatim text, configuration, migrations, schemas, or error codes.",
    inputSchema: {
      text: z.string().min(1).max(50_000).describe("Prose to edit."),
      purpose: z.string().max(500).optional().describe("Audience and purpose, without new facts."),
      intensity: z.enum(["light", "standard"]).default("standard"),
      protected_terms: z.array(z.string().min(1)).max(100).default([]),
    },
  },
  async ({ text, intensity, protected_terms }) => {
    try {
      const result = humanizeChecked(text, intensity, protected_terms);
      if (result.changed.length) {
        return {
          content: [{ type: "text" as const, text: protectedError(result.changed) }],
          isError: true,
        };
      }
      return { content: [{ type: "text" as const, text: result.text }] };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: processingError("text", error) }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "humanize_texts",
  {
    description:
      "Humanize multiple independent prose strings locally in one call. Returns a JSON array in the same order. Use for batches of headings, CTAs, UI messages, descriptions, or paragraphs; do not use for code or machine-readable values.",
    inputSchema: {
      texts: z.array(z.string().min(1).max(50_000)).min(1).max(50),
      intensity: z.enum(["light", "standard"]).default("standard"),
      protected_terms: z.array(z.string().min(1)).max(100).default([]),
    },
  },
  async ({ texts, intensity, protected_terms }) => {
    if (texts.reduce((total, text) => total + text.length, 0) > 200_000) {
      return {
        content: [{ type: "text" as const, text: "Batch exceeds 200,000 characters." }],
        isError: true,
      };
    }
    const results: Array<{ text: string; changed: string[] }> = [];
    for (const [index, text] of texts.entries()) {
      try {
        results.push(humanizeChecked(text, intensity, protected_terms));
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Item ${index} rejected. ${processingError("text", error)}`,
            },
          ],
          isError: true,
        };
      }
    }
    const unsafeIndex = results.findIndex((result) => result.changed.length > 0);
    if (unsafeIndex >= 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Item ${unsafeIndex} rejected. ${protectedError(results[unsafeIndex].changed)}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(results.map((result) => result.text)) },
      ],
    };
  }
);

server.registerTool(
  "humanize_file",
  {
    description:
      "Read and humanize one prose file inside the project workspace without modifying it. Supports .md, .mdx, .txt, .rst, and .adoc up to 200 KB; preserves fenced code blocks. Returns the edited content for review. Never use on source code, configuration, schemas, generated files, or exact legal/verbatim text.",
    inputSchema: {
      path: z.string().min(1).describe("Workspace-relative or absolute path inside the workspace."),
      intensity: z.enum(["light", "standard"]).default("standard"),
      protected_terms: z.array(z.string().min(1)).max(100).default([]),
    },
  },
  async ({ path, intensity, protected_terms }) => {
    try {
      const text = await readableProjectFile(path);
      const result = humanizeChecked(text, intensity, protected_terms);
      if (result.changed.length) {
        return {
          content: [{ type: "text" as const, text: protectedError(result.changed) }],
          isError: true,
        };
      }
      return { content: [{ type: "text" as const, text: result.text }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: processingError("file", error),
          },
        ],
        isError: true,
      };
    }
  }
);

await server.connect(new StdioServerTransport());
