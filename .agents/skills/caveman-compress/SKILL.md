---
name: caveman-compress
description: Compress agent memory files (AGENTS.md, CLAUDE.md) to reduce input token consumption. Use when optimizing agent context or reducing token costs.
---

# Caveman Compress

Compress agent memory files to reduce input tokens while preserving accuracy.

## Purpose

Every line in `AGENTS.md` / `CLAUDE.md` is loaded at session start. Compression reduces this cost permanently across all future sessions.

## Scope

- **Compress:** `AGENTS.md`, `CLAUDE.md`, any file loaded at session start
- **Do NOT compress:** `docs/**/*.md` (human documentation, fetched on demand)

## How It Works

1. **Strip filler** — Remove articles, hedging, pleasantries, redundant phrases
2. **Keep facts** — Preserve code blocks, URLs, file paths, commands, technical terms
3. **Compress structure** — Use tables instead of prose, bullet points instead of paragraphs
4. **Maintain signal** — Every remaining line must earn its token cost

## Compression Rules

### Preserve (never compress)

- Code blocks (fenced or indented)
- Inline code (backtick content)
- URLs and links
- File paths (`/src/components/...`)
- Commands (`npm install`, `git commit`)
- Technical terms, library names, API names
- Headings (exact text preserved)
- Tables (structure preserved, cells compressed)
- Dates, numbers, version strings

### Compress

- Articles ("the", "a", "an") → remove
- Hedging ("might", "could", "should consider") → direct statement
- Pleasantries ("please", "kindly", "you may want to") → imperative
- Redundant phrases ("in order to", "for the purpose of") → "to"
- Verbose transitions ("it is important to note that") → delete
- Self-referential ("this file", "the above") → specific reference

## Target Format

```markdown
# Before (verbose)

The authentication system should be configured to resolve users by their Auth0 sub identifier only. You must never attempt to resolve users by email address as this could lead to security vulnerabilities.

# After (compressed)

Auth: resolve by Auth0 `sub` only. Never email.
```

## Usage

Run this skill on:

- `AGENTS.md` — project context file (loaded at session start)
- `CLAUDE.md` — Claude-specific context (loaded at session start)

Do NOT compress `docs/` files — they are human documentation fetched on demand, not agent context.

## Verification

After compression:

1. All code blocks intact
2. All URLs/paths functional
3. All commands runnable
4. Signal preserved (information content unchanged)
5. Token count reduced by ~40-50%

## Workflow

1. Read target file
2. Apply compression rules
3. Write compressed version
4. Keep original as `.original.md` backup
5. Report before/after token counts
