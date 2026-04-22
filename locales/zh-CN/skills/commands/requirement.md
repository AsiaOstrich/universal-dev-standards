---
source: ../../../../skills/commands/requirement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

---
description: [UDS] Write user stories and requirements following INVEST criteria
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature name or description | 功能名称或描述]"
---

# Requirement Assistant | 需求助手

Write well-structured user stories and requirements following INVEST criteria.

撰写结构良好的用户故事和需求文件，遵循 INVEST 标准。

## Workflow | 工作流程

1. **理解上下文** - 收集功能相关信息
2. **识别利益相关者** - 谁从此功能中受益？
3. **撰写用户故事** - 遵循标准格式
4. **定义验收标准** - 具体、可测试的条件
5. **以 INVEST 验证** - 检查质量标准

## User Story Format | 用户故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST Criteria | INVEST 标准

| Criterion | Description | 说明 |
|-----------|-------------|------|
| **I**ndependent | Can be developed separately | 可独立开发 |
| **N**egotiable | Details can be discussed | 可协商细节 |
| **V**aluable | Delivers value to user | 提供用户价值 |
| **E**stimable | Can estimate effort | 可估算工作量 |
| **S**mall | Fits in one sprint | 适合单一迭代 |
| **T**estable | Has clear test criteria | 有明确测试标准 |

## Usage | 使用方式

- `/requirement` - 交互式需求撰写向导
- `/requirement user login` - 为特定功能撰写需求
- `/requirement "users can export data"` - 基于描述撰写

## Reference | 参考

- Full standard: [requirement-assistant](../requirement-assistant/SKILL.md)
- Core guide: [requirements-standards](../../core/requirement-engineering.md)
