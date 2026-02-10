---
description: [UDS] Write user stories and requirements following INVEST criteria
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature name or description | 功能名稱或描述]"
---

# Requirement Assistant | 需求助手

Write well-structured user stories and requirements following INVEST criteria.

撰寫結構良好的用戶故事和需求文件，遵循 INVEST 標準。

## Workflow | 工作流程

1. **Understand context** - Gather information about the feature
2. **Identify stakeholders** - Who benefits from this feature?
3. **Write user story** - Follow the standard format
4. **Define acceptance criteria** - Specific, testable conditions
5. **Validate with INVEST** - Check quality criteria

## User Story Format | 用戶故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST Criteria | INVEST 標準

| Criterion | Description | 說明 |
|-----------|-------------|------|
| **I**ndependent | Can be developed separately | 可獨立開發 |
| **N**egotiable | Details can be discussed | 可協商細節 |
| **V**aluable | Delivers value to user | 提供用戶價值 |
| **E**stimable | Can estimate effort | 可估算工作量 |
| **S**mall | Fits in one sprint | 適合單一迭代 |
| **T**estable | Has clear test criteria | 有明確測試標準 |

## Usage | 使用方式

- `/requirement` - Interactive requirement writing wizard
- `/requirement user login` - Write requirement for specific feature
- `/requirement "users can export data"` - Based on description

## Reference | 參考

- Full standard: [requirement-assistant](../requirement-assistant/SKILL.md)
- Core guide: [requirements-standards](../../core/requirement-engineering.md)
