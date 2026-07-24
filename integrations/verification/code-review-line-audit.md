# Line-level audit — where does code-review-assistant's measured value actually live?

**Date**: 2026-07-24 · **Spec**: XSPEC-357 (outcome measurement) → line-level follow-up
**Method**: classify every span of `skills/code-review-assistant/SKILL.md`, then map each class
back to the per-defect outcome data in `_baselines/codex-0.145.0/cross-judged/`.

This is the analysis-unit correction from the fable-5 adversarial review: the measured effect
of this skill is **not** "skill on vs off", it is **specific lines**. So the honest question is
not "disable the skill?" but "which lines still earn their place?".

---

## What the outcome data actually said

Codex, two blind judges, 8 planted defects each mapped to one of the skill's review categories:

| Skill category (SKILL.md line) | Planted defect | no UDS → UDS (Gemini judge) | Verdict |
|---|---|---|---|
| Security (43) | hard-coded password | 5/5 → 4/4 | **inert — ceiling** (model already catches it) |
| Error Handling (45) | payment not awaited | 5/5 → 4/4 | **inert — ceiling** |
| Functionality (38) | no transaction | 5/5 → 4/4 | **inert — ceiling** |
| Performance (44) | N+1 queries | 2/5 → 2/4 | **inert — flat** (unchanged, model often misses) |
| Readability (41) | meaningless names | 1/5 → 1/4 | **inert — flat** |
| Design (39) | module-level singleton | 0/5 → 0/4 | **inert — named but not produced** |
| Quality (40) | magic numbers | 0/5 → 0/4 | **inert — named but not produced** |
| **Tests (42)** | **no tests** | **0/5 → 4/4** | **✅ the only outcome delta** |

The cross-judged README states it directly: *"Excluding defect 5 as unmeasurable, the entire
difference between conditions is this one row. Every other defect is found at the same rate with
or without UDS."*

**One category line out of eight produced a measurable change in what the review found.**

---

## Full line classification of SKILL.md (83 lines)

| Lines | Span | Class | Mapped to |
|-------|------|-------|-----------|
| 1–9 | frontmatter | **M** meta — but `description` (4) is a **routing signal** | P6/P2: description decides whether the host loads the skill at all; it is the always-read listing entry on Codex |
| 10–15 | DEPRECATION NOTICE | **M** meta | stale-orchestration notice |
| 17–24 | title + Status warning | **M** meta | — |
| 26–34 | Workflow (identify→apply→report→summarize) | **B** inert | models perform review flow unprompted |
| 36, 46 | section headers | **M** meta | — |
| **42** | **Tests category line** | **A — outcome delta** | **defect 8: 0/5 → 4/4, both judges, zero disagreement** |
| 38–41, 43–45 | the other 7 category lines | **B** inert | every mapped defect: same rate with/without UDS (table above) |
| 47–55 | Comment Prefixes table | **A — form delta only** | P6 probe: prefixes 0 → 17 when installed. Changes *how findings are labelled*, not *how many are found* |
| 57–61 | Usage (`/code-review …`) | **B/M** | tool invocation syntax |
| 63–71 | Next Steps Guidance (run /checkin, /commit) | **U — untested** | UDS-specific workflow routing; today's outcome measurement did not cover it |
| 73–76 | Reference links | **M** meta | — |
| 79–83 | AI Agent Behavior pointer | **M** meta | pointer to command file |

### Tally

- **A, outcome delta**: 1 line (42, Tests)
- **A, form delta only**: 1 span (47–55, prefixes — real but does not change defect count)
- **B, inert**: the Workflow span + 7 of 8 category lines + Usage
- **M, meta**: frontmatter, deprecation, title, headers, reference, behavior pointer
- **U, untested**: Next Steps Guidance

---

## The two kinds of "inert" — and why the distinction matters

The 7 inert category lines split into two mechanisms, and they call for opposite responses:

1. **Ceiling** (Security, Error Handling, Functionality): the model finds these at 5/5 with or
   without the skill. The line is not wrong; it is **redundant against this model's baseline**.
   On a weaker model it might carry a delta — untested. **Do not delete on this evidence.**
2. **Named but not produced** (Design, Quality): the skill lists the category, and the model
   scores it 0/5 anyway. Listing "Design" and "Quality" in a checklist **did not cause the
   model to review for them**. This is the sharper finding — a checklist entry is not a
   behaviour. Adding more category names would not add coverage.

**Tests (42) is the exception to both**: baseline 0/5 (not ceiling — the model genuinely misses
it) and UDS 4/4 (the line *did* produce the behaviour). Missing tests are invisible inside the
file under review; noticing them requires stepping out to the project, and this one line is what
prompts that step.

---

## Companion files: not loaded, not credited

`guide.md`, `review-checklist.md`, `checkin-checklist.md` (709 lines total) sit in the skill
directory but are **on-demand** — SKILL.md links to them, it does not inline them. In the Codex
runs the model read `SKILL.md` and did not open the companions (visible in the raw transcripts:
`sed -n '1,240p' .agents/skills/code-review-assistant/SKILL.md`). So their contribution to the
measured outcome is **zero in this data** — not because they are useless, but because they were
never loaded. `review-checklist.md` §5 "Testing" may be a second source of the tests delta if a
model does open it; untested.

---

## Caveats — read before acting on any of this

- **Inert ≠ harmful ≠ useless.** Inert here means "no measurable delta against gpt-5.6-terra on
  one subject file". Ceiling-inert lines may carry a delta on weaker models; that is untested.
- **One tool family.** All outcome data is Codex/gpt-5.6-terra. On Antigravity/Gemini 3.6 the
  *same Tests line produced 0/5 → 0/5* — the one line that works on Codex does nothing there.
  So even the single delta is model-conditional.
- **n=9, single subject, aggregate not significant.** Only the Tests row is clean.
- **This audits 1 of 55 skills.** Nothing here generalises to UDS as a whole.

---

## What this demonstrates

The skill's measured payload, on the one tool where it has any, is **one category line plus one
formatting table** — the Tests line (outcome) and the prefix table (form). The other seven
categories are inert, two of them because a checklist name does not become a behaviour.

That is the case for **line-level pruning over skill-level switches**: you do not disable an
83-line file whose signal is 1 line; you ask whether the other 82 are carried by evidence. But
the honest answer today is **"mostly untested, not proven dead"** — this audit narrows where to
look next, it does not license deletion.
