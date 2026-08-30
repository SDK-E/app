import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

interface EvalArgs {
  body: string;
  files: string[];
  title: string;
}

function parseArgs(): EvalArgs {
  const args = process.argv.slice(2);
  const result: EvalArgs = { body: "", files: [], title: "" };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--body" && args[i + 1] !== undefined) {
      result.body = args[++i];
    } else if (args[i] === "--files" && args[i + 1] !== undefined) {
      result.files = args[++i]
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    } else if (args[i] === "--title" && args[i + 1] !== undefined) {
      result.title = args[++i];
    }
  }

  return result;
}

const failures: string[] = [];

function fail(reason: string): void {
  failures.push(reason);
}

function hasSection(body: string, heading: string): boolean {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^#{1,3}\\s+${escaped}\\b`, "im");
  return regex.test(body);
}

const REQUIRED_SECTIONS = ["What changed", "Why", "How verified", "Residual risk"];

const FORBIDDEN_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /^\.env/, reason: ".env file" },
  { pattern: /^packages\/db\/generated\//, reason: "generated source" },
  { pattern: /^apps\/web\/src\/generated\//, reason: "generated source" },
  { pattern: /\.next\//, reason: "Next.js build output" },
  { pattern: /^out\//, reason: "static export output" },
];

const LOCKFILES = new Set(["package-lock.json", "pnpm-lock.yaml"]);

const HIGH_BLAST_RADIUS: { pattern: RegExp; reason: string }[] = [
  { pattern: /(^|\/)authorization\.ts$/, reason: "authorization" },
  { pattern: /(^|\/)auth0\.ts$/, reason: "auth" },
  { pattern: /(^|\/)identity.*\.ts$/, reason: "identity" },
  { pattern: /^packages\/db\/prisma\/schema(\..+)?\.prisma$/, reason: "Prisma schema" },
  { pattern: /^packages\/db\/prisma\/migrations\//, reason: "migrations" },
  { pattern: /^apps\/web\/src\/proxy\.ts$/, reason: "proxy" },
  { pattern: /^apps\/web\/src\/middleware\.ts$/, reason: "middleware" },
  { pattern: /^packages\/i18n\/src\/locales\//, reason: "locales" },
  { pattern: /^package\.json$/, reason: "package manifest" },
  { pattern: /^(package-lock\.json|pnpm-lock\.yaml)$/, reason: "lockfile" },
];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".so",
  ".dylib",
  ".dll",
  ".exe",
  ".bin",
  ".wasm",
]);

const MAX_BINARY_SIZE = 500 * 1024;

function evaluate(): void {
  const { body, files, title } = parseArgs();
  const root = process.cwd();

  for (const section of REQUIRED_SECTIONS) {
    if (!hasSection(body, section)) {
      fail(`Missing required PR section: "${section}"`);
    }
  }

  let hasSourceChange = false;
  const normalizedFiles = files.map((f) => f.replace(/\\/g, "/"));

  for (const file of normalizedFiles) {
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      if (pattern.test(file)) {
        fail(`Forbidden file changed: ${file} (${reason})`);
      }
    }

    const ext = "." + file.split(".").pop()?.toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      const fullPath = resolve(root, file);
      if (existsSync(fullPath)) {
        try {
          const size = statSync(fullPath).size;
          if (size > MAX_BINARY_SIZE) {
            fail(`Binary file exceeds 500 KB: ${file} (${size} bytes)`);
          }
        } catch {
          // File may not exist locally in dry-run; skip size check.
        }
      }
    }

    if (!LOCKFILES.has(file) && !file.startsWith(".env")) {
      hasSourceChange = true;
    }
  }

  if (files.length > 0 && !hasSourceChange) {
    fail("PR changes only lockfile(s) — no source changes");
  }

  for (const file of normalizedFiles) {
    for (const { pattern, reason } of HIGH_BLAST_RADIUS) {
      if (pattern.test(file)) {
        const escaped = reason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rationaleRegex = new RegExp(`\\b${escaped}\\b`, "i");
        if (!rationaleRegex.test(body)) {
          fail(`High-blast-radius file changed without explicit rationale: ${file} (${reason})`);
        }
      }
    }
  }

  const isBugFix =
    /\b(?:fix|bugfix|bug fix|hotfix)\b/i.test(title) ||
    /\b(?:fix|bugfix|bug fix|hotfix)\b/i.test(body);

  if (isBugFix) {
    const hasTestFile = normalizedFiles.some((f) => /\.test\.(ts|tsx)$/.test(f));
    const hasReproEvidence = /\b(?:repro|test|trace|failing test|regression)\b/i.test(body);
    if (!hasTestFile && !hasReproEvidence) {
      fail("Bug-fix PR must include repro evidence (failing test, trace, or repro steps)");
    }
  }
}

evaluate();

if (failures.length > 0) {
  console.error("agent-pr-eval FAILED:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
} else {
  console.log("agent-pr-eval PASSED");
  process.exit(0);
}
