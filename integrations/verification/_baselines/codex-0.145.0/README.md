# Baseline & capacity runs — Codex CLI 0.145.0

- **Tool**: `codex-cli 0.145.0` (`/opt/homebrew/bin/codex`), model `gpt-5.6-terra`
- **Date**: 2026-07-23
- **Invocation**: `codex exec -C <dir> --sandbox read-only --skip-git-repo-check --ephemeral -p "<prompt>"`

## 1. Listing capacity — the 8,000 figure is a fallback, not a cap

The official wording is: *"this list uses at most **2% of the model's context window**, or
8,000 characters **when the context window is unknown**."* An earlier reading of this project
treated 8,000 as a hard cap and built a whole budget argument on it. It is not.

`truncation-60skills.txt` — 60 canary skills, **13,740 characters** of name+description+path.
Asked for the tokens of skills #01, #30 and #60; all three answered correctly with **zero tool
calls**, so the answers came from the loaded listing and not from reading files.

> **13,740 characters loaded intact.** UDS's real footprint is 11,305, so on this model
> nothing is being truncated.

Larger runs (120 and 250 skills) are **not** recorded as evidence: in both, the model executed
a shell command to read the SKILL.md files, so a correct answer proves nothing about the
listing. That distinction is the whole reason the tool-call count is reported here.

## 2. P6 — code review comment prefixes `[valid probe]`

**Source**: `skills/code-review-assistant/SKILL.md` — BLOCKING / IMPORTANT / SUGGESTION /
QUESTION / NOTE prefix semantics.

**Setup**: a file with one logged password, one hard-coded secret, one loose equality, one
unguarded property access.

| | UDS prefixes emitted |
|---|---|
| `P6-code-review-baseline.txt` (no UDS) | **0** |
| `P6-code-review-with-uds.txt` (skill at `.agents/skills/`) | **17** |

Applied correctly, not decoratively: **BLOCKING** on the logged password and the hard-coded
secret, **IMPORTANT** on the loose equality and the unguarded access. The baseline found the
same defects — it simply had no vocabulary to grade them with.

> This is the second probe to survive a baseline, and it has the same shape as P2: the model
> already **reasons** correctly, what it lacks is the **declared form**.

## 3. Why this probe matters beyond itself

`code-review-assistant` carries **both** `status: reference` with a DEPRECATION NOTICE **and**
`disable-model-invocation: true`. On markings alone it looks like a retirement candidate.

Measured, it produces a clean 0 → 17 delta.

**Retirement cannot be decided from existing markings.** The notice says lifecycle
orchestration moved to the adoption layer and the skill *retains* the prefix semantics — and
it is exactly that retained part which carries the delta.
