---
source: ../../../core/timeout-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: df4f00d1e5e2
status: current
---

# Timeout 標準

> **語言**: [English](../../../core/timeout-standards.md) | 繁體中文

> **來源**: XSPEC-067 | **驅動來源**: DEC-043 Wave 1 可靠性套件 | **狀態**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

Timeout 標準 — 避免多層呼叫鏈中下層 timeout 大於上層（導致上層先 timeout 而下層仍在執行的資源浪費）。透過 cascading 預算規則（每層 ≤ 0.8× 上層）與 deadline propagation（傳 absolute timestamp）讓整條呼叫鏈精準 fail-fast。與 `circuit-breaker` 整合，timeout 計入 failure count。

## 核心原則

- **Cascading 預算**：多層呼叫的 timeout 必須逐層遞減，每下一層 ≤ `0.8 × 上層`（預留 20% buffer）
- **Deadline Propagation**：跨服務呼叫必須傳遞 deadline（absolute timestamp），不得只傳 relative duration
- **Fail-fast on Expired**：收到請求後若 `now > deadline`，立即 fail-fast，禁止發起下游呼叫
- **Breaker 整合**：timeout 觸發計入對應 circuit-breaker 的 failure count
- **禁止倒置**：下層 timeout 大於上層 timeout 等同沒設 timeout，配置違規

## Cascading 預算範例

```
Client timeout         = 10000 ms
Gateway timeout        =  8000 ms   (10000 × 0.8)
Service A timeout      =  6400 ms   (8000  × 0.8)
Downstream DB timeout  =  5120 ms   (6400  × 0.8)
```

0.8 為業界經驗值（gRPC / Envoy 常用 0.7~0.85），預留 20% buffer 給序列化、網路傳輸、重試開銷。

## Deadline Propagation

- Header：`X-Deadline`
- 格式：absolute ISO-8601 timestamp（不是 relative duration）
- 發起呼叫前：`deadline = now + timeout`，寫入 header
- 收到請求後：立即檢查 `now > deadline_header`，若是則回 `DEADLINE_EXCEEDED`
- 向下游呼叫：`timeout = min(cascading_budget, deadline - now)`

## Timeout 類型

| 類型 | 預設值（ms） | 用途 |
|------|--------------|------|
| `connect_timeout` | 5000 | 建立 TCP / TLS 連線 |
| `request_timeout` | 30000 | 發送請求到收到完整回應 |
| `idle_timeout` | 60000 | 連線閒置多久後關閉 |
| `total_deadline` | 60000 | 含所有重試的整體上限 |

## 使用範例

- **情境 1 — Cascading 預算**：Client 10s → Gateway 8s → Service A 6.4s → DB 5.12s，確保下層先 timeout，上層有機會 fallback
- **情境 2 — Deadline 過期**：請求抵達 Service A 時 `X-Deadline` 已過期，立即回 `DEADLINE_EXCEEDED`，不呼叫 DB
- **情境 3 — Timeout 觸發 breaker**：連續 3 次下游呼叫皆 timeout（failureThreshold=3），第 4 次 breaker 進入 OPEN

## 錯誤碼

- `TIMEOUT-001` — `REQUEST_TIMEOUT`（單次請求超時）
- `TIMEOUT-002` — `DEADLINE_EXCEEDED`（整體 deadline 已過）
- `TIMEOUT-003` — `CASCADING_BUDGET_VIOLATION`（下層 > 上層，配置錯誤）

## 參考資料

- AI 最佳化版本：[ai/standards/timeout-standards.ai.yaml](../../../ai/standards/timeout-standards.ai.yaml)
- XSPEC-067：DEC-043 Wave 1 可靠性套件跨專案規格
- DEC-043：UDS 覆蓋完整性路線圖（驅動來源）
- 相關：`circuit-breaker`、`retry-standards`、`failure-source-taxonomy`
- 業界參考：gRPC deadline propagation、Envoy timeout budgeting、Google SRE Book Ch.22


**Scope**: universal
