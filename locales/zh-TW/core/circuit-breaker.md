---
source: ../../../core/circuit-breaker.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 斷路器標準

> **語言**: [English](../../../core/circuit-breaker.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-15
**適用範圍**: 所有依賴外部 API 或具備重試機制的 Agent 組件
**Scope**: universal
**來源**: XSPEC-036（claude-code-book Ch.2 MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES）

---

## 目的

通用斷路器模式：連續失敗後開路，防止 API 呼叫雪崩。

任何依賴外部 API 或重試機制的 Agent 組件都應使用斷路器保護。實測：引入斷路器前每日浪費約 250K API 呼叫（1279 個 session 各超過 50 次連續失敗）。

---

## 核心規範

- 任何重試機制必須使用斷路器包裝，不得直接無限重試
- 斷路器狀態必須透過遙測可觀測（`circuit_breaker_state_change` 事件）
- OPEN 狀態下的請求必須立即失敗（fail fast），不等待 timeout
- `failureThreshold` 預設值為 3，與 claude-code-book 及 DevAP Fix Loop 一致
- 斷路器必須按照「功能單元」建立，不得全域共享單一斷路器

---

## 三態模型

| 狀態 | 描述 | 轉換條件 |
|------|------|----------|
| **CLOSED**（閉路） | 正常運作，請求正常轉發 | 連續失敗次數 >= `failureThreshold` → OPEN |
| **OPEN**（開路） | 立即拒絕所有請求，回傳 `CircuitOpenError` | 等待 `cooldownMs` 後 → HALF_OPEN |
| **HALF_OPEN**（半開） | 允許一次探針呼叫 | 成功 → CLOSED；失敗 → OPEN |

---

## 介面定義

### CircuitBreaker

| 欄位／方法 | 類型 | 說明 |
|-----------|------|------|
| `name` | `string` | 斷路器識別名稱 |
| `state` | `CLOSED \| HALF_OPEN \| OPEN` | 目前狀態 |
| `execute<T>(fn)` | `async () => Promise<T>` | 受保護的執行入口 |
| `getState()` | `() => CircuitBreakerState` | 查詢目前狀態 |
| `reset()` | `() => void` | 手動重設（管理員用） |

### CircuitBreakerConfig

| 欄位 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `failureThreshold` | `number` | `3` | 連續失敗 N 次後開路 |
| `cooldownMs` | `number` | `30000` | OPEN → HALF_OPEN 等待時間（毫秒） |
| `successThreshold` | `number` | `1` | HALF_OPEN → CLOSED 需要的連續成功次數 |

### CircuitOpenError

| 欄位 | 類型 |
|------|------|
| `code` | `"CIRCUIT_OPEN"` |
| `breakerName` | `string` |
| `state` | `"OPEN"` |
| `cooldownRemainingMs` | `number` |

---

## 遙測事件

**`circuit_breaker_state_change`**（每次狀態轉換時上傳）

| 欄位 | 類型 |
|------|------|
| `breaker_name` | `string` |
| `from_state` | `CLOSED \| HALF_OPEN \| OPEN` |
| `to_state` | `CLOSED \| HALF_OPEN \| OPEN` |
| `failure_count` | `number` |
| `timestamp` | `string` |

---

## 適用場景

- DevAP Fix Loop Agent 呼叫重試
- DevAP Judge / Quality Gate 重試
- DevAP API 呼叫（LLM API 不穩定保護）
- VibeOps Feedback Loop 重試
- VibeOps FLARE 主動檢索重試
- VibeOps AutoCompact（原始靈感來源）

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `CB-001` | `CIRCUIT_OPEN` — 斷路器開路，請求被拒絕 |
| `CB-002` | `PROBE_FAILED` — HALF_OPEN 探針失敗，重新開路 |
| `CB-003` | `INVALID_CONFIG` — `failureThreshold` 必須 >= 1 |
