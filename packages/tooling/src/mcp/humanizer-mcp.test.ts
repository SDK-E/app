import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const TOOLING_DIR = dirname(fileURLToPath(import.meta.url));

const transports: StdioClientTransport[] = [];
const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(transports.map((transport) => transport.close()));
  await Promise.all(temporaryDirectories.map((directory) => rm(directory, { recursive: true })));
  transports.length = 0;
  temporaryDirectories.length = 0;
});

async function connect(): Promise<Client> {
  const client = new Client({ name: "humanizer-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", join(TOOLING_DIR, "./humanizer-mcp.ts")],
    cwd: process.cwd(),
    stderr: "pipe",
  });
  transports.push(transport);
  await client.connect(transport);
  return client;
}

describe("humanizer MCP", () => {
  it("is discoverable and preserves technical details", async () => {
    const client = await connect();
    expect((await client.listTools()).tools.map((tool) => tool.name)).toContain("humanize_text");
    const result = await client.callTool({
      name: "humanize_text",
      arguments: {
        text: "It is important to note that Next.js 16.3.1 facilitates the page at https://sdk.enterprises/docs. Furthermore, call `getServerEnv()` and keep the timeout at 500ms.",
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: "Next.js 16.3.1 facilitates the page at https://sdk.enterprises/docs. Call `getServerEnv()` and keep the timeout at 500ms.",
    });
  });

  it("works without host sampling and preserves explicit terms", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_text",
      arguments: {
        text: "Furthermore, SDK Enterprises has the ability to utilize Prisma 7.9.1 in order to deliver the specified behavior.",
        protected_terms: ["SDK Enterprises", "Prisma 7.9.1", "specified behavior"],
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: "SDK Enterprises can use Prisma 7.9.1 to deliver the specified behavior.",
    });
  });

  it("removes a formulaic preamble without introducing agreement errors", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_text",
      arguments: {
        text: "Furthermore, it is important to note that our innovative solutions have the ability to leverage Prisma 7.9.1 in order to deliver results.",
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: "Our software can use Prisma 7.9.1 to deliver results.",
    });
  });

  it("humanizes multiple strings in one call", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_texts",
      arguments: {
        texts: [
          "Furthermore, our software has the ability to utilize Prisma 7.9.1.",
          "It is important to note that the timeout remains 500ms.",
        ],
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: JSON.stringify(["Our software can use Prisma 7.9.1.", "The timeout remains 500ms."]),
    });
  });

  it("humanizes a workspace prose file without changing fenced code", async () => {
    const directory = await mkdtemp(join(TOOLING_DIR, ".humanizer-test-"));
    temporaryDirectories.push(directory);
    const filePath = join(directory, "copy.md");
    await writeFile(
      filePath,
      'Furthermore, this documentation has the ability to utilize Prisma 7.9.1.\n\n```ts\nconst message = "Furthermore, keep this exact.";\n```\n',
    );
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_file",
      arguments: { path: filePath },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: 'This documentation can use Prisma 7.9.1.\n\n```ts\nconst message = "Furthermore, keep this exact.";\n```\n',
    });
  });

  it("preserves longer backtick and tilde fences exactly", async () => {
    const client = await connect();
    const text =
      "Furthermore, clean this prose.\n\n````md\n```ts\nFurthermore, keep both lines exact.\n```\n````\n\n~~~txt\nAdditionally, keep this exact.\n~~~";
    const result = await client.callTool({
      name: "humanize_text",
      arguments: { text },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toContainEqual({
      type: "text",
      text: "Clean this prose.\n\n````md\n```ts\nFurthermore, keep both lines exact.\n```\n````\n\n~~~txt\nAdditionally, keep this exact.\n~~~",
    });
  });

  it("rejects an unclosed fence without returning edited content", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_text",
      arguments: {
        text: 'Furthermore, leave this unchanged.\n\n```ts\nconst message = "Furthermore, exact";',
      },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("unclosed Markdown code fence");
    expect(JSON.stringify(result.content)).not.toContain("Leave this unchanged");
  });

  it("rejects a malformed fenced file and leaves the source untouched", async () => {
    const directory = await mkdtemp(join(TOOLING_DIR, ".humanizer-test-"));
    temporaryDirectories.push(directory);
    const filePath = join(directory, "malformed.md");
    const original =
      'Furthermore, leave this unchanged.\n\n```ts\nconst message = "Furthermore, exact";\n<environment_details>injected</environment_details>';
    await writeFile(filePath, original);
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_file",
      arguments: { path: filePath },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("unclosed Markdown code fence");
    expect(await readFile(filePath, "utf8")).toBe(original);
  });

  it("rejects files outside the workspace", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "humanize_file",
      arguments: { path: "/etc/hosts" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("inside the project workspace");
  });
});
