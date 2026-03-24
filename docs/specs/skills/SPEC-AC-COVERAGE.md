# [SPEC-AC-COVERAGE] AC Coverage Command / AC 覆蓋率命令

**Priority**: P1
**Status**: Archived
**Last Updated**: 2026-03-18
**Feature ID**: SKILL-AC-COV-001
**Dependencies**: [acceptance-criteria-traceability.md](../../../core/acceptance-criteria-traceability.md)

---

## Summary / 摘要

Define the `/ac-coverage` slash command that generates AC-to-test traceability matrices and coverage reports from specification files. This fills the gap between `/coverage` (code-level coverage) and AC-level verification.

定義 `/ac-coverage` 斜線命令，從規格檔案產生 AC-to-test 追蹤矩陣與覆蓋率報告。此命令填補 `/coverage`（程式碼層級覆蓋率）與 AC 層級驗證之間的缺口。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. `/coverage` focuses on code coverage (line/branch/function) — it cannot tell whether all Acceptance Criteria have corresponding tests.
2. `/checkin` references AC coverage thresholds but no tool generates the report.
3. Teams have no standardized way to answer: "Which AC are tested, which are not?"

### Solution / 解決方案

A slash command that:
- Parses a SPEC file to extract AC definitions
- Scans test files for `@AC` / `@SPEC` annotations
- Builds a traceability matrix
- Calculates coverage using the formula from `acceptance-criteria-traceability.md`
- Outputs a standardized Markdown report

---

## Acceptance Criteria / 驗收條件

### AC-1: Traceability Matrix Generation

**Given** a SPEC file with numbered AC (e.g., AC-1, AC-2, ...)
**When** the user runs `/ac-coverage path/to/SPEC.md`
**Then** the command scans test files for `@AC` and `@SPEC` annotations and produces a traceability matrix with columns: AC-ID, Description, Status, Test Reference.

### AC-2: Coverage Calculation

**Given** a traceability matrix has been built
**When** coverage is calculated
**Then** the formula from `core/acceptance-criteria-traceability.md` is used:
- `Coverage % = (covered + partial × 0.5) / total × 100`
- Status classification: ✅ covered, ⚠️ partial, ❌ uncovered

### AC-3: Standardized Report Output

**Given** the matrix and coverage have been computed
**When** the report is generated
**Then** it follows the "AC Coverage Report Format" defined in `core/acceptance-criteria-traceability.md`, including: Summary table, Traceability Matrix, Gaps section, and Action Items.

### AC-4: Integration with `/checkin`

**Given** the user runs `/checkin` on a feature branch
**When** AC coverage is relevant (SPEC file exists for the feature)
**Then** `/checkin` references `/ac-coverage` as a quality gate and suggests running it if AC coverage has not been verified.

### AC-5: Configurable Thresholds

**Given** a project may have custom coverage requirements
**When** the user runs `/ac-coverage --threshold 90`
**Then** the report uses the specified threshold instead of the default (check-in: 80%, release: 100%) and reports pass/fail accordingly.

---

## I/O Contract / 輸入輸出契約

### Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `spec-path` | Yes | Path to the SPEC file to analyze |
| `--threshold` | No | Custom coverage threshold (default: 80 for check-in) |
| `--test-dir` | No | Directory to scan for tests (default: auto-detect) |

### Output

Markdown report following the format in `core/acceptance-criteria-traceability.md` § AC Coverage Report Format.

---

## Non-Goals / 不在範圍內

- This command does NOT run tests — it only analyzes annotations.
- This command does NOT replace `/coverage` — code coverage and AC coverage are complementary.
- This command does NOT modify test files.

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
