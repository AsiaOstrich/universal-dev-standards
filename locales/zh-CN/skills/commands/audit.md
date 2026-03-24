---
source: ../../../../skills/commands/audit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] UDS health check and feedback system, diagnose installation integrity and detect development patterns"
allowed-tools: Read, Grep, Glob, Bash(git log:*, uds audit:*)
argument-hint: "[--health | --patterns | --friction | --report]"
---

# Audit Assistant | 审计助手

UDS health check and feedback system — diagnose installation integrity and detect development patterns.

UDS 健康检查与反馈系统——诊断安装完整性与检测开发模式。

## Workflow | 工作流程

```
DIAGNOSE ──► ANALYZE ──► REPORT
```

## Usage | 使用方式

- `/audit` - 执行完整审计
- `/audit --health` - 安装健康检查
- `/audit --patterns` - 检测开发模式
- `/audit --friction` - 识别摩擦点
- `/audit --report` - 生成综合报告

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/audit` | 执行完整审计（health + patterns + friction） |
| `/audit --health` | 仅检查 UDS 安装完整性 |
| `/audit --patterns` | 仅检测开发模式 |
| `/audit --friction` | 仅识别摩擦点 |
| `/audit --report` | 生成完整报告（含建议） |

### Interaction Script | 交互脚本

1. 依模式执行对应的诊断
2. 收集分析结果
3. 生成报告

**Decision: 健康状态**
- IF ERROR 级问题 → 建议执行 `uds init` 或 `uds check --restore`
- IF WARNING 级问题 → 列出建议，用户自行决定
- IF 全部 OK → 展示健康摘要

**STOP**: 报告展示后等待用户决定

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 报告展示后 | 用户决定采取行动 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| UDS 未安装 | 建议执行 `uds init` |
| `.standards/` 目录不存在 | 告知 UDS 标准未安装 |

## Reference | 参考

- Full standard: [audit-assistant](../audit-assistant/SKILL.md)
