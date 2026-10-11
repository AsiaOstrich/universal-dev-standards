---
source: ../../../core/retry-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7179aacfc3cb
status: current
---

# 重試策略標準

> **語言**: [English](../../../core/retry-standards.md) | 繁體中文

> **來源**: XSPEC-067 | **驅動來源**: DEC-043 Wave 1 Reliability Pack | **狀態**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

重試策略標準 — 延伸既有 `circuit-breaker` 與 `failure-source-taxonomy`，補齊 retry 層的標準化規則。避免各元件各自實作重試造成行為不一致（無上限重試、無 jitter 導致 thundering herd）。與 `failure-source-taxonomy` 深度整合：依失敗類型決定是否重試、重試幾次、退避多久。

## 核心原則

- **指數退避加 full jitter**：所有重試邏輯必須使用 exponential + jitter，禁止固定間隔或無 jitter 的純指數
- **明確重試上限**：必須有 `max_attempts`（預設 5），禁止無限重試
- **依 failureSource 分類**：先查 `failure-source-taxonomy`，fail-fast 類別不得重試
- **與 circuit-breaker 整合**：OPEN 狀態下 fail-fast，不消耗 `max_attempts`；`retry_exhausted` 計入 failure count
- **重試可觀察**：每次重試上報 `retry_attempted` / `retry_exhausted` 遙測事件

## 退避公式

```
wait_ms = min(cap_ms, base_ms * 2^attempt) * (0.5 + random() * 0.5)
```

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `base_ms` | 100 | 基礎退避時間 |
| `cap_ms` | 30000 | 單次最長等待上限 |
| `max_attempts` | 5 | 最多重試次數（不含第 0 次原始呼叫）|
| `jitter_ratio` | 0.5 | Jitter 比例（±50%）|

## 依 failure-source 的重試規則

| 失敗來源 | 可重試？ | Max Attempts | Base ms | 備註 |
|----------|----------|--------------|---------|------|
| `transient_network` | 是 | 5 | 100 | 短暫網路抖動 |
| `rate_limit` | 是 | 3 | 1000 | 依 `Retry-After` 優先 |
| `upstream_unavailable` | 是 | 3 | 500 | 連續失敗觸發 breaker OPEN |
| `tool_failure` | 是 | 2 | 200 | 工具層失敗多半非 transient |
| `prompt_delivery` | 是 | 2 | 100 | 超過改走 model_switch |
| `authentication` | **否** | — | — | Fail-fast，重試不會變對 |
| `validation` | **否** | — | — | Fail-fast，input 錯不改 |
| `policy_violation` | **否** | — | — | Fail-fast，禁止繞過 |
| `quota_exhausted` | **否** | — | — | Fail-fast，等 reset |

## 使用範例

- **情境 1 — 指數退避**：`failure_source=transient_network`，已重試 2 次。第 3 次 wait 範圍 = `min(30000, 100 * 2^3) * [0.5..1.0] = 400~800ms`
- **情境 2 — 401 Fail-fast**：API 回 401 Unauthorized，`failure_source=authentication`。立即 fail-fast，不進退避、不計入 breaker failure count
- **情境 3 — Circuit Open 跳過**：breaker 為 OPEN，發起重試時立即回 `CircuitOpenError`，不消耗 `max_attempts`

## 錯誤碼

- `RETRY-001` — `RETRY_EXHAUSTED`（達到 max_attempts 仍失敗）
- `RETRY-002` — `RETRY_SKIPPED_NON_RETRYABLE`（failureSource 屬 fail-fast 類別）
- `RETRY-003` — `RETRY_SKIPPED_CIRCUIT_OPEN`（breaker OPEN 狀態下跳過）

## 參考資料

- AI 最佳化版本：[ai/standards/retry-standards.ai.yaml](../../../ai/standards/retry-standards.ai.yaml)
- XSPEC-067：DEC-043 Wave 1 Reliability Pack 跨專案規格
- DEC-043：UDS 覆蓋完整性路線圖（驅動來源）
- 相關：`circuit-breaker`、`failure-source-taxonomy`、`timeout-standards`、`recovery-recipe-registry`
- 業界參考：Netflix Hystrix retry、Google SRE Book Ch.22、AWS Architecture Blog — exponential backoff and jitter


**Scope**: universal
