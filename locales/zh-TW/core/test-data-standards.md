---
source: ../../../core/test-data-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 67bb6b804e50
status: current
---

# 測試資料標準

> **語言**: [English](../../../core/test-data-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**參考**: [測試標準](testing-standards.md)、[安全標準](security-standards.md)

---

## 概述

本文件定義跨所有測試層級的測試資料管理標準，涵蓋資料策略選擇、個人可識別資訊（PII）的匿名化、Fixture 與 Schema Migration 同步、測試隔離原則、用於建立資料的 Factory Pattern，以及應避免的常見反模式。

妥善管理的測試資料能確保測試**可靠**（結果具確定性）、**安全**（不洩漏 PII）且**可維護**（schema 變更時易於更新）。

---

## 測試資料策略

依測試層級與資料複雜度選擇適當的測試資料策略：

| 策略 | 說明 | 適用場景 | 測試層級 |
|------|------|---------|---------|
| **Inline Data** | 直接在測試程式碼中定義資料 | 簡單、聚焦的值 | Unit tests |
| **Fixture Files** | 由測試載入的外部 JSON/YAML/SQL 檔案 | 共用參考資料、複雜結構 | Integration tests |
| **Seed Scripts** | 填充資料庫的可執行腳本 | 完整環境設定、真實資料集 | E2E tests |

### Inline Data

直接在測試函式中定義測試資料，讓測試保持自包含且易於理解。

**使用時機：**
- 輸入/輸出簡單的單元測試
- 資料量小（1-5 個物件）
- 每個測試需要略有不同的資料

**概念範例：**
```
// Inline: data is right next to the assertion
const user = { name: 'Jane Doe', email: 'jane@example.com', role: 'admin' };
expect(greet(user)).toBe('Hello, Admin Jane Doe');
```

### Fixture Files

將測試資料存放在外部檔案（JSON、YAML、CSV 或 SQL）中，由測試在執行時載入。

**使用時機：**
- 需要複雜或大量資料集的整合測試
- 多個測試共用相同的參考資料（唯讀）
- 資料代表擬真的領域物件

**最佳實踐：**
- 將 fixture 存放在專用的 `tests/fixtures/` 或 `__fixtures__/` 目錄
- 以描述性方式命名檔案：`valid-order-with-items.json`、`expired-subscription.json`
- 保持 fixture 小而聚焦——每個 fixture 一個情境
- 絕不在執行時修改 fixture 檔案

### Seed Scripts

以測試資料設定資料庫或外部服務的可執行腳本。

**使用時機：**
- 需要完整填充環境的 E2E 測試
- 使用擬真資料量的效能/負載測試
- 與真實資料庫互動的測試

**最佳實踐：**
- 讓 seed 腳本具冪等性（可安全多次執行）
- 同時包含設定（setup）與拆除（teardown）邏輯
- 將 seed 腳本與 schema migration 一起做版本控管
- 記錄 seeding 後的預期狀態

### 策略選擇指南

```
What test level?
├─ Unit test
│  └─ Use inline data (simple, self-contained)
├─ Integration test
│  └─ Use fixture files (shared, structured)
└─ E2E test
   └─ Use seed scripts (full environment setup)
```

---

## 資料匿名化規則

測試需要擬真資料時，**絕不使用真實 PII**。依欄位類型套用下列匿名化技術：

| PII 欄位 | 匿名化技術 | 範例（前 → 後） |
|----------|-----------|----------------|
| **姓名** | 使用 Faker 函式庫或虛構化名 | `John Smith` → `Jane Doe`（產生） |
| **Email** | 將網域替換為 `@example.com` | `john@company.com` → `user1@example.com` |
| **電話** | 以固定前綴進行格式保留遮罩 | `+1-555-123-4567` → `+1-555-000-0001` |
| **地址** | 泛化為虛構地址 | `123 Main St, NYC` → `1 Test Ave, Anytown` |
| **ID** | 對原值做 Hash，或使用流水號/UUID 產生 | `SSN: 123-45-6789` → `ID: test-uuid-0001` |

### 規則

1. **絕不複製正式環境資料**到測試環境，除非已完全匿名化
2. **使用確定性產生方式**，當測試需要可重現的資料時（設定 seed 的 Faker）
3. **驗證匿名化後的資料**仍保留格式限制（例如有效的 email 格式）
4. **記錄匿名化對應方式**，讓原始欄位語意清楚可辨
5. **檢查 CI 日誌中的測試資料**——確保測試輸出中沒有出現真實 PII

---

## Fixture 與 Schema Migration 同步

資料庫 schema 變更時，fixture 檔案**必須**同步更新。過時的 fixture 會造成偽陽性（測試通過但程式碼有問題）或偽陰性（測試失敗但程式碼正確）。

### 同步規則

1. **原子更新**：當 migration 新增/移除/重新命名欄位時，在**同一個 commit** 中更新所有引用該資料表的 fixture
2. **自動偵測**：加入 CI 檢查，依當前 schema 驗證 fixture 檔案
   - 載入每個 fixture 並驗證其符合預期 schema
   - 標記任何欄位過時或缺漏的 fixture
3. **Fixture 版本化**：在 fixture 檔案中加入 schema 版本註記
   ```json
   {
     "_schema_version": "2026-03-31-add-status-column",
     "users": [{ "name": "Test User", "email": "test@example.com", "status": "active" }]
   }
   ```
4. **Migration 檢查清單**：在 migration 的 PR 範本中將「更新測試 fixture」列為必要步驟
5. **過時 fixture 偵測**：執行自動化檢查，偵測引用 schema 中已不存在之欄位或資料表的 fixture

---

## 測試隔離原則

每個測試**必須**獨立。依賴共用狀態或執行順序的測試既脆弱又不可靠。

### 核心規則

1. **建立自己的資料**：每個測試在 `beforeEach` 或 `setUp` 區塊中建立它所需的確切資料
2. **自行清理**：每個測試在 `afterEach` 或 `tearDown` 中銷毀或回滾自己的資料
3. **無共用可變狀態**：測試**不得**讀寫其他測試也會使用的共用可變變數、資料庫列或檔案
4. **可平行執行**：測試應設計成可平行執行而不互相干擾
5. **冪等**：執行一次或多次測試，應產生相同結果

### 各測試層級的隔離策略

| 測試層級 | 隔離策略 |
|---------|---------|
| **Unit** | 純函式；mock 外部依賴 |
| **Integration** | Transaction rollback；測試專用的資料庫 schema |
| **E2E** | 專用測試環境；唯一命名空間資料 |

### Transaction Rollback 模式

對資料庫整合測試，將每個測試包在一個 transaction 中，並在之後回滾：

```
beforeEach: BEGIN TRANSACTION
  test runs (INSERT, UPDATE, SELECT)
afterEach: ROLLBACK
```

這可確保測試之間零副作用。

---

## Factory Pattern

使用 Factory Pattern 建立具合理預設值、且可依各測試覆寫的測試資料。

### 定義

**測試資料 factory** 是一個函式，它：
1. 為所有必要欄位提供**合理預設值**
2. 允許針對特定測試情境**覆寫**任何預設值
3. 支援自動建立**關聯/相關資料**

### 概念範例

```
// Factory with defaults
function createUser(overrides = {}) {
  return {
    id: generateUUID(),
    name: 'Default User',
    email: 'default@example.com',
    role: 'viewer',
    createdAt: new Date(),
    ...overrides       // Override any default
  };
}

// Usage: override only what matters for this test
const admin = createUser({ role: 'admin' });
const named = createUser({ name: 'Specific Name' });
```

### 關聯資料

Factory 應支援建立相關實體：

```
// Factory that creates associated data
function createOrder(overrides = {}) {
  const user = overrides.user || createUser();
  return {
    id: generateUUID(),
    userId: user.id,
    items: overrides.items || [createOrderItem()],
    status: 'pending',
    ...overrides
  };
}
```

### 最佳實踐

1. **每個實體一個 factory**：`createUser()`、`createOrder()`、`createProduct()`
2. **最小預設值**：只包含必要欄位；保持預設值簡單
3. **可組合**：Factory 可呼叫其他 factory 來建立相關資料
4. **無副作用**：Factory 只回傳資料物件；不寫入資料庫（那是另一個步驟）
5. **Traits/預設組合**：為常見情境定義具名預設組合：`createUser({ ...adminTraits })`

---

## 反模式

避免下列常見的測試資料反模式：

### 1. 共用可變資料

**問題**：多個測試讀寫相同的資料（全域變數、共用的資料庫列）。

**為何有害**：測試變得依賴執行順序。一個測試的變更會影響另一個測試的預期，造成間歇性失敗。

**修正**：每個測試建立並擁有自己的資料。使用 factory 與 setup/teardown hook。

### 2. 寫死的 ID

**問題**：測試使用寫死的 ID，例如 `userId: 1` 或 `orderId: 'abc-123'`。

**為何有害**：平行執行時測試之間的 ID 會衝突。對自動遞增值的假設在不同環境間會失效。

**修正**：在 factory 中產生唯一 ID（UUID）。絕不假設特定的 ID 值。

### 3. 依賴執行順序

**問題**：測試 B 假設測試 A 已執行並建立了某些資料。

**為何有害**：測試在單獨執行、以不同順序執行或平行執行時會失敗，使除錯極為困難。

**修正**：每個測試都完全自包含，擁有自己的 setup 與 teardown。任何測試都不應依賴另一個測試的副作用。

### 4. 使用正式環境資料

**問題**：將正式環境資料庫快照複製到測試環境。

**為何有害**：暴露真實 PII（法律/合規風險）、產生拖慢 CI 的龐大測試資料集，且包含不可預測的資料而導致測試脆弱。

**修正**：使用匿名化的合成資料。以 factory 與 Faker 函式庫產生測試資料。保持資料集最小且為特定目的而建。

---

## 快速參考卡

### 策略選擇
```
Unit test?           → Inline data
Integration test?    → Fixture files
E2E test?            → Seed scripts
```

### 匿名化快速檢查
```
Name?    → Faker / pseudonym
Email?   → @example.com domain
Phone?   → Format-preserving mask
Address? → Fictitious / generalized
ID?      → Hash / UUID / sequential
```

### 隔離檢查清單
```
[ ] 測試建立自己的資料
[ ] 測試清理自己的資料
[ ] 無共用可變狀態
[ ] 可安全平行執行
[ ] 每次結果相同
```

---

## 參考

- [測試標準](testing-standards.md) — 測試層級、覆蓋率與品質要求
- [安全標準](security-standards.md) — 資料保護與 PII 處理
- [單元測試標準](../options/testing/unit-testing.md) — 單元測試模式與最佳實踐
- [整合測試標準](../options/testing/integration-testing.md) — 整合測試策略

---

**相關標準：**
- [測試標準](testing-standards.md) — 整體測試框架
- [效能標準](performance-standards.md) — 效能測試的資料考量

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始版本：策略、匿名化、Fixture 同步、隔離、Factory Pattern、反模式 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
