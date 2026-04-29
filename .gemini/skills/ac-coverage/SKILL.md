---
name: ac-coverage
scope: universal
description: "[UDS] Analyze AC-to-test traceability and coverage"
allowed-tools: Read, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# AC Coverage Assistant | AC 覆蓋率助手

Analyze Acceptance Criteria (AC) to test traceability and generate coverage reports.

分析驗收條件（AC）與測試之間的追蹤關係，並產生覆蓋率報告。

## What This Does vs `/coverage` | 與 `/coverage` 的區別

| Aspect | `/coverage` | `/ac-coverage` |
|--------|-------------|----------------|
| **Scope** | Code-level (line/branch/function) | Requirement-level (AC-to-test) |
| **Input** | Source code + test runner | SPEC file + test annotations |
| **Question** | "How much code is tested?" | "Which AC have tests?" |
| **Output** | Coverage percentages | Traceability matrix + gap report |

## Workflow | 工作流程

1. **Parse SPEC** — Extract AC definitions (AC-1, AC-2, ...) from the specification file
2. **Scan Tests** — Search test files for `@AC` and `@SPEC` annotations using standard linking conventions
3. **Build Matrix** — Map each AC to its test references (file, test name, line)
4. **Classify Status** — Mark each AC as ✅ covered, ⚠️ partial, or ❌ uncovered
5. **Calculate Coverage** — Apply formula: `Coverage % = (covered + partial × 0.5) / total × 100`
6. **Generate Report** — Output standardized Markdown report

## Linking Convention | 標註慣例

Tests MUST reference their source AC using standard annotations:

```typescript
// TypeScript/JavaScript
describe('AC-1: User login with valid credentials', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: User login with valid credentials
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

## Coverage Thresholds | 覆蓋率門檻

| Threshold | Default Value | Enforcement |
|-----------|---------------|-------------|
| **Check-in** | 80% | Required for feature branch merge |
| **Release** | 100% | Required for production release |
| **Warning** | 60% | Triggers coverage warning |

Thresholds are configurable via `--threshold` parameter or project configuration.

## Report Format | 報告格式

The generated report follows the standard format from `core/acceptance-criteria-traceability.md`:

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — Feature Name
**Generated**: 2026-03-18
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | Login with valid credentials | ✅ | auth.test.ts:15 |
| AC-2 | Reject invalid credentials | ✅ | auth.test.ts:32 |
| ...   | ...                        | ... | ... |

## Gaps
- **AC-8**: Social login — Blocked by OAuth sandbox

## Action Items
1. [ ] AC-8: Set up OAuth sandbox (ETA: TBD)
```

## Next Steps Guidance | 下一步引導

After `/ac-coverage` completes, the AI assistant should suggest:

> **AC 覆蓋率分析完成。建議下一步 / AC coverage analysis complete. Suggested next steps:**
> - 覆蓋率達標 → 執行 `/checkin` 品質關卡 — Coverage meets threshold → Run `/checkin` quality gates
> - 有未覆蓋 AC → 執行 `/derive-tdd` 補齊測試 — Uncovered AC found → Run `/derive-tdd` to add tests
> - 有部分覆蓋 AC → 檢查缺少的邊界情況 — Partial AC → Review missing edge cases

## Reference | 參考

- Core standard: [acceptance-criteria-traceability.md](../../core/acceptance-criteria-traceability.md)
- SPEC: [SPEC-AC-COVERAGE.md](../../docs/specs/skills/SPEC-AC-COVERAGE.md)
- Related: [test-coverage-assistant](../test-coverage-assistant/SKILL.md) (code-level coverage)
- Related: [checkin-assistant](../checkin-assistant/SKILL.md) (quality gates)
