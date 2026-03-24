---
source: ../../../../skills/commands/incident.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide incident response, root cause analysis and post-mortem documentation"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[incident description or severity | 事故描述或严重程度]"
---

# Incident Response Assistant | 事故响应助手

Guide incident response, root cause analysis and post-mortem documentation.

引导事故响应、根因分析和事后复盘文档撰写。

## Workflow | 工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM
```

## Usage | 使用方式

- `/incident` - 启动交互式事故响应
- `/incident "API 500 errors"` - 响应特定事故
- `/incident --post-mortem` - 为已解决事故撰写复盘文档
- `/incident --sev1` - 启动 SEV1 响应协议

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/incident` | 询问事故描述和严重程度，进入 DETECT |
| `/incident "description"` | 以描述为起点，进入 TRIAGE |
| `/incident --post-mortem` | 直接进入 POST-MORTEM 阶段 |
| `/incident --sev1` | 启动 SEV1 紧急响应协议 |

### Interaction Script | 交互脚本

#### DETECT / TRIAGE
1. 收集事故症状和影响范围
2. 评估严重程度（SEV1-4）

**Decision: 严重程度**
- IF SEV1/SEV2 → 立即列出紧急行动清单，建议通知相关人员
- IF SEV3/SEV4 → 按标准流程排查

**STOP**: 严重程度评估后等待用户确认

#### MITIGATE
1. 建议即时缓解措施
2. 追踪缓解状态

#### RESOLVE
1. 引导根因分析（5 Whys）
2. 建议修复方案

**STOP**: 修复方案确认后等待用户确认实施

#### POST-MORTEM
1. 收集时间线、根因、影响
2. 生成事后复盘文档

**STOP**: 文档生成后等待用户确认写入

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| TRIAGE | 严重程度评估后 | 确认分级 |
| RESOLVE | 修复方案提出后 | 确认实施 |
| POST-MORTEM | 文档生成后 | 确认写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法判断严重程度 | 列出分级标准，请用户选择 |
| 缺乏足够症状信息 | 引导收集更多信息（日志、监控、错误消息） |

## Reference | 参考

- Full standard: [incident-response-assistant](../incident-response-assistant/SKILL.md)
