---
source: ../../../core/behavior-snapshot.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-16
source_hash: bd53c2d8c8c0
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

> **核心原則 —— 忽略「值」，保留「格式」斷言。** 某欄位是非確定性的，意指它的*值*在每次執行間會改變；這**並不**代表該欄位的*形狀*可以自由變動。`ignore_fields` 的天真用法會把整個欄位排除在比較之外，連帶也停止斷言其格式 —— 於是當序列化器悄悄把 ISO-8601 時間戳改成 Unix epoch、拿掉時區、或變更 UUID 大小寫／版本時，皆無人察覺。**忽略其值，但仍斷言其格式。**

### 忽略值 vs. 忽略格式

| 欄位 | 天真做法：整欄忽略 | 建議做法：忽略值、斷言格式 |
|-------|---------------------------|-------------------------------------------|
| `created_at` | 完全不比較 | 忽略其值；但仍斷言它是 ISO-8601、且維持相同的小數秒精度與相同的時區表示 |
| `trace_id` | 完全不比較 | 忽略其值；但仍斷言它符合 UUID 版本與標準 8-4-4-4-12 形狀 |
| `token` | 完全不比較 | 忽略其值；但仍斷言長度、字元集與前綴 |

### 非確定性欄位：忽略值、斷言格式

| 欄位模式 | 忽略（值） | 仍須斷言（格式／形狀） |
|--------------|--------------------|-------------------------------|
| `created_at`、`updated_at`、`timestamp` | 該瞬時 | ISO-8601 vs. epoch vs. 自訂；小數秒精度（位數）；時區表示（`Z` vs `+00:00` vs 偏移量） |
| `token`、`session_id`、`csrf_token` | 隨機位元組 | 長度、字元集、前綴 |
| `request_id`、`trace_id`、`correlation_id` | 隨機 UUID | UUID 版本 + 標準 8-4-4-4-12 形狀與大小寫 |

**時間欄範例。** 某遷移後的端點回傳 `created_at`：

```text
舊系統："2026-05-12T08:30:00Z"
新系統："2026-05-12T08:30:00.000+00:00"
```

