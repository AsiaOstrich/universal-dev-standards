# Forward Derivation Specification / 正向推演規格

**Feature ID**: CORE-DERIVE-001
**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Draft

---

## Overview / 概述

Forward Derivation automatically generates BDD scenarios, TDD test skeletons, and ATDD acceptance tests from approved SDD specifications. This feature complements the existing Reverse Engineering capability, creating a symmetrical derivation system.

正向推演從已批准的 SDD 規格自動生成 BDD 場景、TDD 測試骨架和 ATDD 驗收測試。此功能與現有的反向工程互補，形成對稱的推演系統。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. After completing SDD, developers manually create BDD scenarios - tedious and error-prone
2. Test structures are often inconsistent with spec's acceptance criteria
3. Traceability between spec and tests is hard to maintain

完成 SDD 後，開發者需手動建立 BDD 場景——繁瑣且易出錯。測試結構常與規格的驗收條件不一致。規格與測試間的可追溯性難以維護。

### Solution / 解決方案

Automated derivation that:
- Parses Acceptance Criteria from approved SPEC
- Generates Gherkin scenarios with proper tagging (@SPEC-XXX, @AC-N)
- Creates TDD test skeletons with TODO markers
- Produces ATDD acceptance test tables

自動化推演能夠：
- 從已批准的 SPEC 解析驗收條件
- 生成帶有適當標籤（@SPEC-XXX、@AC-N）的 Gherkin 場景
- 建立帶有 TODO 標記的 TDD 測試骨架
- 產生 ATDD 驗收測試表格

---

## User Story / 使用者故事

```
As a developer with an approved SDD specification,
I want to automatically generate test structures,
So that I can start TDD implementation immediately with proper test coverage.

作為擁有已批准 SDD 規格的開發者，
我想要自動生成測試結構，
以便能立即使用正確的測試覆蓋率開始 TDD 實作。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: BDD Derivation from Given-When-Then AC
**Given** a SPEC with Acceptance Criteria in Given-When-Then format
**When** I run `/derive-bdd specs/SPEC-XXX.md`
**Then** a .feature file is generated with:
  - Feature name from SPEC title
  - @SPEC-XXX tag at feature level
  - One Scenario per AC with @AC-N tag
  - Given/When/Then steps matching AC content

### AC-2: BDD Derivation from Bullet AC
**Given** a SPEC with Acceptance Criteria as bullet points
**When** I run `/derive-bdd specs/SPEC-XXX.md`
**Then** bullet points are transformed to Given-When-Then format:
  - Conditions become Given
  - Actions become When
  - Outcomes become Then

### AC-3: TDD Test Skeleton Generation
**Given** a SPEC with Acceptance Criteria
**When** I run `/derive-tdd specs/SPEC-XXX.md`
**Then** a test file is generated with:
  - describe block for SPEC
  - describe block per AC
  - it blocks with descriptive names
  - AAA structure with TODO comments
  - Placeholder assertions

### AC-4: ATDD Acceptance Test Generation
**Given** a SPEC with Acceptance Criteria
**When** I run `/derive-atdd specs/SPEC-XXX.md`
**Then** an acceptance test document is generated with:
  - Test case table per AC
  - Step-by-step action columns
  - Expected result columns
  - Pass/Fail checkboxes
  - Tester sign-off section

### AC-5: Full Derivation Pipeline
**Given** a SPEC with Acceptance Criteria
**When** I run `/derive-all specs/SPEC-XXX.md`
**Then** all outputs are generated:
  - features/SPEC-XXX.feature (BDD)
  - tests/SPEC-XXX.test.ts (TDD)
  - acceptance/SPEC-XXX-acceptance.md (ATDD)

### AC-6: Language/Framework Selection
**Given** a SPEC and language preference
**When** I run `/derive-tdd specs/SPEC-XXX.md --lang python --framework pytest`
**Then** the test skeleton uses the specified language and framework syntax

### AC-7: Source Attribution
**Given** any derived output
**Then** each generated item includes:
  - Source reference: `# Generated from: specs/SPEC-XXX.md`
  - AC reference: `@AC-N` or `// AC-N:`
  - Generation timestamp

### AC-8: Anti-Hallucination Compliance
**Given** a SPEC with N acceptance criteria
**When** derivation completes
**Then** exactly N scenarios/test groups are generated (no extra, no missing)

---

## Detailed Design / 詳細設計

### Architecture / 架構

