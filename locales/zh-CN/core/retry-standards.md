---
source: ../../../core/retry-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 重试策略标准

> **语言**: [English](../../../core/retry-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

重试策略标准：指数退避加抖动、重试上限、依 failure-source 分类的重试规则。

延伸既有 circuit-breaker 与 failure-source-taxonomy，补齐 retry 层的标准化规则。避免各组件各自实现重试造成行为不一致（无上限重试、无 jitter 导致 thundering herd）。

---

## 核心规范

- 所有重试逻辑必须使用 exponential + jitter，禁止固定间隔或无 jitter 的纯指数
- 重试必须有明确上限（`max_attempts`），禁止无限重试
- 重试决策必须先参考 failure-source-taxonomy 分类，fail-fast 类别不得重试
- 重试必须与 circuit-breaker 整合：OPEN 状态下不得重试，直接 fail-fast
- 每次重试都应通过遥测事件上报（`retry_attempted` / `retry_exhausted`）

---

## 退避公式

**Exponential with full jitter**：

```
wait_ms = min(cap_ms, base_ms * 2^attempt) * (0.5 + random() * 0.5)
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `base_ms` | `100` | 基础等待时间 |
| `cap_ms` | `30000` | 等待时间上限 |
| `max_attempts` | `5` | 最大重试次数 |
| `jitter_ratio` | `0.5` | ±50% 抖动 |

**理由**：
- Exponential 随重试次数指数退避，避免短时间大量请求
- Jitter ±50% 避免 thundering herd（所有 client 同时重试）
- cap_ms=30s 避免超长等待，与典型 request timeout 对齐

---

## 依 failure-source 的重试规则

| 失败来源 | 可重试 | max_attempts | base_ms | 备注 |
|---------|--------|-------------|---------|------|
| `transient_network` | ✅ | 5 | 100 | 短暂网络抖动，指数退避通常可恢复 |
| `rate_limit` | ✅ | 3 | 1000 | 底数加大预留额度恢复时间；优先采用 Retry-After header |
| `upstream_unavailable` | ✅ | 3 | 500 | 重试前先查 circuit-breaker |
| `tool_failure` | ✅ | 2 | 200 | 工具层失败通常非 transient，仅给 2 次机会 |
| `prompt_delivery` | ✅ | 2 | 100 | 超过 2 次改走 model_switch |
| `authentication` | ❌ | — | — | fail-fast；凭证错误重试不会变对 |
| `validation` | ❌ | — | — | fail-fast；input 错误重试结果不变 |
| `policy_violation` | ❌ | — | — | fail-fast；安全决策禁止绕过 |
| `quota_exhausted` | ❌ | — | — | fail-fast；等 budget reset 或升级 tier |

---

## 与 circuit-breaker 整合

| 规则 | 说明 |
|------|------|
| Rule 1 | 每次重试前检查对应 breaker 的 state；若为 OPEN 立即回传 `CircuitOpenError`，不消耗 `max_attempts` |
| Rule 2 | 重试全部耗尽（`retry_exhausted`）计入 breaker 的 failure count |
| Rule 3 | HALF_OPEN 状态下仅允许 1 次探针重试，不套用 `max_attempts` |

---

## 遥测事件

**`retry_attempted`**（每次重试前上传，第 0 次原始调用不算）

| 字段 | 类型 |
|------|------|
| `operation` | `string` |
| `attempt` | `number` |
| `max_attempts` | `number` |
| `failure_source` | `FailureSource \| null` |
| `wait_ms` | `number` |

**`retry_exhausted`**（达到 max_attempts 仍失败时上传）

| 字段 | 类型 |
|------|------|
| `operation` | `string` |
| `attempts` | `number` |
| `final_failure_source` | `FailureSource` |

---

## 情境示例

**情境 1：指数退避计算**
- 条件：调用下游 API 失败，failure_source=transient_network，已重试 2 次
- 第 3 次重试等待时间：`min(30000, 100 * 2^3) * [0.5..1.0] = 400~800ms`

**情境 2：authentication fail-fast**
- 条件：API 回传 401，failure_source=authentication
- 结果：立即 fail-fast，不进入退避，不计入 circuit-breaker failure count

**情境 3：circuit OPEN 跳过重试**
- 条件：对应 breaker 为 OPEN，cooldown 剩 15s
- 结果：立即回传 CircuitOpenError，不消耗 max_attempts

---

## 错误码

| 代码 | 说明 |
|------|------|
| `RETRY-001` | `RETRY_EXHAUSTED` — 达到 max_attempts 仍失败 |
| `RETRY-002` | `RETRY_SKIPPED_NON_RETRYABLE` — failure_source 属 fail-fast 类别 |
| `RETRY-003` | `RETRY_SKIPPED_CIRCUIT_OPEN` — breaker OPEN 状态下跳过重试 |
