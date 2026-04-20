---
source: ../../../core/failure-source-taxonomy.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 失败来源分类法

> **语言**: [English](../../../core/failure-source-taxonomy.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-045（DEC-035 Recovery Recipe Registry）

---

## 目的

失败来源分类法：8 类 `failureSource`，补充 `TaskStatus` 的 why 维度。

`TaskStatus`（succeeded/failed/partial）只描述「是什么」，不描述「为什么失败」。本分类法定义 8 类失败来源，让 Recovery Recipe Registry（XSPEC-046）可以根据 `failureSource` 精准选择恢复策略，而不是对所有失败套用同一个回退逻辑。

---

## 核心规范

- 所有失败事件必须附带 `failureSource`（8 类之一）
- `failureSource` 决定是否可重试（见下表）
- Recovery Recipe 以 `failureSource` 为匹配键
- 无法分类的失败标记为 `unknown`，触发人工检查点
- 单次失败事件只能有一个 `failureSource`（不可多选）

---

## 8 类失败来源

| failureSource | 可重试 | 说明 |
|---------------|--------|------|
| `transient_network` | ✅ | 短暂网络抖动，如 TCP 超时、DNS 解析失败 |
| `rate_limit` | ✅ | 速率限制，如 429 Too Many Requests |
| `upstream_unavailable` | ✅ | 上游服务不可达，断路器可处理 |
| `tool_failure` | ✅ | 工具层失败，如 CLI 工具崩溃 |
| `prompt_delivery` | ✅ | 提示词传递失败，可切换模型重试 |
| `authentication` | ❌ | 凭证错误，重试不会变对 |
| `validation` | ❌ | 输入验证失败，重试结果不变 |
| `policy_violation` | ❌ | 安全策略拒绝，禁止绕过 |
| `quota_exhausted` | ❌ | 配额耗尽，等待刷新 |
| `model_degradation` | ✅ | 模型质量降级，可切换备用模型 |
| `resource_exhaustion` | ❌ | 资源耗尽（内存/磁盘），需人工介入 |
| `branch_divergence` | ✅ | 分支漂移，可 rebase 重试 |
| `compilation` | ✅ | 编译错误，Fix Loop 可处理 |
| `test_failure` | ✅ | 测试失败，Fix Loop 可处理 |
| `unknown` | ❌ | 未能分类，触发人工检查点 |

---

## 与 Recovery Recipe 的对应

| failureSource | 推荐 Recovery Strategy |
|---------------|----------------------|
| `compilation` | `fix_loop` |
| `test_failure` | `fix_loop` |
| `model_degradation` | `model_switch` |
| `branch_divergence` | `rebase_and_retry` |
| `resource_exhaustion` | `degraded_mode` |
| `policy_violation` | `human_checkpoint` |
| `authentication` | `human_checkpoint` |
| `transient_network` | `circuit_breaker` + retry |
| `tool_failure` | `circuit_breaker` |
| `prompt_delivery` | `model_switch` |
| `unknown` | `human_checkpoint` |

---

## 遥测事件

**`failure_classified`**（每次失败分类时上报）

| 字段 | 类型 |
|------|------|
| `taskId` | `string` |
| `failureSource` | `FailureSource` |
| `isRetryable` | `boolean` |
| `originalError` | `string` |
| `timestamp` | `string` |

---

## 错误码

| 代码 | 说明 |
|------|------|
| `FST-001` | `UNCLASSIFIED_FAILURE` — 失败来源无法分类，标记为 unknown |
| `FST-002` | `INVALID_FAILURE_SOURCE` — failureSource 不在 8 类定义内 |
| `FST-003` | `MULTIPLE_SOURCES` — 单次失败标记了多个 failureSource（违规）|
