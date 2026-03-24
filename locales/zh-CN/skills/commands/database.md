---
source: ../../../../skills/commands/database.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide database design, migration planning and query optimization"
allowed-tools: Read, Grep, Glob
argument-hint: "[schema or migration to review | 要审查的 schema 或迁移]"
---

# Database Assistant | 数据库助手

Guide database design, migration planning and query optimization.

引导数据库设计、迁移规划和查询优化。

## Workflow | 工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

## Usage | 使用方式

- `/database` - 启动交互式数据库设计
- `/database schema` - 审查或设计 schema
- `/database --migration` - 规划迁移

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/database` | 询问任务类型（schema 设计 / 迁移规划 / 查询优化） |
| `/database schema` | 进入 schema 设计/审查模式 |
| `/database --migration` | 进入迁移规划模式 |

### Interaction Script | 交互脚本

1. 确认任务类型和目标
2. 分析现有 schema 或迁移文件

**Decision: 任务类型**
- IF schema 设计 → 引导规范化、索引设计、关联定义
- IF 迁移规划 → 评估风险、生成迁移脚本、规划回滚
- IF 查询优化 → 分析慢查询、建议索引

3. 展示设计/计划结果

**STOP**: 结果展示后等待用户确认

**STOP**: 迁移脚本写入前等待用户确认

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 设计/计划展示后 | 确认方案 |
| 迁移脚本生成后 | 确认写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法检测数据库类型 | 询问用户（PostgreSQL/MySQL/MongoDB 等） |
| 迁移存在数据丢失风险 | 明确警告，要求用户确认 |

## Reference | 参考

- Full standard: [database-assistant](../database-assistant/SKILL.md)
- Core guide: [database-standards](../../core/database-standards.md)
