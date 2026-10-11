---
source: ../../../../skills/commands/requirement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: ae753f750fe7
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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/requirement` | 询问用户要定义的功能，开始交互式需求撰写 |
| `/requirement <feature>` | 以指定功能为目标，开始收集信息 |
| `/requirement "description"` | 从描述中提取需求，生成用户故事 |

### Interaction Script | 交互脚本

1. 收集功能描述和用户角色
2. 引导定义 As a / I want / So that
3. 引导定义 Acceptance Criteria（GWT 格式）
4. 以 INVEST 准则逐项验证

**Decision: INVEST 验证结果**
- IF 全部通过 → 展示完整需求文件
- IF 有项目未通过 → 指出哪些未通过，建议修改方式

🛑 **STOP**: 展示需求文件后等待用户确认写入

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 需求文件生成后 | 确认内容正确并写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 用户描述过于模糊 | 提出具体问题厘清范围 |
| AC 无法用 GWT 格式表达 | 协助转换，展示转换建议 |

## Reference | 参考

- Full standard: [requirement-assistant](../requirement-assistant/SKILL.md)
- Core guide: [requirements-standards](../../core/requirement-engineering.md)
