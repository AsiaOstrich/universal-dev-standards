---
source: ../../../../skills/commands/migrate.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide code migration, framework upgrades and technology modernization"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
argument-hint: "[migration target or framework | 迁移目标或框架]"
---

# Migration Assistant | 迁移助手

Guide code migration, framework upgrades and technology modernization.

引导代码迁移、框架升级与技术现代化。

## Workflow | 工作流程

```
ASSESS ──► PLAN ──► PREPARE ──► MIGRATE ──► VERIFY ──► CLEANUP
```

## Usage | 使用方式

- `/migrate` - 启动交互式迁移指南
- `/migrate --assess` - 评估迁移范围和风险
- `/migrate "Vue 2 to 3"` - 迁移特定框架
- `/migrate --deps` - 依赖升级分析
- `/migrate --rollback` - 回滚策略规划

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/migrate` | 询问迁移目标，进入 ASSESS |
| `/migrate --assess` | 直接执行范围和风险评估 |
| `/migrate "target"` | 以指定目标进入 ASSESS |
| `/migrate --deps` | 仅分析依赖包升级 |
| `/migrate --rollback` | 规划回滚策略 |

### Interaction Script | 交互脚本

#### ASSESS Phase
1. 分析现有代码和依赖性
2. 评估风险矩阵（breaking changes、数据迁移、API 变更）
3. 展示评估报告

**STOP**: 评估报告后等待用户决定是否继续

#### PLAN Phase
1. 制定迁移计划（分阶段步骤）
2. 定义回滚策略

**STOP**: 计划确认后等待用户确认

#### MIGRATE Phase
1. 逐步执行迁移
2. 每个步骤后验证

**STOP**: 每个主要步骤完成后等待确认

#### VERIFY Phase
1. 执行测试确认迁移成功
2. 生成验证报告

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| ASSESS | 评估报告后 | 决定是否继续 |
| PLAN | 计划制定后 | 确认计划 |
| MIGRATE | 每个主要步骤后 | 确认继续 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 迁移步骤失败 | 建议回滚到上一个检查点 |
| 依赖冲突 | 列出冲突，建议解决方案 |
| 测试失败 | 报告失败，建议修复后重试 |

## Reference | 参考

- Full standard: [migration-assistant](../migration-assistant/SKILL.md)