```
┌─────────────────────────────────────────────────────────────┐
│                    Forward Derivation System                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT                                                      │
│  └── SPEC-XXX.md (Approved)                                │
│       └── Acceptance Criteria (Given-When-Then or Bullet)   │
│                                                             │
│  DERIVATION ENGINE                                          │
│  ├── AC Parser                                              │
│  │    ├── Given-When-Then Extractor                        │
│  │    └── Bullet-to-GWT Transformer                        │
│  ├── BDD Generator                                          │
│  │    └── Gherkin Formatter                                │
│  ├── TDD Generator                                          │
│  │    └── Language-specific Templates                      │
│  └── ATDD Generator                                         │
│       └── Acceptance Table Formatter                       │
│                                                             │
│  OUTPUT                                                     │
│  ├── features/*.feature                                    │
│  ├── tests/*.test.{ts,js,py}                              │
│  └── acceptance/*.md                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Commands / 命令

| Command | Input | Output | Purpose |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → Test skeleton |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → Test table |
| `/derive-all` | SPEC-XXX.md | All above | Full pipeline |

### Parameters / 參數

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--lang` | string | typescript | Target language: ts, js, python, java, go |
| `--framework` | string | vitest | Test framework: vitest, jest, pytest, junit |
| `--output-dir` | string | ./generated | Output directory |
| `--dry-run` | boolean | false | Preview without creating files |

---

## Output Formats / 輸出格式

### BDD Feature File Output

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: /derive-bdd
# Generated at: 2026-01-19T10:00:00Z

@SPEC-001
Feature: [Feature Name from Spec]
  [Summary from Spec]

  @AC-1 @happy-path
  Scenario: [From AC-1 title]
    Given [precondition from AC]
    When [action from AC]
    Then [expected result from AC]

  @AC-2 @error-handling
  Scenario: [From AC-2 title]
    Given [precondition from AC]
    When [action from AC]
    Then [expected result from AC]
```

### TDD Test Skeleton Output

```typescript
/**
 * Tests for SPEC-001: [Title]
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2, AC-3
 */

describe('SPEC-001: [Title]', () => {
  describe('AC-1: [AC Title]', () => {
    it('should [expected behavior]', async () => {
      // Arrange
      // TODO: Set up test data

      // Act
      // TODO: Call method under test

      // Assert
      // TODO: Add assertions
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('AC-2: [AC Title]', () => {
    it('should [expected behavior]', async () => {
      // Arrange
      // TODO: Set up test data

      // Act
      // TODO: Call method under test

      // Assert
      // TODO: Add assertions
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### ATDD Acceptance Test Output

```markdown
# SPEC-001 Acceptance Tests

**Spec**: SPEC-001
**Generated**: 2026-01-19
**Status**: Pending

---

## AT-001: [From AC-1]

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | [Precondition setup] | [Ready state] | [ ] |
| 2 | [User action] | [System response] | [ ] |
| 3 | [Verification] | [Expected outcome] | [ ] |

**Notes**: _______________
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail

---

## AT-002: [From AC-2]

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | ... | ... | [ ] |

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
```

---

## Out of Scope / 範圍外

- Step definition implementation (only skeleton)
- Test assertion logic (only TODO markers)
- Running generated tests
- Modifying existing test files
- Automatic test framework detection

---

## Dependencies / 依賴

### Requires
- Approved SDD specification with Acceptance Criteria
- Core Standard: `core/forward-derivation-standards.md` (to be created)

### Integrates With
- `core/spec-driven-development.md` - Defines AC format
- `core/behavior-driven-development.md` - Defines Gherkin format
- `core/test-driven-development.md` - Defines test structure
- `methodologies/integrated-flow.methodology.yaml` - Workflow integration

---

## Risks / 風險

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ambiguous AC leads to poor derivation | Medium | Medium | Require structured AC format |
| Over-generation (hallucination) | Low | High | Strict 1:1 AC to output mapping |
| Framework mismatch | Low | Low | Support multiple frameworks |
| Generated code quality issues | Medium | Low | Clear TODO markers, human review required |

---

## Test Cases / 測試案例

### TC-001: Given-When-Then AC to BDD
- Input: SPEC with 3 AC in GWT format
- Expected: .feature with 3 scenarios

### TC-002: Bullet AC to BDD
- Input: SPEC with 5 bullet AC
- Expected: .feature with 5 scenarios, each with GWT steps

### TC-003: TDD skeleton generation
- Input: SPEC with 2 AC
- Expected: test file with 2 describe blocks

### TC-004: Multi-language support
- Input: Same SPEC, different --lang flags
- Expected: Correct syntax for each language

### TC-005: Full pipeline derivation
- Input: SPEC with 3 AC
- Expected: 3 files generated (.feature, .test.ts, acceptance.md)

### TC-006: Anti-hallucination compliance
- Input: SPEC with exactly 4 AC
- Expected: Exactly 4 scenarios, 4 test groups, 4 acceptance tests

---

## Changelog / 變更記錄

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial specification |

---

## References / 參考資料

- [Spec-Driven Development](../core/spec-driven-development.md)
- [Reverse Engineering Standards](../core/reverse-engineering-standards.md)
- [Behavior-Driven Development](../core/behavior-driven-development.md)
- [Test-Driven Development](../core/test-driven-development.md)
- [Integrated Flow Methodology](../methodologies/integrated-flow.methodology.yaml)
