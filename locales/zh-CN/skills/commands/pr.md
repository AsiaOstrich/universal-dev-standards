---
source: ../../../../skills/commands/pr.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide Pull Request creation, review automation and merge strategies"
allowed-tools: Read, Grep, Glob, Bash(git:*, gh:*)
argument-hint: "[branch name or PR number | 分支名称或 PR 编号]"
---

# PR Automation Assistant | PR 自动化助手

Guide Pull Request creation, review automation and merge strategies.

引导 Pull Request 创建、审查自动化和合并策略。

## Workflow | 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► MERGE ──► CLEANUP
```

## Usage | 使用方式

- `/pr` - 启动交互式 PR 创建
- `/pr create` - 从当前分支创建 PR
- `/pr --template` - 使用 PR 模板
- `/pr review 123` - 审查特定 PR

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/pr` | 检查当前分支状态，询问创建或审查 PR |
| `/pr create` | 分析当前分支差异，创建 PR |
| `/pr --template` | 使用 PR 模板创建 |
| `/pr review <number>` | 审查指定 PR |

### Interaction Script | 交互脚本

#### CREATE
1. 确认当前分支和目标分支
2. 分析 commits，生成 PR title 和 description
3. 展示 PR 内容预览

**STOP**: PR 内容确认后等待用户确认创建

#### REVIEW
1. 获取 PR 差异
2. 执行代码审查（套用 `/review` 标准）
3. 展示审查结果

**STOP**: 审查结果展示后等待用户决定

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| CREATE | PR 内容预览后 | 确认创建 |
| REVIEW | 审查结果后 | 决定后续行动 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无远程分支 | 建议先 push |
| PR 已存在 | 展示现有 PR，询问是否更新 |
| CI 检查失败 | 列出失败项目，建议修复 |

## Reference | 参考

- Full standard: [pr-automation-assistant](../pr-automation-assistant/SKILL.md)
