# Self-Review Protocol

> **English** | [繁體中文](../locales/zh-TW/core/self-review-protocol.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-26
**Applicability**: All software projects (new, refactoring, migration, maintenance)
**Scope**: partial
**Industry Standards**: ISO/IEC 25010 (Documentation maintainability), IEEE 1063-2001 (Software user documentation)
**References**: Inspired by code review practices from Google Engineering Practices; specialized for large markdown artefact editing

---

## Purpose

This standard mandates a **self-review pass** on large markdown edits before commit, to catch internal cross-reference inconsistencies that internal reasoning routinely misses.

**Relationship to Other Standards**:
- Complements [code-review.md](code-review.md) which covers code changes
- Complements [documentation-writing-standards.md](documentation-writing-standards.md) which covers content creation
- This standard focuses on **post-edit verification** of large markdown documents (DECs, ADRs, XSPECs, SKILL.md, spec documents, runbooks)

---

## Background

Across multiple Claude-assisted editing sessions (e.g., `dev-platform/.claude/skills/eval-source/SKILL.md` v1.1.0 → v1.1.1 and v1.2.0 → v1.2.1), a consistent pattern emerged: **each large markdown edit introduced 3-6 small internal inconsistencies** that were invisible to internal reasoning but surfaced immediately on full re-read.

These inconsistencies fell into **6 recurring categories** and consistently triggered a follow-up patch commit. Adding a mandatory re-read step before commit eliminated this pattern (eval-source v1.3.0 was the first to pass without follow-up patch).

---

## Trigger Conditions

| Change scale | Self-review required? |
|---|---|
| Commit modifies **> 50 lines** of markdown | **Mandatory** |
| Commit modifies ≤ 50 lines of markdown | Optional (small edits rarely have cross-ref risk) |
| Code / config only changes | Not applicable (covered by lint / test / code review) |

Applicable artefact types:
- ADRs (architecture decision records)
- Cross-project specs (XSPEC) and SDD Deltas
- SKILL.md (Claude Code custom skills)
- ARCHITECTURE.md, API.md, DEPLOYMENT.md, MIGRATION.md (long-form project docs)
- Runbooks, playbooks
- README.md when modifying major sections

---

## The 6 Categories of Internal Inconsistency

### 1. Diagram / Flow vs Step List Mismatch
**Example**: A workflow diagram with 7 boxes but the document defines 8 steps.
**Check**: Count nodes in every diagram and compare against `## Step N:` / `## N.` headers.

### 2. Changelog Reference Errors
**Example**: Changelog entry says "Step 1 added X" but X was actually added at Step 0.
**Check**: For each changelog line, grep the anchor it references to verify location.

### 3. Count Drift
**Example**: Document says "self-audit has 4 questions" but the actual list now has 7.
**Check**: grep for explicit numbers (`N questions`, `N rows`, `N items`) and verify against actual count.

### 4. Stale Templates
**Example**: A commit template hardcodes `Claude Sonnet 4.6` when the actual model varies.
**Check**: Find hardcoded model names, tool versions, dates; replace with placeholders or update.

### 5. Wrong Tool / Command References
**Example**: Document recommends `claude --version` to get the model name, but that command only shows CLI version.
**Check**: For each CLI command mentioned, mental check or `which X` / `--help` verification.

### 6. Placeholder vs Rule Misalignment
**Example**: A template example shows `D1/D2/D3` but the rule explicitly says D3 is not mandatory, and the present case specifically demoted its D3.
**Check**: Every concrete value in examples must be consistent with current rules; examples should not contradict latest case experience.

---

## Procedure

1. **After editing, before committing**, use the file-reading tool to re-read the **entire file** (not just the diff).
2. Walk through the 6 categories above against the file.
3. **If issues found**: Edit in place and include fixes in the same commit (don't ship and patch later).
4. **If already committed** before noticing: Create a patch commit (e.g., v1.2.1 fixing v1.2.0).

---

## Recording the Self-Review Result

The recording format depends on the artefact type:

### For SKILL.md
Append a changelog line in the format:
```
> **v{X.Y.(Z+1)} Self-review pass {YYYY-MM-DD}**: {N} issues found, {M} fixed in same commit; or "0 issues found".
```

### For ADRs / DECs
In the `## Follow-up Tracking` table, add a row:
```
| Self-review pass | This DEC | ✅ YYYY-MM-DD (6 categories, no issues) |
```

### For XSPEC SDD Deltas
After the "non-modification list" section (e.g., §N.6), append:
```
> Self-review pass: YYYY-MM-DD (6 categories, no issues)
```

### In Commit Message Body
Append a single line at the end:
```
Self-review (protocol v1.0.0): N issues found, M applied in same commit / 0 found.
```

---

## Distinction from Other Review Practices

| Practice | Covers | Trigger |
|---|---|---|
| **Code Review** ([code-review.md](code-review.md)) | Code correctness, design, security | Before merging code PR |
| **Content Self-Audit** (e.g., eval-source skill's 7-question audit) | Content completeness (did we include all required sections?) | Each artefact creation |
| **Self-Review Protocol** (this standard) | Internal cross-reference consistency (form, not content) | After large markdown edit, before commit |
| **Peer Review** | Independent perspective, blast radius assessment | Significant changes |

The three review layers are complementary:
- **Content audit** asks: *Did I include everything required?*
- **Self-review** asks: *Are the parts I included internally consistent?*
- **Peer review** asks: *Does the change make sense from another perspective?*

---

## Anti-Patterns to Avoid

1. **Skipping self-review because "the diff looks small"** — small diffs in large files often introduce cross-ref errors elsewhere.
2. **Doing self-review on the diff only** — must re-read the **whole file** because cross-ref errors may live in unchanged sections that reference changed content.
3. **Documenting the protocol but not following it** — the discipline is in the practice, not the documentation.
4. **Treating self-review as a substitute for peer review** — self-review catches inconsistencies, not design flaws.

---

## Verification

Adoption of this standard is verified by:

- **Patch commit ratio**: After adopting, the ratio of `v1.X.0 → v1.X.1` follow-up patches for the same artefact should drop significantly (eval-source went from 100% before v1.3.0 to 0% after).
- **Issue surface time**: Issues caught by self-review (before commit) vs. issues caught by next reader (after commit) — the former should grow, the latter shrink.

---

## Examples in the Wild

- **dev-platform** `eval-source` skill v1.3.0 — first SKILL.md edit to pass self-review pre-commit (commit `6b45c5d`); preceded by 2 patch cycles (v1.1.0→v1.1.1 with 3 issues, v1.2.0→v1.2.1 with 6 issues) that motivated this standard.

---

## Self-Review Pass

> Self-review pass: 2026-05-26 (6 categories, no issues found on the first draft of this standard itself)
