---
source: ../../../../skills/commands/observability.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5b2af544e6f8
status: current
description: "[UDS] 引导可观测性设置、指标设计、告警和成熟度评估"
---

---
description: "[UDS] 引导可观测性设置、指标设计、告警和成熟度评估"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[--checklist | --maturity | --alerting | service name | 服务名称]"
---

# Observability Assistant | 可观测性助手

See [SKILL.md](../observability-assistant/SKILL.md) for full documentation.

详见 [SKILL.md](../observability-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/observability` | 询问目标服务，进行整体可观测性评估 |
| `/observability --checklist` | 直接执行可观测性检查清单 |
| `/observability --maturity` | 执行成熟度评估并给出改善建议 |
| `/observability --alerting` | 进入告警规则设计与审查流程 |
| `/observability <service>` | 针对指定服务进行可观测性分析 |

### Interaction Script | 交互脚本

1. 确认目标服务与现有可观测性工具（Prometheus、Grafana、Datadog 等）
2. 依选定模式执行评估或设计流程
3. 展示现况分析与缺口报告

**Decision: 可观测性缺口**
- IF 缺少 Metrics → 建议关键指标清单（RED/USE method）
- IF 缺少 Tracing → 建议分布式追踪导入步骤
- IF 缺少 Logging → 建议结构化日志规范
- IF 告警规则不完整 → 建议补齐 SLO-based alerting

🛑 **STOP**: 缺口分析完成后等待用户确认优先补齐项目

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 现况评估报告后 | 用户确认分析正确性 |
| 改善建议展示后 | 用户决定优先实施项目 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法识别监控工具 | 询问工具名称或改以通用建议进行 |
| 服务不存在或名称不明 | 请用户确认服务名称或列出已知服务 |
