---
source: ../../../core/behavior-snapshot.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 7b2146e4fd6c
status: current
---

# 行為快照標準

> **語言**: [English](../../../core/behavior-snapshot.md) | 繁體中文 | [简体中文](../../zh-CN/core/behavior-snapshot.md)

**適用範圍**：需要行為一致性驗證的遷移與重構專案
**Scope**: universal

---

## 概述

行為快照標準定義了一種黃金檔案格式，用於記錄現有系統的 HTTP 請求/回應配對。這些快照有兩個用途：

1. **遷移一致性基準線** — 驗證新系統能重現與舊系統相同的行為
2. **重構特性化** — 在修改程式碼前鎖定現有行為（Gate 0 協議）

## 參考資料

| 標準/來源 | 內容 |
|----------------|---------|
| XSPEC-201 | 重構/遷移完整性協議 |
| Michael Feathers: *Working Effectively with Legacy Code* | 特性化測試概念 |
| Golden Master Testing | 記錄並重放預期輸出的模式 |

---

## 快照檔案格式

### 位置

```
.snapshots/<feature-id>/<scenario>.json
```

### Schema

```json
{
  "feature_id": "FM-007",
  "scenario": "happy_path",
  "request": {
    "method": "POST",
    "path": "/api/orders/123/cancel",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "reason": "customer_request"
    }
  },
  "response": {
    "status": 200,
    "body": {
      "success": true,
      "order_status": "cancelled",
      "refund_initiated": true
    }
  },
  "ignore_fields": ["refund_id", "cancelled_at"]
}
```

### 欄位參考

| 欄位 | 必填 | 說明 |
|-------|----------|-------------|
| `feature_id` | 是 | feature-manifest.yaml 中的 `FM-NNN` |
| `scenario` | 是 | `snake_case` 情境名稱（`happy_path`、`not_found` 等） |
| `request.method` | 是 | HTTP 方法 |
| `request.path` | 是 | 不含 base URL 的 URL 路徑 |
| `request.headers` | 否 | 請求所需的標頭（不含真實認證 token） |
| `request.body` | 否 | 請求主體（JSON） |
| `response.status` | 是 | 預期的 HTTP 狀態碼 |
| `response.body` | 是 | 預期的回應主體（比較用欄位） |
| `ignore_fields` | 否 | 比較時略過的欄位（詳見下方指南） |

---

## 目錄結構

```
.snapshots/
  FM-001-UserLogin/
    happy_path.json
    invalid_credentials.json
    account_locked.json
  FM-007-OrderCancellation/
    happy_path.json
    order_not_found.json
    order_already_cancelled.json
    MANUAL-refund_webhook.json     ← 手動撰寫
```

### MANUAL- 前綴

以 `MANUAL-` 為前綴的檔案包含無法自動錄製的快照：
- 由第三方觸發的 Webhook 端點
- 需要特定、難以重現的資料庫狀態的情境
- 背景工作 / 佇列觸發流程（非 HTTP 入口點）

`MANUAL-` 檔案不納入自動重放，但計入覆蓋率報告。

---

## `ignore_fields` 使用指南

### 一律忽略（非確定性）

| 欄位模式 | 原因 |
|--------------|--------|
| `created_at`、`updated_at`、`timestamp` | 每次請求都會改變 |
| `token`、`session_id`、`csrf_token` | 密碼學隨機值 |
| `request_id`、`trace_id`、`correlation_id` | 隨機 UUID |

### 一律比較（業務邏輯）

| 欄位模式 | 原因 |
|--------------|--------|
| `status`、`code`、`message`、`error_code` | 核心業務結果 |
| `order_status`、`payment_status` | 狀態機結果 |
| `amount`、`quantity`、`price` | 計算後的業務數值 |
| `success`、`refunded`、`cancelled` | 布林業務結果 |
| `user_id`、`order_id`（搭配固定測試資料） | 參照完整性 |

**規則**：`ignore_fields` 僅用於確實不確定性的值。用它來隱藏業務邏輯差異，會使一致性測試失去意義。

---

## 一致性檢查工具

