---
source: ../../../../skills/commands/metrics.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Track development metrics, code quality indicators and project health"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git log:*)
argument-hint: "[metric type or module | 指标类型或模块]"
---

# Metrics Dashboard Assistant | 指标仪表板助手

Track development metrics, code quality indicators and project health.

追踪开发指标、代码质量指示器与项目健康状态。

## Workflow | 工作流程

```
COLLECT ──► ANALYZE ──► REPORT ──► TREND
```

## Usage | 使用方式

- `/metrics` - 执行全面指标分析
- `/metrics --quality` - 仅代码质量指标
- `/metrics --debt` - 技术债分析
- `/metrics --test` - 仅测试指标
- `/metrics src/` - 分析特定模块

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/metrics` | 执行全面指标分析 |
| `/metrics --quality` | 仅分析代码质量指标 |
| `/metrics --debt` | 仅分析技术债 |
| `/metrics --test` | 仅分析测试指标 |
| `/metrics <path>` | 分析指定模块 |

### Interaction Script | 交互脚本

1. 检测项目结构和可用工具
2. 收集指标数据（git log、测试覆盖率、代码复杂度）
3. 分析趋势和异常
4. 生成报告

**STOP**: 报告展示后等待用户决定是否采取行动

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 报告展示后 | 用户决定后续行动 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法执行覆盖率工具 | 跳过该指标，报告可用的其他指标 |
| git 历史不足以分析趋势 | 仅报告当前快照，标记趋势为 N/A |

## Reference | 参考

- Full standard: [metrics-dashboard-assistant](../metrics-dashboard-assistant/SKILL.md)
