# [SPEC-TRANSLATION-COMPLETENESS] Translation Completeness Check Enhancement

**Priority**: P1
**Status**: Implemented
**Last Updated**: 2026-03-24
**Feature ID**: SYS-TRANS-001
**Dependencies**: scripts/check-translation-sync.sh, scripts/pre-release-check.sh

---

## Summary / 摘要

Enhance `check-translation-sync.sh` to detect missing skill and core standard translations, not just outdated ones. Previously the script only checked version sync for files that already existed in locale directories, silently ignoring entirely missing translations.

增強 `check-translation-sync.sh` 以偵測缺失的技能和核心標準翻譯，而不僅僅是過期的翻譯。之前腳本只檢查已存在於 locale 目錄中的檔案的版本同步，會靜默忽略完全缺失的翻譯。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. When new core standards or skills are added to `core/` or `skills/`, the pre-release check does NOT detect missing translations in `locales/zh-CN/` or `locales/zh-TW/`.
2. This caused zh-CN to drift behind zh-TW by 1 skill (`brainstorm-assistant`) and 6 core standards (`acceptance-criteria-traceability`, `api-design-standards`, `change-batching-standards`, `database-standards`, `forward-derivation-standards`, `pipeline-integration-standards`).
3. The existing `check-translation-sync.sh` only performed two checks:
   - Version sync for files that already exist in locale directories
   - `skills/commands/` translation completeness
4. Missing `skills/*/SKILL.md` and `core/*.md` translations were never checked.

### Root Cause / 根本原因

The script iterated over files **in the locale directory** (`find "$LOCALE_DIR" -name "*.md"`), so files that never existed there were invisible. The `skills/commands/` completeness check was a one-off addition and was never generalized to skills and core standards.

### Solution / 解決方案

Add two new completeness checks to the `check_locale()` function:
1. **Skills Translation Completeness**: Compare `skills/*/SKILL.md` against `locales/{locale}/skills/*/SKILL.md`
2. **Core Standards Translation Completeness**: Compare `core/*.md` against `locales/{locale}/core/*.md`

Missing items are reported as `[MISSING]` and count toward the error total, causing the check to fail.

---

## Acceptance Criteria / 驗收條件

### AC-1: Detect Missing Skill Translations

**Given** a skill directory exists in `skills/{name}/SKILL.md`
**When** `check-translation-sync.sh` runs for a locale
**Then** it reports `[MISSING] skills/{name}/SKILL.md` if the locale directory does not contain a corresponding translation.

### AC-2: Detect Missing Core Standard Translations

**Given** a core standard exists in `core/{name}.md`
**When** `check-translation-sync.sh` runs for a locale
**Then** it reports `[MISSING] core/{name}.md` if the locale directory does not contain a corresponding translation.

### AC-3: Missing Items Cause Check Failure

**Given** missing translations are detected
**When** the summary is computed
**Then** missing skills and core standards are counted toward the OUTDATED total, causing the check to return non-zero exit code (fail).

### AC-4: Summary Includes Missing Counts

**Given** the locale summary is displayed
**When** skills or core standards are missing
**Then** the summary shows separate lines for "Skills missing: N" and "Core standards missing: N".

### AC-5: Non-Skill Directories Are Excluded

**Given** the skills directory contains non-skill subdirectories (`commands`, `workflows`, `agents`, `tools`)
**When** the completeness check runs
**Then** these directories are excluded from the check.

---

## Technical Design / 技術設計

### Modified File

`scripts/check-translation-sync.sh` — added two new blocks inside `check_locale()`:

1. Skills check: iterate `skills/*/`, skip non-skill dirs, check for `SKILL.md` in locale
2. Core check: iterate `core/*.md`, check for corresponding file in locale

Both blocks follow the existing `skills/commands/` completeness check pattern.

### No Changes to Pre-Release

`pre-release-check.sh` Step 4 already calls `check-translation-sync.sh` without arguments (checks all locales), so the enhancement is automatically included.

---

## Test Plan / 測試計畫

- [ ] Run `./scripts/check-translation-sync.sh zh-CN` and verify it reports missing items
- [ ] Run `./scripts/check-translation-sync.sh zh-TW` and verify it passes (zh-TW should be complete)
- [ ] Verify non-skill directories (commands, workflows, agents, tools) are excluded
- [ ] Verify the script exit code is non-zero when missing translations exist

---

## Implementation Status / 實作狀態

✅ Implemented on 2026-03-24. Added Skills and Core Standards completeness checks to `check-translation-sync.sh`.
