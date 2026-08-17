# Agent Configuration

## Compaction

Both `opencode.json` and `kilo.jsonc` auto-compact when context fills up.

- **Threshold:** 45% context used → auto-compact
- **Strategy:** Prune stale tool output, preserve 2 most recent turns
- **Tail turns:** 10 (opencode), 45% threshold (kilo)
- **Guardrail plugin:** `.opencode/plugins/guardrails.ts` preserves active task, modified files, locked decisions, verified-but-unwritten findings during compaction

Do not disable with `KILO_DISABLE_AUTOCOMPACT` / `KILO_DISABLE_PRUNE`.

## Tool Output Limits

```json
"tool_output": {
  "max_lines": 200,
  "max_bytes": 8192,
  "per_tool": {
    "read": { "max_lines": 500 },
    "grep": { "max_lines": 100 },
    "bash": { "max_lines": 200 },
    "task": { "max_lines": 300 }
  }
}
```

Per-tool overrides in `opencode.json`:

- `read`: max 500 lines (files can be large)
- `grep`: max 100 lines (results are verbose)
- `bash`: max 200 lines (output is noisy)
- `task`: max 300 lines (subagent output)

## Progressive Disclosure

Skills load only when relevant (description matching). AGENTS.md is always loaded — keep it lean (<50 lines). Detailed guidance lives in `docs/` and is fetched on demand.

## Evidence Hierarchy

1. Repo docs/ADRs/schemas/TS types (source of truth)
2. Deterministic checks (`npm run verify`)
3. Runtime/browser evidence (playwright snapshots)
4. Official context7 docs (version-accurate)
5. gh_grep examples (real code only)
6. Model memory (least reliable)

Never websearch for things already in docs. Never use gh_grep when repo docs have the answer.
