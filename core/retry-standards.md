# Retry Standards

> **Source**: XSPEC-067 | **Driven by**: DEC-043 Wave 1 Reliability Pack | **Status**: Trial (2026-04-17 ~ 2026-10-17)

## Overview

重試策略標準 — 延伸既有 `circuit-breaker` 與 `failure-source-taxonomy`，補齊 retry 層的標準化規則。避免各元件各自實作重試造成行為不一致（無上限重試、無 jitter 導致 thundering herd）。與 `failure-source-taxonomy` 深度整合：依失敗類型決定是否重試、重試幾次、退避多久。

## Key Principles

- **指數退避加 full jitter**：所有重試邏輯必須使用 exponential + jitter，禁止固定間隔或無 jitter 的純指數
- **明確重試上限**：必須有 `max_attempts`（預設 5），禁止無限重試
- **依 failureSource 分類**：先查 `failure-source-taxonomy`，fail-fast 類別不得重試
- **與 circuit-breaker 整合**：OPEN 狀態下 fail-fast，不消耗 `max_attempts`；`retry_exhausted` 計入 failure count
- **重試可觀察**：每次重試上報 `retry_attempted` / `retry_exhausted` 遙測事件

## Backoff Formula

```
wait_ms = min(cap_ms, base_ms * 2^attempt) * (0.5 + random() * 0.5)
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `base_ms` | 100 | 基礎退避時間 |
| `cap_ms` | 30000 | 單次最長等待上限 |
| `max_attempts` | 5 | 最多重試次數（不含第 0 次原始呼叫）|
| `jitter_ratio` | 0.5 | Jitter 比例（±50%）|

## Failure Source Retry Rules

| Failure Source | Retry? | Max Attempts | Base ms | Note |
|----------------|--------|--------------|---------|------|
| `transient_network` | Yes | 5 | 100 | 短暫網路抖動 |
| `rate_limit` | Yes | 3 | 1000 | 依 `Retry-After` 優先 |
| `upstream_unavailable` | Yes | 3 | 500 | 連續失敗觸發 breaker OPEN |
| `tool_failure` | Yes | 2 | 200 | 工具層失敗多半非 transient |
| `prompt_delivery` | Yes | 2 | 100 | 超過改走 model_switch |
| `authentication` | **No** | — | — | Fail-fast，重試不會變對 |
| `validation` | **No** | — | — | Fail-fast，input 錯不改 |
| `policy_violation` | **No** | — | — | Fail-fast，禁止繞過 |
| `quota_exhausted` | **No** | — | — | Fail-fast，等 reset |

## Usage Examples

- **Scenario 1 — 指數退避**：`failure_source=transient_network`，已重試 2 次。第 3 次 wait 範圍 = `min(30000, 100 * 2^3) * [0.5..1.0] = 400~800ms`
- **Scenario 2 — 401 Fail-fast**：API 回 401 Unauthorized，`failure_source=authentication`。立即 fail-fast，不進退避、不計入 breaker failure count
- **Scenario 3 — Circuit Open 跳過**：breaker 為 OPEN，發起重試時立即回 `CircuitOpenError`，不消耗 `max_attempts`

## Error Codes

- `RETRY-001` — `RETRY_EXHAUSTED`（達到 max_attempts 仍失敗）
- `RETRY-002` — `RETRY_SKIPPED_NON_RETRYABLE`（failureSource 屬 fail-fast 類別）
- `RETRY-003` — `RETRY_SKIPPED_CIRCUIT_OPEN`（breaker OPEN 狀態下跳過）

## References

- AI-optimized: [ai/standards/retry-standards.ai.yaml](../ai/standards/retry-standards.ai.yaml)
- XSPEC-067: DEC-043 Wave 1 Reliability Pack 跨專案規格
- DEC-043: UDS 覆蓋完整性路線圖（驅動來源）
- Related: `circuit-breaker`, `failure-source-taxonomy`, `timeout-standards`, `recovery-recipe-registry`
- Industry: Netflix Hystrix retry, Google SRE Book Ch.22, AWS Architecture Blog — exponential backoff and jitter
