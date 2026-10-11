---
source: ../../../core/timeout-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: df4f00d1e5e2
status: current
---

# Timeout 标准

> **语言**: [English](../../../core/timeout-standards.md) | 简体中文

> **来源**: XSPEC-067 | **驱动来源**: DEC-043 Wave 1 可靠性套件 | **状态**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

Timeout 标准——避免多层调用链中下层 timeout 大于上层（导致上层先 timeout 而下层仍在执行的资源浪费）。通过 cascading 预算规则（每层 ≤ 0.8× 上层）与 deadline propagation（传递 absolute timestamp）让整条调用链精准 fail-fast。与 `circuit-breaker` 整合，timeout 计入 failure count。

## 核心原则

- **Cascading 预算**：多层调用的 timeout 必须逐层递减，每下一层 ≤ `0.8 × 上层`（预留 20% buffer）
- **Deadline Propagation**：跨服务调用必须传递 deadline（absolute timestamp），不得只传 relative duration
- **Fail-fast on Expired**：收到请求后若 `now > deadline`，立即 fail-fast，禁止发起下游调用
- **Breaker 整合**：timeout 触发计入对应 circuit-breaker 的 failure count
- **禁止倒置**：下层 timeout 大于上层 timeout 等同没设 timeout，属于配置违规

## Cascading 预算示例

```
Client timeout         = 10000 ms
Gateway timeout        =  8000 ms   (10000 × 0.8)
Service A timeout      =  6400 ms   (8000  × 0.8)
Downstream DB timeout  =  5120 ms   (6400  × 0.8)
```

0.8 为业界经验值（gRPC / Envoy 常用 0.7~0.85），预留 20% buffer 给序列化、网络传输、重试开销。

## Deadline Propagation

- Header：`X-Deadline`
- 格式：absolute ISO-8601 timestamp（不是 relative duration）
- 发起调用前：`deadline = now + timeout`，写入 header
- 收到请求后：立即检查 `now > deadline_header`，若是则回 `DEADLINE_EXCEEDED`
- 向下游调用：`timeout = min(cascading_budget, deadline - now)`

## Timeout 类型

| 类型 | 默认值 ms | 用途 |
|----------|------------|---------|
| `connect_timeout` | 5000 | 建立 TCP / TLS 连接 |
| `request_timeout` | 30000 | 发送请求到收到完整响应 |
| `idle_timeout` | 60000 | 连接闲置多久后关闭 |
| `total_deadline` | 60000 | 含所有重试的整体上限 |

## 使用示例

- **情境 1 — Cascading 预算**：Client 10s → Gateway 8s → Service A 6.4s → DB 5.12s，确保下层先 timeout，上层有机会 fallback
- **情境 2 — Deadline 过期**：请求抵达 Service A 时 `X-Deadline` 已过期，立即回 `DEADLINE_EXCEEDED`，不调用 DB
- **情境 3 — Timeout 触发 breaker**：连续 3 次下游调用皆 timeout（failureThreshold=3），第 4 次 breaker 进入 OPEN

## 错误码

- `TIMEOUT-001` — `REQUEST_TIMEOUT`（单次请求超时）
- `TIMEOUT-002` — `DEADLINE_EXCEEDED`（整体 deadline 已过）
- `TIMEOUT-003` — `CASCADING_BUDGET_VIOLATION`（下层 > 上层，配置错误）

## 参考资料

- AI 优化版：[ai/standards/timeout-standards.ai.yaml](../../../ai/standards/timeout-standards.ai.yaml)
- XSPEC-067：DEC-043 Wave 1 可靠性套件跨项目规格
- DEC-043：UDS 覆盖完整性路线图（驱动来源）
- 相关：`circuit-breaker`、`retry-standards`、`failure-source-taxonomy`
- 业界参考：gRPC deadline propagation、Envoy timeout budgeting、Google SRE Book Ch.22


**适用范围**: universal
