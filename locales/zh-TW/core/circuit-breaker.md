---
source: ../../../core/circuit-breaker.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5e7ea0ed4762
status: current
---

# 斷路器標準

> **語言**: [English](../../../core/circuit-breaker.md) | 繁體中文

> **來源**: XSPEC-036 | **借鑑自**: claude-code-book Ch.2

## 概述

斷路器模式保護 Agent 系統，避免因重複失敗而引發 API 雪崩。連續 `failureThreshold` 次失敗後，斷路器開啟並立即拒絕所有請求——不必等待逾時。冷卻期過後，允許一次探測呼叫以測試是否恢復。

實際數據：在引入斷路器之前，claude-code-book 量測到每天約 25 萬次 API 呼叫被浪費，涉及 1,279 個各自連續失敗超過 50 次的工作階段（最多：連續失敗 3,272 次）。

## 狀態

```
CLOSED ──(N consecutive failures)──→ OPEN
OPEN   ──(cooldownMs elapsed)──→ HALF_OPEN
HALF_OPEN ──(probe success)──→ CLOSED
HALF_OPEN ──(probe failure)──→ OPEN
```

| 狀態 | 行為 |
|------|------|
| **CLOSED** | 正常運作，請求照常轉送 |
| **OPEN** | 所有請求立即以 `CircuitOpenError` 拒絕 |
| **HALF_OPEN** | 允許一次探測請求；成功 → CLOSED，失敗 → OPEN |

## 設定

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `failureThreshold` | 3 | 開啟前的連續失敗次數 |
| `cooldownMs` | 30000 | OPEN → HALF_OPEN 的等待時間（毫秒） |
| `successThreshold` | 1 | 關閉所需的探測成功次數 |

## 介面

```typescript
interface CircuitBreaker {
  readonly name: string;
  readonly state: "CLOSED" | "HALF_OPEN" | "OPEN";
  execute<T>(fn: () => Promise<T>): Promise<T>; // throws CircuitOpenError when OPEN
  getState(): CircuitBreakerState;
  reset(): void; // admin manual reset
}
```

## 適用場景

- Fix Loop（採用層）重試
- LLM API 呼叫保護（採用層）
- Feedback Loop（採用層）重試
- FLARE 主動檢索（採用層）的檢索重試
- 任何對外部依賴使用重試的組件

## 參考資料

- AI 最佳化版本：[ai/standards/circuit-breaker.ai.yaml](../../../ai/standards/circuit-breaker.ai.yaml)
- XSPEC-036：跨專案規格
- 借鑑自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.2 `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`


**Scope**: universal
