---
source: ../../../core/recovery-recipe-registry.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 恢复配方注册表标准

> **语言**: [English](../../../core/recovery-recipe-registry.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-16
**适用范围**: 所有 Agent 执行恢复逻辑
**Scope**: universal
**来源**: XSPEC-046（claw-code ROADMAP Phase 3 Recovery Recipes，DEC-035）
**依赖**: failure-source-taxonomy（XSPEC-045）

---

## 目的

恢复配方注册表：将分散的恢复逻辑统一为 YAML 可配置的 Recipe，以 `failureSource` 为匹配键。

各模块（Fix Loop、Circuit Breaker、Guardian 自动修复、Staging 重试）的恢复逻辑统一为可外部化的 Recovery Recipe 格式。每个 Recipe 通过 `failureSource`（XSPEC-045）匹配触发条件，选择对应的恢复策略，并定义升级路径（escalation）。无匹配 Recipe 时 fallback 到现有行为（向后兼容）。

---

## 核心规范

- 每个 Recovery Recipe 必须有唯一 ID（`RR-NNN` 格式）
- `match.failure_source` 必须是 failure-source-taxonomy 中定义的 8 类之一
- `escalation.on_exhaust` 必须定义，不得无限循环（如 escalation 指向自身）
- 无匹配 Recipe 时，系统必须 fallback 到现有默认行为（不得抛出错误）
- 用户自定义 Recipe 优先于内置 Recipe（同 `failureSource` 时，用户配置的先匹配）
- Recipe config 格式错误时 fallback 到策略默认值（不中断执行）

---

## 6 个内置恢复策略

### `fix_loop`

- **描述**：注入结构化错误反馈，重试任务（现有 Fix Loop）
- **默认 config**：`max_attempts: 3`, `budget_usd: 0.50`
- **最适合**：`compilation`, `test_failure`

### `circuit_breaker`

- **描述**：三态断路器保护（XSPEC-036），连续失败后开路避免雪崩
- **默认 config**：`failure_threshold: 3`, `cooldown_ms: 30000`
- **最适合**：`tool_failure`, `prompt_delivery`

### `rebase_and_retry`

- **描述**：先执行 git rebase 同步基准分支，再重试任务 / 迭代
- **默认 config**：`max_attempts: 1`, `base_branch: "main"`
- **最适合**：`branch_divergence`
- **依赖**：XSPEC-047 Branch Drift Detection

### `model_switch`

- **描述**：切换至备用模型后重试
- **默认 config**：`fallback_models: [...]`, `max_attempts: 2`
- **最适合**：`model_degradation`, `prompt_delivery`

### `degraded_mode`

- **描述**：以降级模式继续执行（如：跳过质量验证、以部分结果继续）
- **结果状态**：`done_with_concerns`
- **最适合**：`resource_exhaustion`, `model_degradation`

### `human_checkpoint`

- **描述**：暂停执行，等待人工介入（提供失败细节供判断）
- **最适合**：`policy_violation`, `branch_divergence`
- **备注**：所有其他策略的最终升级路径

---

## Recipe YAML 格式

```yaml
id: RR-NNN          # 必填，唯一标识符
name: string        # 必填，可读名称
match:              # 必填
  failure_source: <FailureSource>   # 必填
  severity: [critical, high, ...]   # 选填；省略表示匹配所有 severity
strategy: <RecoveryStrategy>        # 必填
config: {}                          # 选填；覆盖策略默认值
escalation:         # 必填
  on_exhaust: <RecoveryStrategy>    # 必填；不得指向自身
  message: string   # 选填；升级时的通知消息
```

---

## 5 个默认 Recipe

| ID | 名称 | 匹配条件 | 策略 | 升级路径 |
|----|------|----------|------|---------|
| `RR-001` | Fix Loop for Compilation Errors | `compilation` | `fix_loop`（3次, $0.50） | `human_checkpoint` |
| `RR-002` | Fix Loop for Test Failures | `test_failure` | `fix_loop`（3次, $0.50） | `human_checkpoint` |
| `RR-003` | Model Switch for Degradation | `model_degradation` | `model_switch`（2次） | `degraded_mode` |
| `RR-004` | Rebase for Branch Divergence | `branch_divergence` | `rebase_and_retry`（1次） | `human_checkpoint`（需人工解决冲突） |
| `RR-005` | Degraded Mode for Resource Exhaustion | `resource_exhaustion` | `degraded_mode` | `human_checkpoint` |

---

## 类型定义

### RecoveryStrategy

```
fix_loop | circuit_breaker | rebase_and_retry | model_switch | degraded_mode | human_checkpoint
```

### RecoveryRecipe

| 字段 | 类型 | 必填 |
|------|------|------|
| `id` | `string`（RR-NNN 格式） | 是 |
| `name` | `string` | 是 |
| `match.failure_source` | `FailureSource` | 是 |
| `match.severity` | `string[]`（可选） | 否 |
| `strategy` | `RecoveryStrategy` | 是 |
| `config` | `object`（可选） | 否 |
| `escalation.on_exhaust` | `RecoveryStrategy` | 是 |
| `escalation.message` | `string`（可选） | 否 |

---

## 集成点

### DevAP

- `packages/core/src/types.ts` — `RecoveryRecipe` / `RecoveryStrategy` type
- `packages/core/src/recovery-registry.ts` — Registry 实现与默认 recipe
- `packages/core/src/orchestrator.ts` — fix loop 前查询 Registry

### VibeOps

- `src/types/index.ts` — 独立定义 `RecoveryRecipe`（AGPL 隔离）
- `src/runner/recovery-registry.ts` — 独立实现
- `recovery-recipes.yaml` — 默认 recipe 配置