兩者解碼後是同一瞬時，因此整欄忽略 —— 甚至是「先 parse 成日期再比值」 —— 都會通過。但**序列化格式已漂移**：多了小數秒、且時區表示從 `Z` 變成 `+00:00`。對採字串比對、或以嚴格格式 parse 的客戶端而言，這在正式環境會壞掉。斷言格式 pattern（例如 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`）能抓到它；整欄忽略則會遮蔽它。

### 一律比較（業務邏輯）

| 欄位模式 | 原因 |
|--------------|--------|
| `status`、`code`、`message`、`error_code` | 核心業務結果 |
| `order_status`、`payment_status` | 狀態機結果 |
| `amount`、`quantity`、`price` | 計算後的業務數值 |
| `success`、`refunded`、`cancelled` | 布林業務結果 |
| `user_id`、`order_id`（搭配固定測試資料） | 參照完整性 |

### 整欄忽略（例外 —— 須附理由）

把欄位完全排除在比較之外 —— 既不比值、**也不**斷言格式 —— 是**例外**，非預設。僅在欄位格式確實未定義或無關緊要時保留此做法（例如不透明的廠商 blob），並在行內註明理由。

> ⚠️ **風險**：整欄忽略會遮蔽**格式漂移**。改變精度或時區的時間戳、改變版本的 UUID、或多了／少了一個尾零的數字都會悄悄通過 —— 而這正是一致性測試本應抓到的那類 bug。

**規則**：`ignore_fields` 僅用於確實不確定性的*值*。忽略其值的同時，仍須斷言該欄位的格式／形狀。用它來排除業務邏輯欄位 —— 或用它來消音非確定性欄位的格式漂移 —— 都會使一致性測試失去意義。

---

## 序列化格式對等

只比較**反序列化後物件**的差分 oracle，會悄悄把序列化層級的差異 normalize 掉：它把兩邊的回應都 parse 成 map／物件再比較，於是任何在 parse 後消失的分歧都看不見了。要抓到序列化 bug，oracle 必須以能保留序列化形式的粒度比較 —— 要嘛比對**原始序列化字串**，要嘛明確斷言 JSON 形狀。

### 比較反序列化物件會遮蔽什麼

| 序列化分歧 | 比較 parse 後物件時會被遮蔽嗎？ |
|--------------------------|------------------------------------------|
| `1` vs `1.0`（數字格式） | 會 —— 兩者都 parse 成數字 `1` |
| `null` vs 缺少該 key | 會 —— 兩者都讀成不存在／null |
| `true` vs `1` vs `"true"` | 常會 —— 型別強制轉換後 |
| key 排序 | 會 —— 物件 key 無序 |
| 前導零／科學記號 | 會 —— parse 時被 normalize |
| 空白與 Unicode 轉義（`\/`、`\uXXXX`） | 會 —— parse 時遺失 |

### 兩種策略

1. **原始字串比對** —— 比對精確的序列化字串。保真度最強；當 wire 格式屬於契約一部分時採用（公開 API、被快取的 payload、簽章過的 body）。
2. **明確的 JSON 形狀斷言** —— 當原始比對太嚴格時（例如確實有非確定性的值），改為明確斷言形狀：
   - **key 的存在性與順序**（當順序屬於契約時）
   - **數字格式**：`1` vs `1.0`、前導零、科學記號
   - **`null` vs 缺漏 key**（省略欄位不等於明確的 `null`）
   - **布林／字串型別**：`true` vs `"true"` vs `1`

### 跨語言重寫會換掉序列化器

當系統以另一種語言重寫時，序列化器會換 —— 而各序列化器的**預設行為**不同。oracle 必須明確斷言這些，因為沒有其他東西會幫你抓。PHP `json_encode` ↔ C# `System.Text.Json` 常見的預設差異：

| 關注點 | PHP `json_encode`（預設） | C# `System.Text.Json`（預設） |
|---------|------------------------------|----------------------------------|
| 數字尾零 | `(float) 1.0` 輸出 `1`；需 `JSON_PRESERVE_ZERO_FRACTION` 才保留 `1.0` | `double` `1.0` 序列化成 `1`；`decimal` 保留小數位 |
| 日期／時間 | 無原生日期型別 —— 由應用決定（常是自訂字串或 epoch） | `DateTime`/`DateTimeOffset` → ISO-8601（round-trip "O"），例如 `2026-05-12T08:30:00+00:00` |
| 時區 | 由應用決定 | `DateTimeOffset` 保留偏移量；`DateTime.Kind` 決定 `Z` vs 偏移量 |
| `null` 屬性 | 以 `"k":null` 輸出 | 預設輸出；僅在 `DefaultIgnoreCondition.WhenWritingNull` 時省略 |
| key 排序 | 插入順序（associative array） | 屬性宣告／反射順序 |
| 斜線與 Unicode 轉義 | 預設轉義 `/` 與非 ASCII，除非設 `JSON_UNESCAPED_SLASHES` / `JSON_UNESCAPED_UNICODE` | 不轉義 `/`；非 ASCII 依所設定的 encoder 轉義 |

### 斷言序列化形狀（TypeScript）

```typescript
// 超越值的對等：斷言序列化形式，而不只是 parse 後的物件。
function assertSerializationParity(oldRaw: string, newRaw: string): void {
  // 1. 最強：精確的序列化字串（只剝除被忽略的*值*之後）。
  if (oldRaw === newRaw) return;

  // 2. 否則在原始文字上明確斷言形狀，而非在 JSON.parse() 上：
  //    數字格式 —— 舊的 "1.0" 不可悄悄變成新的 "1"
  const numberShape = (s: string) => s.match(/:\s*-?\d+(\.\d+)?([eE][+-]?\d+)?/g) ?? [];
  expect(numberShape(newRaw)).toEqual(numberShape(oldRaw));

  //    null vs 缺漏 —— 明確的 "key":null 不可消失
  expect(/"refund_id"\s*:\s*null/.test(newRaw))
    .toBe(/"refund_id"\s*:\s*null/.test(oldRaw));
}
```

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
| 只比較反序列化後的物件 | 序列化格式 bug（數字格式、`null` vs 缺漏 key、key 排序、型別強制轉換）在 parse 時被 normalize 掉 | 比對原始序列化字串，或明確斷言 JSON 形狀（見「序列化格式對等」） |
| 對非確定性欄位採整欄 `ignore_fields` | 遮蔽該欄位的**格式**漂移（時間戳精度／時區、UUID 版本） | 忽略其值但仍斷言格式／形狀（見「`ignore_fields` 使用指南」） |
| 特性化測試缺少 `@characterization` | Gate 0 找不到它們 | 一律加上 `@characterization` 標記 |
| 未進行 Gate 0 就開始重構 | 無法偵測行為偏移 | 先跑特性化測試，始終如此 |

---

## 相關標準

- [功能清單標準](../../../core/feature-manifest-standard.md) — 功能清單中 FM-NNN 的 schema
- [驗收條件追蹤](../../../core/acceptance-criteria-traceability.md) — `not_implemented` AC 狀態
- [重構標準](../../../core/refactoring-standards.md) — 特性化測試需求
- [測試標準](../../../core/testing-standards.md) — 測試實作標準
- [資料遷移測試](../../../core/data-migration-testing.md) — 同樣的「別只比看起來相等」原則，作用於 DB 儲存層（byte／codepoint 編碼），而非 oracle／序列化層

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本 — 快照 schema、一致性閘門、Gate 0 特性化協議（XSPEC-201） |
| 1.1.0 | 2026-06-28 | 比對保真度補強（XSPEC-306）— `ignore_fields` 改寫為「忽略值、斷言格式」；新增「序列化格式對等」章節（原始 vs. JSON 形狀斷言、PHP↔C# 序列化器預設）；2 條格式遮蔽反模式；與 data-migration-testing 交叉引用 |
