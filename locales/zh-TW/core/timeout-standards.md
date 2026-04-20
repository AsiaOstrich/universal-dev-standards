---
source: ../../../core/timeout-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Timeout 標準

> **語言**: [English](../../../core/timeout-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-17
**狀態**: Trial（到期 2026-10-17）
**適用範圍**: universal
**來源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

Timeout 標準：層級預算（cascading 0.8×）、deadline propagation、與 circuit-breaker 整合。

避免多層呼叫鏈中下層 timeout 大於上層（導致上層先 timeout 而下層仍在執行的資源浪費）。透過 cascading 預算規則（每層 ≤ 0.8× 上層）與 deadline propagation（傳 absolute timestamp）讓整條呼叫鏈都能精準 fail-fast。

---

## 核心規範

- 多層呼叫的 timeout 必須逐層遞減，每下一層 ≤ 0.8 × 上層（預留 20% buffer）
- 跨服務呼叫必須傳遞 deadline（absolute timestamp），不得只傳 relative duration
- 收到請求後若 `now > deadline`，必須立即 fail-fast，禁止發起下游呼叫
- Timeout 觸發必須計入對應 circuit-breaker 的 failure count
- 禁止下層 timeout 大於上層 timeout（違反 fail-fast，等同沒設 timeout）

---

## Cascading 預算規則

**規則**：每下一層 timeout ≤ 0.8 × 上層 timeout

**範例**（Client timeout=10s，呼叫鏈 Client → Gateway → Service A → DB）：

| 層級 | timeout |
|------|---------|
| Client | 10,000ms |
| Gateway | 8,000ms（10000 × 0.8） |
| Service A | 6,400ms（8000 × 0.8） |
| DB | 5,120ms（6400 × 0.8） |

**理由**：
- 預留 20% buffer 給序列化、網路傳輸、重試等開銷
- 避免上層先 timeout 而下層仍在執行（資源浪費）
- 0.8 是業界經驗值（gRPC / Envoy 常用 0.7~0.85）

---

## Deadline Propagation

| 欄位 | 值 |
|------|-----|
| 格式 | absolute ISO-8601 timestamp（非 relative duration） |
| Header 名稱 | `X-Deadline` |

**規則**：
1. 發起呼叫前計算 `deadline = now + timeout`，寫入 header
2. 收到請求後立即檢查 `now > deadline_header` → 若是則 fail-fast（回 `DEADLINE_EXCEEDED`）
3. 向下游呼叫時 `timeout = min(cascading_budget, deadline - now)`，取兩者較小

**理由**：Relative duration（如 timeout=5s）無法在多層呼叫中累積扣除；absolute timestamp 讓每一層都能精準計算剩餘時間。

---

## Timeout 類型

| 類型 | 預設值 | 說明 |
|------|--------|------|
| `connect_timeout` | 5,000ms | 建立 TCP / TLS 連線的時間上限 |
| `request_timeout` | 30,000ms | 發送請求到收到完整回應的時間上限；受 cascading 預算約束 |
| `idle_timeout` | 60,000ms | 連線閒置多久後關閉；server 端設定 |
| `total_deadline` | 60,000ms | 含所有重試在內的整體上限；retry × attempt_timeout 總和不得超過此值 |

---

## 與 circuit-breaker 整合

| 規則 | 說明 |
|------|------|
| Rule 1 | 每次 timeout 觸發視為一次失敗，計入 breaker 的 failure count |
| Rule 2 | 連續 timeout 達 failureThreshold 時 breaker 進入 OPEN |
| Rule 3 | OPEN 狀態下的請求應套用極短 timeout（或直接 fail-fast） |

---

## 情境範例

**情境 1：cascading 預算驗證**
- Client timeout=10s，各層依序 8s → 6.4s → 5.12s

**情境 2：deadline 已過期 fail-fast**
- 條件：請求抵達 Service A 時 X-Deadline 已過期
- 結果：立即回 DEADLINE_EXCEEDED，不呼叫 DB

**情境 3：timeout 觸發 circuit breaker**
- 條件：連續 3 次下游呼叫皆 timeout（failureThreshold=3）
- 結果：circuit-breaker 進入 OPEN，第 4 次立即回 CircuitOpenError

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `TIMEOUT-001` | `REQUEST_TIMEOUT` — 單次請求超時 |
| `TIMEOUT-002` | `DEADLINE_EXCEEDED` — 整體 deadline 已過，拒絕發起／處理請求 |
| `TIMEOUT-003` | `CASCADING_BUDGET_VIOLATION` — 下層 timeout > 上層 timeout（配置錯誤） |
