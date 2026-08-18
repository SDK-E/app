import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type JsonObject = Record<string, unknown>;

const root = process.cwd();
const failures: string[] = [];

function readJson(path: string): JsonObject {
  return JSON.parse(readFileSync(resolve(root, path), "utf8")) as JsonObject;
}

function fail(message: string): void {
  failures.push(message);
}

function normalizeMcpConfig(path: string): Record<string, string[]> {
  const config = readJson(path);
  const rawServers = (config.mcpServers ?? config.mcp) as Record<string, JsonObject>;

  return Object.fromEntries(
    Object.entries(rawServers)
      .map(([name, server]): [string, string[]] => {
        if (typeof server.url === "string") return [name, [server.url]];
        if (Array.isArray(server.command)) return [name, server.command.map(String)];
        if (typeof server.command === "string") {
          const args = Array.isArray(server.args) ? server.args.map(String) : [];
          return [name, [server.command, ...args]];
        }
        return [name, []];
      })
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

const canonicalMcp = normalizeMcpConfig(".mcp.json");
for (const path of ["kilo.jsonc", "opencode.json"]) {
  const candidate = normalizeMcpConfig(path);
  if (JSON.stringify(candidate) !== JSON.stringify(canonicalMcp)) {
    fail(`${path} MCP servers differ from .mcp.json`);
  }
}

for (const [name, command] of Object.entries(canonicalMcp)) {
  for (const argument of command) {
    if (argument === "@latest" || argument.endsWith("@latest")) {
      fail(`MCP server ${name} uses an unpinned latest version`);
    }
    if (argument === "@upstash/context7-mcp") {
      fail(`MCP server ${name} is missing an explicit package version`);
    }
  }
}

const packageJson = readJson("package.json");
const scripts = packageJson.scripts as Record<string, string>;
for (const required of [
  "agents:check",
  "typecheck",
  "lint",
  "test:run",
  "i18n:check",
  "build",
  "verify",
]) {
  if (!scripts[required]) fail(`package.json is missing the ${required} script`);
}

const agents = readFileSync(resolve(root, "AGENTS.md"), "utf8");
for (const [staleReference, pattern] of [
  ["publicEnv", /\bpublicEnv\b/],
  ["requireAuth", /\brequireAuth\b/],
  ["requireRole", /\brequireRole\b/],
  ["@/lib/auth-guards", /@\/lib\/auth-guards/],
] as const) {
  if (pattern.test(agents)) fail(`AGENTS.md contains stale reference: ${staleReference}`);
}

for (const path of [
  "docs/conventions/structure.md",
  "docs/conventions/env.md",
  "src/lib/env.ts",
  "src/lib/auth/auth0.ts",
  "src/lib/auth/identity.ts",
  "src/lib/auth/authorization.ts",
  "scripts/mail/mail-mcp.ts",
  "scripts/mcp/humanizer-mcp.ts",
]) {
  try {
    readFileSync(resolve(root, path));
  } catch {
    fail(`Agent contract references missing file: ${path}`);
  }
}

if (failures.length > 0) {
  console.error("Agent contract check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Agent contract check passed.");
}