執行 `scripts/parity-check.ts` 對目標系統重放所有快照：

```bash
npx tsx scripts/parity-check.ts --url http://new-system:8080 [--snapshots .snapshots] [--env uat|staging]
```

### 輸出範例

```
🔄 Parity Check — 119 snapshots against http://new-system:8080

  ✅ FM-001 / happy_path
  ✅ FM-001 / invalid_credentials
  ❌ [PARITY-FAIL] FM-007 / happy_path
      body.order_status: expected "cancelled", got "pending"
      body.refund_initiated: expected true, got false

─────────────────────────────────
Parity Results: 118/119 passed (99.2%)

❌ 1 parity check(s) failed.
[PARITY-BLOCK] UAT/production deployment blocked. Fix parity failures first.
```

### 結束碼

| 代碼 | 意義 |
|------|---------|
| 0 | 所有快照通過 |
| 1 | 發現失敗 + `--env uat` 或 `production` → 部署被阻擋 |
| 2 | 發現失敗 + `--env staging` → 僅警告 |

---

## Gate 0：特性化測試協議（重構）

在開始任何重構之前，特性化測試必須存在且通過。

### 什麼是特性化測試？

特性化測試記錄現有程式碼*實際的行為*——而非它*應有的行為*。它們在修改開始前鎖定可觀察的行為。若重構期間特性化測試失敗，代表行為發生了非預期的變更。

```typescript
describe('characterization: OrderService.cancelOrder', () => {
  // @characterization
  it('returns status cancelled and sets refund_initiated=true for valid order', async () => {
    const result = await orderService.cancelOrder('test-order-123', 'customer_request');
    expect(result.order_status).toBe('cancelled');
    expect(result.refund_initiated).toBe(true);
  });
});
```

### Gate 0 強制執行

1. **第一次重構 commit 前**：執行 `npm test -- --grep characterization`
   - 任何失敗 → 停止。先修復現有程式碼，再進行修改。
2. **重構期間**：每次 commit 重新執行特性化測試
   - 任何失敗 → 立即警告行為偏移
3. **Gate 2（完成）**：所有特性化測試通過 → 重構完成

### 反模式警告

> 絕不要在沒有 Gate 0 的情況下開始重構。一旦開始修改程式碼，就無法判斷測試失敗究竟是「我破壞了某些東西」還是「測試對舊行為的描述有誤」。

---

## 與遷移 Pipeline 整合

### Gate 1 預飛行（`--variant migration`）

在執行 `/vo-pipeline --variant migration` 之前：
1. `artifacts/feature-manifest.yaml` 必須存在
2. `.snapshots/` 必須包含每個功能至少一個快照

### 一致性閘門（UAT 前）

所有功能實作完成後，執行一致性檢查：
- 要求 100% 通過率（不含 `MANUAL-` 檔案）
- 任何失敗皆阻擋 UAT 晉升

---

## 反模式

| 反模式 | 影響 | 正確做法 |
|--------------|--------|------------------|
| 過度使用 `ignore_fields` | 隱藏業務邏輯差異 | 僅忽略非確定性欄位 |
| 跳過 MANUAL 快照 | Webhook/背景行為未測試 | UAT 前先撰寫 MANUAL 快照 |
| 從損壞的系統錄製快照 | 基準線錯誤 | 錄製前先驗證舊系統行為 |
| 特性化測試缺少 `@characterization` | Gate 0 找不到它們 | 一律加上 `@characterization` 標記 |
| 未進行 Gate 0 就開始重構 | 無法偵測行為偏移 | 先跑特性化測試，始終如此 |

---

## 相關標準

- [功能清單標準](../../../core/feature-manifest-standard.md) — 功能清單中 FM-NNN 的 schema
- [驗收條件追蹤](../../../core/acceptance-criteria-traceability.md) — `not_implemented` AC 狀態
- [重構標準](../../../core/refactoring-standards.md) — 特性化測試需求
- [測試標準](../../../core/testing-standards.md) — 測試實作標準

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本 — 快照 schema、一致性閘門、Gate 0 特性化協議（XSPEC-201） |
