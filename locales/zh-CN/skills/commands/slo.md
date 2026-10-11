---
source: ../../../../skills/commands/slo.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 80f530e0fbf1
status: current
description: "[UDS] 引导 SLI 选取、SLO 设置和 Error Budget 管理"
---

---
description: "[UDS] 引导 SLI 选取、SLO 设置和 Error Budget 管理"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create | review | budget] [service name | 服务名称]"
---

# SLO Assistant | SLO 助手

See [SKILL.md](../slo-assistant/SKILL.md) for full documentation.

详见 [SKILL.md](../slo-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/slo` | 询问目标服务，进入 SLO 设计导览 |
| `/slo create` | 启动新 SLO 创建流程 |
| `/slo create <service>` | 针对指定服务直接启动 SLO 创建 |
| `/slo review` | 审查现有 SLO 设置合理性 |
| `/slo budget` | 查看 Error Budget 消耗状况与建议 |

### Interaction Script | 交互脚本

1. 确认操作模式（创建 / 审查 / Error Budget）
2. 依模式引导用户完成 SLI 选取、目标设置或现况分析
3. 输出 SLO 定义草稿或 Error Budget 报告

**Decision: 创建模式**
- 引导选择 SLI 类型（Availability / Latency / Quality）
- 询问目标值（如 99.9%）与测量窗口（rolling 28d）
- IF 目标值过高（>99.99%）→ 警告工程成本，建议先设较保守的目标

**Decision: Error Budget 模式**
- IF budget 剩余 < 10% → 建议暂停非必要发布
- IF budget 已耗尽 → 提示冻结发布，优先处理可靠性

🛑 **STOP**: SLO 草稿完成后等待用户确认目标值与告警阈值

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| SLI 选取完成后 | 用户确认选定的可靠性指标 |
| SLO 草稿生成后 | 用户审查目标值与告警设置 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 服务无监控数据 | 建议先导入基础 metrics，再设置 SLO |
| 目标值格式错误 | 提示正确格式（如 `99.9%` 或 `0.999`） |
