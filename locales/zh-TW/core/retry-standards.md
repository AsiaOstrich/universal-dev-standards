---
source: ../../../core/retry-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 重試策略標準

> **語言**: [English](../../../core/retry-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-17
**狀態**: Trial（到期 2026-10-17）
**適用範圍**: universal
**來源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

重試策略標準：指數退避加抖動、重試上限、依 failure-source 分類的重試規則。

延伸既有 circuit-breaker 與 failure-source-taxonomy，補齊 retry 層的標準化規則。避免各元件各自實作重試造成行為不一致（無上限重試、無 jitter 導致 thundering herd）。

---

## 核心規範

- 所有重試邏輯必須使用 exponential + jitter，禁止固定間隔或無 jitter 的純指數
- 重試必須有明確上限（`max_attempts`），禁止無限重試
- 重試決策必須先參考 failure-source-taxonomy 分類，fail-fast 類別不得重試
- 重試必須與 circuit-breaker 整合：OPEN 狀態下不得重試，直接 fail-fast
- 每次重試都應透過遙測事件上報（`retry_attempted` / `retry_exhausted`）

---

## 退避公式

**Exponential with full jitter**：

```
wait_ms = min(cap_ms, base_ms * 2^attempt) * (0.5 + random() * 0.5)
```

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `base_ms` | `100` | 基底等待時間 |
| `cap_ms` | `30000` | 等待時間上限 |
| `max_attempts` | `5` | 最大重試次數 |
| `jitter_ratio` | `0.5` | ±50% 抖動 |

**理由**：
- Exponential 隨重試次數指數退避，避免短時間大量請求
- Jitter ±50% 避免 thundering herd（所有 client 同時重試）
- cap_ms=30s 避免超長等待，與典型 request timeout 對齊

---

## 依 failure-source 的重試規則

| 失敗來源 | 可重試 | max_attempts | base_ms | 備註 |
|---------|--------|-------------|---------|------|
| `transient_network` | ✅ | 5 | 100 | 短暫網路抖動，指數退避通常可恢復 |
| `rate_limit` | ✅ | 3 | 1000 | 底數加大預留額度恢復時間；優先採用 Retry-After header |
| `upstream_unavailable` | ✅ | 3 | 500 | 重試前先查 circuit-breaker |
| `tool_failure` | ✅ | 2 | 200 | 工具層失敗通常非 transient，僅給 2 次機會 |
| `prompt_delivery` | ✅ | 2 | 100 | 超過 2 次改走 model_switch |
| `authentication` | ❌ | — | — | fail-fast；憑證錯誤重試不會變對 |
| `validation` | ❌ | — | — | fail-fast；input 錯誤重試結果不變 |
| `policy_violation` | ❌ | — | — | fail-fast；安全決策禁止繞過 |
| `quota_exhausted` | ❌ | — | — | fail-fast；等 budget reset 或升級 tier |

---

## 與 circuit-breaker 整合

| 規則 | 說明 |
|------|------|
| Rule 1 | 每次重試前檢查對應 breaker 的 state；若為 OPEN 立即回傳 `CircuitOpenError`，不消耗 `max_attempts` |
| Rule 2 | 重試全部耗盡（`retry_exhausted`）計入 breaker 的 failure count |
| Rule 3 | HALF_OPEN 狀態下僅允許 1 次探針重試，不套用 `max_attempts` |

---

## 遙測事件

**`retry_attempted`**（每次重試前上傳，第 0 次原始呼叫不算）

| 欄位 | 類型 |
|------|------|
| `operation` | `string` |
| `attempt` | `number` |
| `max_attempts` | `number` |
| `failure_source` | `FailureSource \| null` |
| `wait_ms` | `number` |

**`retry_exhausted`**（達到 max_attempts 仍失敗時上傳）

| 欄位 | 類型 |
|------|------|
| `operation` | `string` |
| `attempts` | `number` |
| `final_failure_source` | `FailureSource` |

---

## 情境範例

**情境 1：指數退避計算**
- 條件：呼叫下游 API 失敗，failure_source=transient_network，已重試 2 次
- 第 3 次重試等待時間：`min(30000, 100 * 2^3) * [0.5..1.0] = 400~800ms`

**情境 2：authentication fail-fast**
- 條件：API 回傳 401，failure_source=authentication
- 結果：立即 fail-fast，不進入退避，不計入 circuit-breaker failure count

**情境 3：circuit OPEN 跳過重試**
- 條件：對應 breaker 為 OPEN，cooldown 剩 15s
- 結果：立即回傳 CircuitOpenError，不消耗 max_attempts

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `RETRY-001` | `RETRY_EXHAUSTED` — 達到 max_attempts 仍失敗 |
| `RETRY-002` | `RETRY_SKIPPED_NON_RETRYABLE` — failure_source 屬 fail-fast 類別 |
| `RETRY-003` | `RETRY_SKIPPED_CIRCUIT_OPEN` — breaker OPEN 狀態下跳過重試 |

---

## 相關標準

- [circuit-breaker.md](circuit-breaker.md) — OPEN 狀態下禁止重試
- [failure-source-taxonomy.md](failure-source-taxonomy.md) — 依 failureSource 決定 retry/fail-fast
- [timeout-standards.md](timeout-standards.md) — 單次重試 timeout 不得超過剩餘 deadline
- [recovery-recipe-registry.md](recovery-recipe-registry.md) — retry 耗盡後交棒給 recovery recipe
