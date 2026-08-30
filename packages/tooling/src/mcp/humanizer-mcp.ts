import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { z } from "zod";

import {
  humanizeChecked,
  maxFileBytes,
  processingError,
  protectedError,
  supportedFileExtensions,
} from "./humanizer-mcp-core.js";

const server = new McpServer({ name: "project-copy-humanizer", version: "1.0.0" });

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
  },
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
    const results: { text: string; changed: string[] }[] = [];
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
  },
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
  },
);

await server.connect(new StdioServerTransport());
