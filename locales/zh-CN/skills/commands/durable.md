---
source: ../../../../skills/commands/durable.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide workflow failure recovery with checkpoints, retries and rollback strategies"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[workflow name or failure context | 工作流名称或失败情境]"
---

# Durable Execution Assistant | 持久执行助手

Guide workflow failure recovery with checkpoints, retries and rollback strategies.

引导工作流程故障恢复，包含检查点、重试与回滚策略。

## Workflow | 工作流程

```
DETECT ──► DIAGNOSE ──► RECOVER ──► VERIFY ──► CONTINUE
```

## Usage | 使用方式

- `/durable` - 启动交互式故障恢复
- `/durable --checkpoint` - 设计检查点策略
- `/durable --retry` - 设计重试策略
- `/durable --rollback` - 规划回滚策略
- `/durable <workflow>` - 分析特定工作流程

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/durable` | 询问工作流程或失败情境，进入 DETECT |
| `/durable --checkpoint` | 直接进入检查点策略设计 |
| `/durable --retry` | 直接进入重试策略设计 |
| `/durable --rollback` | 直接进入回滚策略规划 |
| `/durable <workflow>` | 分析指定工作流程 |

### Interaction Script | 交互脚本

#### DETECT / DIAGNOSE
1. 分析工作流程结构和失败点
2. 识别需要持久化的状态

**Decision: 故障类型**
- IF 暂时性故障（网络、超时） → 建议重试策略（exponential backoff）
- IF 数据不一致 → 建议检查点 + 补偿事务
- IF 不可逆失败 → 建议回滚策略

**STOP**: 诊断结果展示后等待用户确认策略方向

#### RECOVER
1. 设计选定的恢复策略
2. 展示策略细节和代码建议

**STOP**: 策略设计后等待用户确认

#### VERIFY
1. 建议验证步骤确认恢复成功

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| DIAGNOSE | 诊断结果后 | 确认策略方向 |
| RECOVER | 策略设计后 | 确认实施 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法识别工作流程模式 | 询问用户描述工作流程步骤 |
| 多种故障类型并存 | 逐一分析，建议组合策略 |

## Reference | 参考

- Full standard: [durable-execution-assistant](../durable-execution-assistant/SKILL.md)
