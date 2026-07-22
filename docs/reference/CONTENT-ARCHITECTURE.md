# UDS Content Architecture

**Status**: Living document — re-measure before trusting the numbers (see [§7](#7-how-to-re-measure))
**Last measured**: 2026-07-23
**Supersedes**: `docs/archive/MIGRATION-V5.md` (deleted 2026-05-08 in `c5721a55`)

---

## 1. Why this document exists

UDS v5.0.0 (`4579b890`, 2026-01-29) introduced a content-layering contract and explained
its rationale in `MIGRATION-V5.md`. That file was deleted on 2026-05-08 when `docs/archive`
was cleaned up.

The *rule* survived — it is still projected into AI tool configurations (§3). What was lost
was the *contract document*: the model itself, the reason for it, and any record of how much
of the codebase actually follows it.

The consequence showed up on 2026-07-23. Work on XSPEC-355 proposed a "normative/informative"
split for skill content — an independent reinvention of this exact architecture, with a
competing vocabulary, six months later. It was caught only by recovering the deleted file
from git history.

> **A contract nobody documents gets reinvented.** This file exists so that does not happen
> again. It is deliberately written to record the *gap between the contract and reality*,
> not just the contract.

---

## 2. The contract

Recovered verbatim from `MIGRATION-V5.md`:

| Component | Location | Purpose | AI Behavior |
|-----------|----------|---------|-------------|
| **Rules** | `core/*.md` | Actionable rules, checklists, thresholds | **Always Read** |
| **Guides** | `core/guides/*.md` | Detailed explanations, tutorials, examples | **Read on Demand Only** |
| **Methodologies** | `methodologies/guides/*.md` | Full methodology guides (TDD, BDD, …) | **Read on Demand Only** |

And its rationale, also verbatim:

> *Modern AI models have context window limits and cost per token. Large documentation files
> degrade AI performance and increase latency. V5 makes the "always-on" context much smaller
> while keeping the full knowledge available.*

This rationale is independently supported. Degradation from long inputs and from high
instruction density are two distinct effects — the first consumes token volume, the second
consumes instruction count — and cutting the wrong one removes the highest-value content.
See `cross-project/specs/XSPEC-355` in the dev-platform repo for the evidence.

---

## 3. Where the contract is enforced

The contract reaches AI tools through the **Core Standards Usage Rule**, embedded in each
integration's instruction file:

> *When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the
> concise rules in `core/`. **ONLY** read `core/guides/` or `methodologies/guides/` when
> explicitly asked for educational content, detailed explanations, or tutorials.*

**Verified 2026-07-23** — present in 12 of 14 registered integrations:

| Carries the rule | Does not |
|------------------|----------|
| claude-code, opencode, cursor, cline, windsurf, copilot, codex, gemini-cli, antigravity, aider, continue-dev, roo-code | spec-kit, openspec |

The two exceptions are `tier: tool` in `integrations/REGISTRY.json` — SDD tools rather than
AI coding assistants — so their omission is expected rather than a gap.

This projection is plain prose in each tool's own instruction file. It depends on **no
host-specific mechanism**, which is why it works across all of them.

---

## 4. Current layer inventory

Measured 2026-07-23. Reproduce with §7.

| Layer | Files | Bytes | Covered by the contract? |
|-------|------:|------:|--------------------------|
| `core/*.md` (top level) | 149 | 1,455,023 | ✅ Rules — Always Read |
| `core/guides/*.md` | 6 | 132,895 | ✅ Guides — On Demand |
| `methodologies/guides/*.md` | 5 | — | ✅ On Demand |
| `skills/**/*.md` | 184 | 1,503,235 | ❌ **No clause at all** |
| `ai/standards/*.ai.yaml` | 141 | 905,300 | ❌ Not mentioned |
| `ai/options/*.ai.yaml` | 39 | 117,906 | ❌ Not mentioned |

---

## 5. Known gaps

These are stated plainly because an undocumented gap becomes an invisible one.

### 5.1 The split was applied to 4% of `core/`

`core/guides/` holds 6 files. The other 149 `core/*.md` files were never split, and are not
concise: **median 7,544 bytes, 16 files above 20KB, largest 41,392 bytes**
(`documentation-structure.md`).

The contract says "Always Read" for a directory currently holding 1.46MB. In practice
`core/context-aware-loading.md` narrows this by domain, but that is a *different* axis —
it selects *which topics* load, not *how deep* each one goes.

### 5.2 `skills/` has no clause — and it is the larger half

The Core Standards Usage Rule names `core/`, `core/guides/` and `methodologies/guides/`.
It says nothing about `skills/`, which holds **1.50MB across 184 files** — more than `core/`.

This is not a hypothetical. The same commit that introduced V5 cut
`core/testing-standards.md` by 3,148 lines (141KB → 21.5KB) and created
`skills/testing-guide/testing-theory.md` with 2,291 lines (113,903 bytes).

> **That content did not shrink. It moved out of the governed zone.**

A per-genre classification of `skills/testing-guide/` (all four files, every line range
assigned after a full read) measured:

| Genre | Bytes | Share |
|-------|------:|------:|
| Choice declarations (which convention we picked) | 3,988 | 2.7% |
| Commitment devices (detection order, setup procedure) | 1,053 | 0.7% |
| **Knowledge / teaching material** | **138,348** | **93.3%** |
| Meta (frontmatter, version history, license) | 4,829 | 3.3% |

**Rules-tier content is 3.5% of that skill.** The remaining 96.5% is exactly what the Guides
tier is for, and none of it is marked.

### 5.3 `.ai.yaml` is not a compact tier

`README.md` §Architecture describes a "Dual-Layer Execution Model" in which the
`.ai.yaml` skills layer is *"Token-Efficient / Minimal"* and core standards are
*"Detailed (Reference)"*.

Measured across the 135 standards that have both forms: **`.ai.yaml` totals 872,380 bytes
against 1,271,471 bytes of `.md` — 69%.** One pair inverts entirely
(`acceptance-test-driven-development`: the YAML is 640% of the Markdown, because the
Markdown is a stub).

69% is a reformat, not a compaction tier.

> ⚠️ **Unresolved:** README calls `core/*.md` the *detailed reference* layer; this contract
> calls it the *concise always-read* layer. Same directory, opposite characterisation. The two
> documents describe different axes — format (`.ai.yaml` vs `.md`) and depth (Rules vs Guides)
> — but they use overlapping words for opposite claims. **Reconciling README is not done here**
> because it is the project's public front page and the wording is a product decision.

---

## 6. Rules for new content

1. **Ask which tier before writing.** Actionable rule, checklist, or threshold → Rules.
   Explanation, tutorial, rationale, or worked example → Guides.
2. **Never mix tiers in one file.** A Rules file that grows an explanation section has
   silently become a Guides file that everything still always-reads.
3. **Write only what the model would get wrong by default.** Content that a current model
   already produces correctly belongs in Guides at most, and often nowhere.
4. **Localisation follows the tier.** Rules-tier content is translated; Guides-tier content
   may stay English. Precision matters for rules; teaching material can be translated on
   demand, and a stale partial translation of teaching material is worse than English.
   *(This document is Guides tier and is therefore English-only by that rule.)*

---

## 7. How to re-measure

The previous architecture document rotted into deletion partly because nothing tied it to the
repository's actual state. Run this before citing any number above:

Run from the repository root. Both blocks were executed on 2026-07-23 and reproduce the
numbers above.

```bash
# Layer inventory (§4)
show() { printf '%-30s %4d files %10d bytes\n' "$1" "$2" "$3"; }
show "core/*.md (Rules)"      "$(find core -maxdepth 1 -type f -name '*.md' | wc -l)"    "$(find core -maxdepth 1 -type f -name '*.md' -exec cat {} + | wc -c)"
show "core/guides/*.md"       "$(find core/guides -type f -name '*.md' | wc -l)"         "$(find core/guides -type f -name '*.md' -exec cat {} + | wc -c)"
show "skills/**/*.md"         "$(find skills -type f -name '*.md' | wc -l)"              "$(find skills -type f -name '*.md' -exec cat {} + | wc -c)"
show "ai/standards/*.ai.yaml" "$(find ai/standards -type f -name '*.ai.yaml' | wc -l)"   "$(find ai/standards -type f -name '*.ai.yaml' -exec cat {} + | wc -c)"
```

```bash
# Contract projection (§3)
node -e '
const fs = require("fs"), r = require("./integrations/REGISTRY.json");
for (const [id, a] of Object.entries(r.agents)) {
  if (!a.instructionFile) continue;
  let t = ""; try { t = fs.readFileSync(a.instructionFile, "utf8"); } catch {}
  console.log((/core\/guides|Core Standards Usage/i.test(t) ? "OK  " : "MISS") + " " + id);
}'
```

If the numbers have moved, **update this file in the same commit**. An architecture document
that describes a past state is the failure this file was written to prevent.

---

## References

- `CLAUDE.md` §Core Standards Usage Rule — the enforced form of §2
- `core/context-aware-loading.md` — domain-based selection (orthogonal axis, see §5.1)
- `integrations/REGISTRY.json` — the 14 integrations checked in §3
- `git show c5721a55^:docs/archive/MIGRATION-V5.md` — the recovered original
- dev-platform `cross-project/specs/XSPEC-355` — evidence for §2's rationale, and the
  reinvention incident that prompted this file
