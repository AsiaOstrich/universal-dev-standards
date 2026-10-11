---
source: ../../../core/recovery-recipe-registry.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: d6c8e8e176b4
status: current
---

# 恢复配方注册表标准

> **语言**: [English](../../../core/recovery-recipe-registry.md) | 简体中文

> **来源**: XSPEC-046 | **借鉴自**: ultraworkers/claw-code ROADMAP Phase 3 Recovery Recipes
> **依赖**: failure-source-taxonomy（XSPEC-045）

## 概述

恢复配方注册表把分散的恢复逻辑（Fix Loop、Circuit Breaker、Guardian 自动修复、staging 重试）统一为可外部化、可用 YAML 配置的 Recipe 格式。每个 Recipe 以 `failureSource`（XSPEC-045）为匹配键，选择对应的恢复策略，并定义升级路径。没有匹配的 Recipe 时，系统回退到既有行为（向后兼容）。

## 6 种恢复策略

| 策略 | 说明 | 最适用于 |
|------|------|---------|
| `fix_loop` | 注入结构化错误反馈后重试任务 | compilation, test_failure |
| `circuit_breaker` | 三态断路器（XSPEC-036），连续失败后打开 | tool_failure, prompt_delivery |
| `rebase_and_retry` | 执行 git rebase 同步基础分支后重试 | branch_divergence |
| `model_switch` | 切换到备用模型后重试 | model_degradation, prompt_delivery |
| `degraded_mode` | 以降级模式继续（跳过质量验证、返回部分结果） | resource_exhaustion, model_degradation |
| `human_checkpoint` | 暂停执行，等待人工介入 | policy_violation, branch_divergence |

## Recipe 格式

```yaml
id: RR-001                          # RR-NNN format, required
name: "Fix Loop for Compilation"    # required
match:
  failure_source: compilation       # FailureSource, required
  severity: [high, medium]          # optional, empty = match all
strategy: fix_loop                  # RecoveryStrategy, required
config:                             # optional, overrides strategy defaults
  max_attempts: 3
  budget_usd: 0.50
escalation:                         # required
  on_exhaust: human_checkpoint      # must not reference self
  message: "..."                    # optional notification message
```

## 默认 Recipe（RR-001 ~ RR-005）

| ID | 触发条件 | 策略 | 升级 |
|----|---------|------|------|
| RR-001 | compilation | fix_loop（3 次，$0.50） | human_checkpoint |
| RR-002 | test_failure | fix_loop（3 次，$0.50） | human_checkpoint |
| RR-003 | model_degradation | model_switch（2 次） | degraded_mode |
| RR-004 | branch_divergence | rebase_and_retry（1 次） | human_checkpoint |
| RR-005 | resource_exhaustion | degraded_mode | human_checkpoint |

## 指引

- 每个 Recovery Recipe 必须有唯一 ID（RR-NNN 格式）
- `match.failure_source` 必须是 failure-source-taxonomy 定义的 8 类之一
- 必须定义 `escalation.on_exhaust` —— 禁止无限循环（升级目标不得指向自己）
- 没有匹配的 Recipe 时，系统必须回退到既有默认行为（不得抛出错误）
- 用户自定义 Recipe 优先于内置 Recipe（`failureSource` 相符时，先匹配用户配置）
- Recipe 配置格式错误时回退到策略默认值（不中断执行）

## 适用场景

- Orchestrator（采用层）在 fix loop 之前选择恢复策略
- Pipeline Runner（采用层）以注册表查询处理 `agent:error`
- 以自定义 `recovery-recipes.yaml` 进行项目级 Recipe 覆盖
- 以遥测追踪恢复策略的成效

## 参考资料

- AI 优化版：[ai/standards/recovery-recipe-registry.ai.yaml](../../../ai/standards/recovery-recipe-registry.ai.yaml)
- XSPEC-046：跨项目规格
- 依赖：Failure Source Taxonomy（XSPEC-045）
- 借鉴自：[ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 3 Recovery Recipes


**范围**: universal
