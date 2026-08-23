import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = process.cwd();
const MAX_LINES = 250;
const ROOTS = ["apps", "packages"];
const EXCLUDED_DIRS = new Set(["generated", "node_modules", ".next", ".turbo", "dist"]);
const EXCLUDED_EXTENSIONS = new Set([".json", ".js", ".mjs", ".cjs"]);

function walk(directory: string, prefix: string, offenders: string[]): void {
  for (const entry of readdirSync(directory)) {
    if (entry.startsWith(".")) continue;
    const absolute = join(directory, entry);
    const relative = join(prefix, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry)) continue;
      walk(absolute, relative, offenders);
      continue;
    }
    if (
      !EXCLUDED_EXTENSIONS.has(extname(entry)) &&
      (entry.endsWith(".ts") || entry.endsWith(".tsx"))
    ) {
      const lines = readFileSync(absolute, "utf8").split("\n").length;
      if (lines > MAX_LINES) offenders.push(`${lines}\t${relative}`);
    }
  }
}

const offenders: string[] = [];
for (const root of ROOTS) walk(resolve(ROOT, root), root, offenders);

if (offenders.length > 0) {
  console.error(
    `File length check failed: ${offenders.length} file(s) exceed the ${MAX_LINES}-line cap:\n`
  );
  for (const line of offenders) console.error(`- ${line}`);
  process.exitCode = 1;
} else {
  console.log(`File length check passed: all .ts/.tsx files are within the ${MAX_LINES}-line cap.`);
}
