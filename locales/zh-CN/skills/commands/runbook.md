---
source: ../../../../skills/commands/runbook.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 204f37312d01
status: current
description: "[UDS] 引导 Runbook 创建、维护、演练和覆盖率报告"
---

---
description: "[UDS] 引导 Runbook 创建、维护、演练和覆盖率报告"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create | drill | coverage] [alert name | 告警名称]"
---

# Runbook Assistant | Runbook 助手

See [SKILL.md](../runbook-assistant/SKILL.md) for full documentation.

详见 [SKILL.md](../runbook-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/runbook` | 询问目标告警或服务，进入 runbook 导览菜单 |
| `/runbook create` | 启动 runbook 创建流程 |
| `/runbook create <alert>` | 针对指定告警直接创建 runbook |
| `/runbook drill` | 启动 runbook 演练模拟流程 |
| `/runbook coverage` | 生成 runbook 覆盖率报告 |

### Interaction Script | 交互脚本

1. 确认操作模式（创建 / 演练 / 覆盖率）
2. 依模式执行对应流程，收集必要信息
3. 输出 runbook 草稿或报告

**Decision: 创建模式**
- IF 已提供告警名称 → 直接填入模板并生成草稿
- IF 未提供告警名称 → 询问告警名称、严重程度、负责团队

**Decision: 演练模式**
- 逐步模拟告警触发情境，确认执行步骤可行性
- IF 步骤有疑义 → 停止并请用户确认或修正

🛑 **STOP**: runbook 草稿生成后等待用户审查与修正

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 草稿生成后 | 用户审查并确认内容正确 |
| 演练每个关键步骤后 | 用户确认步骤可执行 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 告警名称不明确 | 请用户提供告警名称或描述触发条件 |
| 无现有 runbook 可演练 | 提示先执行 `create` 创建 runbook |
