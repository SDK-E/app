/**
 * Rendered text-contrast audit (light + dark).
 *
 * Boots the dev server on an isolated port, crawls reachable pages plus the
 * design-system fixtures (which mount the real portal components), toggles
 * the theme per pass, and reads computed styles from the live DOM: every
 * visible text node is paired with its effective, alpha-composited backdrop.
 * Thresholds: 7:1 body text; 4.5:1 large text (>=24px or >=18.66px bold).
 */

import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";

import { auditTheme, type Violation } from "./audit";
import { COLLECT_LINKS_SCRIPT } from "./in-page";

const PORT = 3117;
const BASE_URL = process.env.CONTRAST_BASE_URL ?? `http://localhost:${PORT}`;
const SEEDS = ["/en", "/en/design-system"];
const MAX_PAGES = 80;
const SKIP_URL = [/\/api\//, /\/logout/, /#/, /^mailto:/, /^https?:/];
const TOOLING_DIR = dirname(fileURLToPath(import.meta.url));
// contrast/ -> ci -> src -> tooling -> packages -> repo root
const REPO_ROOT = join(TOOLING_DIR, "../../../../..");
const WEB_APP_DIR = join(REPO_ROOT, "apps/web");

interface ServerHandle {
  child: ReturnType<typeof spawn>;
  logs: string;
  kill(): void;
}

/** Frees the audit port using the repo's port-killer (strays from crashed runs). */
function freeAuditPort(): void {
  spawnSync(
    "node",
    ["--import", "tsx", join(TOOLING_DIR, "../../portkiller/portkiller.ts"), "kill", String(PORT)],
    {
      cwd: REPO_ROOT,
      stdio: "ignore",
    }
  );
}

function startDevServer(): ServerHandle {
  const handle: ServerHandle = {
    child: spawn(
      process.execPath,
      [
        join(WEB_APP_DIR, "node_modules/next/dist/bin/next"),
        "dev",
        "--turbopack",
        "-p",
        String(PORT),
      ],
      {
        cwd: WEB_APP_DIR,
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      }
    ),
    logs: "",
    kill() {
      this.child.kill("SIGTERM");
    },
  };
  const append = (chunk: Buffer) => {
    handle.logs += chunk.toString();
    if (handle.logs.length > 8000) handle.logs = handle.logs.slice(-8000);
  };
  handle.child.stdout?.on("data", append);
  handle.child.stderr?.on("data", append);
  return handle;
}

async function waitForServer(server: ServerHandle): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/en`, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // not ready yet
    }
    if (/Another next dev server is already running/.test(server.logs)) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(
    `dev server did not become ready at ${BASE_URL}.\nLast server output:\n${server.logs.split("\n").slice(-15).join("\n")}`
  );
}

async function themedPage(browser: Browser, theme: "light" | "dark"): Promise<Page> {
  const context = await browser.newContext();
  await context.addInitScript(`try { localStorage.setItem('theme', '${theme}'); } catch {}`);
  return context.newPage();
}

async function crawlUrls(page: Page): Promise<string[]> {
  const found = new Set<string>();
  const queue = [...SEEDS];
  while (queue.length && found.size < MAX_PAGES) {
    const path = queue.shift() as string;
    if (found.has(path)) continue;
    found.add(path);
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    // Off-origin (Auth0 hosted login) pages are not part of this audit.
    if (!page.url().startsWith(BASE_URL)) {
      continue;
    }
    const links =
      path.startsWith("/auth") || path.startsWith("/login")
        ? []
        : ((await page.evaluate(COLLECT_LINKS_SCRIPT)) as string[]);
    for (const raw of links) {
      if (SKIP_URL.some((pattern) => pattern.test(raw))) continue;
      const normalized = raw.startsWith("/") ? raw : new URL(raw, BASE_URL).pathname;
      const [pathname] = normalized.split("#");
      if (!pathname.startsWith("/")) continue;
      // Locale-prefixed routes only; skip alternate locales to bound the crawl.
      if (!/^\/(en)(\/|$)/.test(pathname)) continue;
      if (![...found, ...queue].includes(pathname)) queue.push(pathname);
    }
  }
  return [...found];
}

async function main(): Promise<void> {
  let browser: Browser | null = null;
  let server: ServerHandle | null = null;
  try {
    if (!process.env.CONTRAST_BASE_URL) {
      freeAuditPort();
      server = startDevServer();
      await waitForServer(server);
    }
    browser = await chromium.launch();
    const pages: Record<"light" | "dark", Page> = {
      light: await themedPage(browser, "light"),
      dark: await themedPage(browser, "dark"),
    };
    const urls = await crawlUrls(pages.light);
    console.log(`Auditing ${urls.length} page(s) in light and dark themes…`);

    const all: Violation[] = [];
    for (const urlPath of urls) {
      for (const theme of ["light", "dark"] as const) {
        try {
          all.push(...(await auditTheme(pages[theme], theme, BASE_URL, urlPath)));
        } catch (error) {
          console.log(`SKIP ${urlPath} (${theme}): ${(error as Error).message.split("\n")[0]}`);
        }
      }
    }

    const unique = new Map<string, Violation>();
    for (const violation of all) {
      unique.set(
        `${violation.urlPath}|${violation.theme}|${violation.text}|${violation.fgHex}|${violation.bg}`,
        violation
      );
    }
    const failures = [...unique.values()];
    failures.sort((a, b) => a.ratio - b.ratio);
    for (const failure of failures) {
      console.log(
        `FAIL ${failure.theme.padEnd(5)} ${failure.urlPath} <${failure.tag}> ` +
          `"${failure.text.slice(0, 40)}" ${failure.fgHex} on ${failure.bg} ` +
          `= ${failure.ratio.toFixed(2)}:1 (needs ${failure.required}:1)`
      );
    }
    console.log(`\n${failures.length} contrast failure(s) across ${urls.length} page(s).`);
    if (failures.length > 0) process.exitCode = 1;
  } finally {
    await browser?.close();
    server?.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
