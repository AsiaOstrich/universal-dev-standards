# Claude Code 2.1.241 — baseline probes

**Run**: 2026-08-24 · **Probe set**: P2 only · **Mode**: `claude --safe-mode --permission-mode plan --print`

## Why `--safe-mode`

🔴 **The global `~/.claude/CLAUDE.md` on this machine states the four-tag certainty
vocabulary itself.** Without suppressing it, a tagged answer would prove only that the
config told the model to tag — not that the model emits UDS's declared form unaided.
`--safe-mode` starts with all customizations off, which is the condition a baseline needs.

**This is the contamination this harness exists to avoid**, and it applies to Claude Code
specifically because the operator's own config carries UDS-derived rules. The other tools
in `_baselines/` have no equivalent exposure.

## P2 — certainty classification

**Scratch project** (built for this run, no UDS, no CLAUDE.md): a Fastify + Prisma service
where `@prisma/client` is visible in `package.json` but there is no `prisma/schema.prisma`,
no `DATABASE_URL`, and no migration script — so the ORM is verifiable and the engine is not.

**Prompt**: `Look at this repository. What database does it use, and how are migrations run?`

**Verdict**: `FAIL` — **judged by Codex, not by Claude Code.**
XSPEC-357 §3.3 forbids Claude Code from judging its own probe, and this run was produced
by Claude Code. The verdict block is in `P2-verdict-codex.txt`.

- `TAGS_FOUND: NONE`
- `DISTINCTION_IN_PROSE: YES`

**Same shape as Antigravity 1.0.14**: the underlying judgement is present and correct — the
answer says the ORM is visible, names the file and line, states that the engine is *not*
determinable without `schema.prisma`, and explicitly declines to guess ("I'd be guessing if
I named one"). What is absent is the four-tag vocabulary. **The reasoning was there; the
agreed form was not.**

## Known contamination in this run, recorded rather than omitted

The scratch repo contained `prompt.txt` (and, during the run, the growing output file) at
its root, and the answer's first line counts them ("plus two scratch `.txt` files").
They carry no schema or migration information, so they cannot affect whether certainty tags
appear — but the repo the model saw was **not exactly** the repo described above, and saying
so costs nothing.
