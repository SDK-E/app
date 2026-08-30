import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { z } from "zod";

import { assertAlphaCapable, stripBackground } from "../images/remove-background-core.js";

const server = new McpServer({ name: "project-background-remover", version: "1.0.0" });

async function writableProjectImage(filePath: string): Promise<string> {
  const projectRoot = await realpath(process.cwd());
  const requestedPath = isAbsolute(filePath) ? filePath : resolve(projectRoot, filePath);
  const resolvedPath = await realpath(requestedPath);
  const projectRelativePath = relative(projectRoot, resolvedPath);
  if (projectRelativePath.startsWith("..") || isAbsolute(projectRelativePath)) {
    throw new Error("file must be inside the project workspace");
  }
  const fileStat = await stat(resolvedPath);
  if (!fileStat.isFile()) throw new Error("path must identify a regular file");
  assertAlphaCapable(resolvedPath);
  return resolvedPath;
}

server.registerTool(
  "remove_background",
  {
    description:
      "Remove a flat, uniform background from raster images inside the project workspace, editing each file in place. Flood-fills from the borders with a tolerance, then clears remaining near-background pixels (including areas enclosed by letterforms). Use for logos, icons and brand assets shot or exported on a solid background; never use on photographs, gradients or images where subject colors approach the background. Output formats must support transparency (.png, .webp, .avif, .tiff, .gif). Destructive: keep the originals under version control.",
    inputSchema: {
      paths: z
        .array(z.string().min(1))
        .min(1)
        .max(20)
        .describe(
          "Image files to process, workspace-relative or absolute; every file is overwritten in place.",
        ),
      border_tolerance: z
        .number()
        .int()
        .min(2)
        .max(128)
        .optional()
        .describe("Color distance tolerated while flood-filling from the borders (default 32)."),
      uniform_tolerance: z
        .number()
        .int()
        .min(0)
        .max(64)
        .optional()
        .describe(
          "Color distance for the final sweep that clears leftover background pixels (default 12).",
        ),
    },
  },
  async ({ paths, border_tolerance, uniform_tolerance }) => {
    const lines: string[] = [];
    let failures = 0;
    for (const path of paths.values()) {
      try {
        const resolvedPath = await writableProjectImage(path);
        const result = await stripBackground(resolvedPath, {
          borderTolerance: border_tolerance,
          uniformTolerance: uniform_tolerance,
        });
        const percent = ((result.removedPixels / result.totalPixels) * 100).toFixed(1);
        lines.push(
          `${path}: ${result.width}x${result.height} ` +
            `background rgb(${result.background.join(", ")}) → ` +
            `${result.removedPixels}/${result.totalPixels} px (${percent}%) made transparent`,
        );
      } catch (error) {
        failures += 1;
        lines.push(`${path}: rejected — ${(error as Error).message}`);
      }
    }
    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
      isError: failures > 0,
    };
  },
);

await server.connect(new StdioServerTransport());
