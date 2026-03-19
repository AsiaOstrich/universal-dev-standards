---
description: [UDS] Analyze BDD-TDD coverage gaps
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[feature file or test directory | Feature 文件或测试目录]"
---

# /reverse-tdd — Analyze BDD-TDD Coverage Gaps | 分析 BDD-TDD 覆盖差距

Analyze gaps between BDD scenarios and TDD test coverage.

分析 BDD 场景与 TDD 测试覆盖之间的差距。

## Workflow | 工作流程

```
.feature + tests/ ──► Map Scenarios ──► Find Gaps ──► Report
```

1. **解析**现有 `.feature` 文件中的场景
2. **扫描**测试文件中对应的单元测试
3. **映射** BDD 场景到 TDD 测试覆盖
4. **识别**覆盖差距（没有单元测试的场景）
5. **生成**差距报告及建议

## Output Format | 输出格式

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
| `/reverse-tdd features/` | Analyze all feature files | 分析所有 feature 文件 |
| `/reverse-tdd features/auth.feature` | Analyze specific feature | 分析特定 feature |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
