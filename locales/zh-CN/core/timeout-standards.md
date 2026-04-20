---
source: ../../../core/timeout-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Timeout 标准

> **语言**: [English](../../../core/timeout-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

Timeout 标准：层级预算（cascading 0.8×）、deadline propagation、与 circuit-breaker 整合。

避免多层调用链中下层 timeout 大于上层（导致上层先 timeout 而下层仍在执行的资源浪费）。通过 cascading 预算规则（每层 ≤ 0.8× 上层）与 deadline propagation（传 absolute timestamp）让整条调用链都能精准 fail-fast。

---

## 核心规范

- 多层调用的 timeout 必须逐层递减，每下一层 ≤ 0.8 × 上层（预留 20% buffer）
- 跨服务调用必须传递 deadline（absolute timestamp），不得只传 relative duration
- 收到请求后若 `now > deadline`，必须立即 fail-fast，禁止发起下游调用
- Timeout 触发必须计入对应 circuit-breaker 的 failure count
- 禁止下层 timeout 大于上层 timeout（违反 fail-fast，等同没设 timeout）

---

## Cascading 预算规则

**规则**：每下一层 timeout ≤ 0.8 × 上层 timeout

**示例**（Client timeout=10s，调用链 Client → Gateway → Service A → DB）：

| 层级 | timeout |
|------|---------|
| Client | 10,000ms |
| Gateway | 8,000ms（10000 × 0.8） |
| Service A | 6,400ms（8000 × 0.8） |
| DB | 5,120ms（6400 × 0.8） |

**理由**：
- 预留 20% buffer 给序列化、网络传输、重试等开销
- 避免上层先 timeout 而下层仍在执行（资源浪费）
- 0.8 是业界经验值（gRPC / Envoy 常用 0.7~0.85）

---

## Deadline Propagation

| 字段 | 值 |
|------|-----|
| 格式 | absolute ISO-8601 timestamp（非 relative duration） |
| Header 名称 | `X-Deadline` |

**规则**：
1. 发起调用前计算 `deadline = now + timeout`，写入 header
2. 收到请求后立即检查 `now > deadline_header` → 若是则 fail-fast（回 `DEADLINE_EXCEEDED`）
3. 向下游调用时 `timeout = min(cascading_budget, deadline - now)`，取两者较小

**理由**：Relative duration（如 timeout=5s）无法在多层调用中累积扣除；absolute timestamp 让每一层都能精准计算剩余时间。

---

## Timeout 类型

| 类型 | 默认值 | 说明 |
|------|--------|------|
| `connect_timeout` | 5,000ms | 建立 TCP / TLS 连接的时间上限 |
| `request_timeout` | 30,000ms | 发送请求到收到完整响应的时间上限；受 cascading 预算约束 |
| `idle_timeout` | 60,000ms | 连接闲置多久后关闭；server 端设置 |
| `total_deadline` | 60,000ms | 含所有重试在内的整体上限；retry × attempt_timeout 总和不得超过此值 |

---

## 与 circuit-breaker 整合

| 规则 | 说明 |
|------|------|
| Rule 1 | 每次 timeout 触发视为一次失败，计入 breaker 的 failure count |
| Rule 2 | 连续 timeout 达 failureThreshold 时 breaker 进入 OPEN |
| Rule 3 | OPEN 状态下的请求应套用极短 timeout（或直接 fail-fast） |

---

## 情境示例

**情境 1：cascading 预算验证**
- Client timeout=10s，各层依序 8s → 6.4s → 5.12s

**情境 2：deadline 已过期 fail-fast**
- 条件：请求抵达 Service A 时 X-Deadline 已过期
- 结果：立即回 DEADLINE_EXCEEDED，不调用 DB

**情境 3：timeout 触发 circuit breaker**
- 条件：连续 3 次下游调用皆 timeout（failureThreshold=3）
- 结果：circuit-breaker 进入 OPEN，第 4 次立即回 CircuitOpenError

---

## 错误码

| 代码 | 说明 |
|------|------|
| `TIMEOUT-001` | `REQUEST_TIMEOUT` — 单次请求超时 |
| `TIMEOUT-002` | `DEADLINE_EXCEEDED` — 整体 deadline 已过，拒绝发起/处理请求 |
| `TIMEOUT-003` | `CASCADING_BUDGET_VIOLATION` — 下层 timeout > 上层 timeout（配置错误）|
