---
description: [UDS] Analyze BDD-TDD coverage gaps
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[feature file or test directory | Feature 檔案或測試目錄]"
---

# /reverse-tdd — Analyze BDD-TDD Coverage Gaps | 分析 BDD-TDD 覆蓋差距

Analyze gaps between BDD scenarios and TDD test coverage.

分析 BDD 場景與 TDD 測試覆蓋之間的差距。

## Workflow | 工作流程

```
.feature + tests/ ──► Map Scenarios ──► Find Gaps ──► Report
```

1. **Parse** existing `.feature` files for scenarios
2. **Scan** test files for corresponding unit tests
3. **Map** BDD scenarios to TDD test coverage
4. **Identify** coverage gaps (scenarios without unit tests)
5. **Generate** gap report with recommendations

## Output Format | 輸出格式

```markdown
# BDD-TDD Coverage Gap Analysis

## Coverage Summary
- Total BDD Scenarios: 12
- Covered by TDD: 9 (75%)
- Gaps Found: 3

## Gaps
| Scenario | Feature File | Missing TDD |
|----------|-------------|-------------|
| Password reset | auth.feature:15 | No unit test for token validation |
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/reverse-tdd features/` | Analyze all feature files | 分析所有 feature 檔案 |
| `/reverse-tdd features/auth.feature` | Analyze specific feature | 分析特定 feature |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
