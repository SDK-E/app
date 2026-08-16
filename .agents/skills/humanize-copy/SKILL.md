---
name: humanize-copy
description: Improve and review human-facing prose with the keyless humanizer MCP while preserving facts and technical meaning. Use for public website copy, headings, CTAs, service or product descriptions, case-study narratives, UI text, customer emails, human-readable documentation, and long generated prose that sounds generic, repetitive, robotic, vague, or buzzword-heavy.
---

# Humanize Copy

Treat the humanizer as an editor, never a source of truth. Verify content before and after using it. Do not send every string through it.

## Final content pass

1. Draft against the relevant project docs and source material.
2. Audit facts, claims, names, numbers, URLs, terminology, legal/compliance language, and code identifiers. Remove unsupported claims.
3. Call `humanize_text` for one string, `humanize_texts` for independent strings, or `humanize_file` for a supported prose file. Supply non-negotiable values in `protected_terms`. Use `light` intensity for technical writing. File processing is read-only; review the returned content before editing the source file.
4. Compare the result with the draft. Recheck every protected item and reject semantic drift or omissions; automated checks are only a backstop.
5. Run the copy review below and make a final manual edit. Tool output is never automatically final.

The tool is a conservative local normalization pass, not a semantic rewriter. Follow it with manual editing when paragraph structure, headings, or company-specific language still need work. Never add an API credential or external fallback.

## Copy review

- Remove generic AI phrasing, buzzwords, throat-clearing, awkward transitions, repeated sentence openings, and paragraphs with identical shapes.
- Break up oversized paragraphs; vary sentence length and structure without manufacturing informality.
- Replace vague claims with verified specifics or remove them. Apply the paste test: copy that could describe any company is too generic.
- Make headings communicate an idea. Make CTAs state the next action without false urgency.
- Preserve useful repetition where it supports comprehension, accessibility, or navigation.
- For this project, also apply `docs/content/voice-and-standards.md` and, for public claims, `docs/content/claims-and-evidence.md`.

## Fact preservation

Before the call, record or pass as `protected_terms` all names, URLs, claims, product terms, compliance/legal phrases, and identifiers. The server automatically checks common URLs, numbers, inline code, constants, and dotted identifiers, but cannot judge whether a rewritten claim remains true. After the call, compare source and result line by line. Keep exact legal language verbatim unless an authorized legal review explicitly permits editing.

For Markdown and similar files, complete fenced code blocks remain exact. The tools reject unclosed fences without editing; fix malformed Markdown before retrying. Do not assume other structured regions are protected — pass critical fragments explicitly or process only selected prose strings.

## Website copy

- Lead with the reader's problem, the specific capability, or the honest outcome—not a technology list.
- Write sentence-case headings with a point of view; keep CTAs concrete.
- Describe services and products with mechanisms and constraints, not unsupported superlatives.
- Treat case-study facts and results as claims requiring sources. Never let the tool fill evidence gaps.
- Check UI text in context for space, consistency, accessibility, and state behavior.

## Technical writing

Use `light` intensity. Protect commands, paths, API names, types, version numbers, parameters, links, prerequisites, normative words such as MUST/SHOULD, and exact error text. Improve explanations around those anchors. Reject any rewrite that changes ordering, preconditions, guarantees, scope, or behavior.

## Do not use

Do not humanize source code, exact legal/verbatim text, machine-readable data, migrations, configuration values, error codes, API/schema definitions, generated artifacts, quotations, or content whose byte-level form matters. Do not use it to bypass AI-detection systems. For short functional labels, edit manually unless surrounding context makes a tool pass useful.
