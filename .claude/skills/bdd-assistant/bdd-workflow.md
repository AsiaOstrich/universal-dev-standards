---
source: ../../../../skills/bdd-assistant/bdd-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 99c24f7db172
status: current
---

# BDD 工作流程指南

**版本**: 1.0.0
**最後更新**: 2026-01-19

---

## 探索-制定-自動化循環

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BDD 探索-制定-自動化                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌───────────┐       ┌─────────────┐       ┌────────────┐              │
│      │ 🔍 探索   │─────▶│📝 制定       │─────▶│⚙️ 自動化    │             │
│      └───────────┘       └─────────────┘       └────────────┘              │
│           ▲                                          │                      │
│           │                                          │                      │
│           └──────────────────────────────────────────┘                      │
│                     （發現新行為）                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 階段 1：探索

### 目的

協作探索需求並識別具體範例。

### 時間

30-60 分鐘

### 參與者

- 產品負責人 / 商業分析師
- 開發人員
- QA / 測試人員

### 活動

1. **故事介紹** (5 分鐘)
   - PO 說明用戶故事
   - 解釋商業價值和背景

2. **澄清問題** (10 分鐘)
   - 團隊提問
   - 識別假設

3. **Example Mapping** (20 分鐘)
   ```
   🟡 [用戶故事]
        │
        ├─ 🔵 規則 1
        │      ├─ 🟢 範例 1.1
        │      └─ 🟢 範例 1.2
        │
        ├─ 🔵 規則 2
        │      └─ 🟢 範例 2.1
        │
        └─ 🔴 問題: 需要澄清
   ```

4. **邊界案例識別** (10 分鐘)
   - 可能出什麼錯？
   - 邊界條件
   - 錯誤情境

5. **總結** (5 分鐘)
   - 總結範例
   - 記錄開放問題
   - 安排後續步驟

### 輸出

- 具體範例清單
- 已識別的商業規則
- 待追蹤的問題
- 粗略的可行性估算

### 檢查清單

```
□ 利害關係人出席（商業、Dev、QA）
□ 用戶故事已討論並理解
□ 具體範例已收集
□ 邊界案例已識別
□ 所有澄清問題已回答或記錄
□ 範圍已達成共識
```

---

## 階段 2：制定

### 目的

將探索的範例轉換為可執行的 Gherkin 場景。

### 時間

15-30 分鐘

### 參與者

- 開發人員
- QA / 測試人員
- （選擇性）產品負責人審查

### 活動

1. **範例審查** (5 分鐘)
   - 審查探索的範例
   - 確認理解

2. **場景撰寫** (15 分鐘)
   - 將每個範例轉換為 Gherkin
   - 使用宣告式風格
   - 應用通用語言

3. **審查與精煉** (10 分鐘)
   - 團隊審查場景
   - 檢查宣告式風格
   - 確保商業可讀性

### Gherkin 風格指南

**應該：**
```gherkin
# 宣告式 - 描述 WHAT，不是 HOW
Scenario: 使用有效憑證成功登入
  Given 我是註冊使用者
  When 我使用有效憑證登入
  Then 我應該看到我的儀表板
```

**不應該：**
```gherkin
# 命令式 - 描述 HOW
Scenario: 登入
  Given 我導航到 "/login"
  And 我點擊 "#email" 欄位
  And 我輸入 "user@example.com"
  And 我點擊 "#password" 欄位
  And 我輸入 "password123"
  And 我點擊 "#submit" 按鈕
  Then 我應該看到文字 "Dashboard"
```

### 場景結構

```gherkin
Feature: [功能名稱]
  As a [角色]
  I want [功能]
  So that [好處]

  Background:
    Given [共同前置條件]

  Scenario: [描述性名稱]
    Given [初始情境]
    And [額外情境]
    When [動作]
    Then [預期結果]
    And [額外結果]
```

### 輸出

- 含 Gherkin 場景的 Feature 檔案
- Tag 組織（@critical、@smoke 等）
- 準備自動化

### 檢查清單

```
□ 場景使用正確的 Gherkin 語法
□ 場景是宣告式的（WHAT，不是 HOW）
□ 使用商業語言（無技術術語）
□ 每個場景獨立
□ 場景最多 5-10 個步驟
□ 場景已由團隊審查
□ Feature 檔案已提交到儲存庫
```

---

## 階段 3：自動化

### 目的

實作步驟定義和功能程式碼使場景通過。

### 時間

可變（取決於功能複雜度）

### 參與者

- 開發人員
- QA / 測試人員（複雜的步驟定義）

### 活動

1. **執行場景**（初始 RED）
   - 所有場景應該失敗
   - 確認場景可執行
   - 識別缺少的步驟定義

2. **撰寫步驟定義**
   - 實作每個步驟
   - 使其可重用
   - 使用參數化

3. **實作功能程式碼**（使用 TDD）
   ```
   對於每個失敗的場景：
   │
   ├─▶ 識別需要的元件
   │
   └─▶ 對於每個元件的 TDD 循環：
        🔴 撰寫失敗的單元測試
        🟢 實作最小程式碼
        🔵 重構
        │
        └─▶ 執行 BDD 場景（還在失敗？）
             ├─ 是 → 繼續 TDD
             └─ 否 → 移到下一個場景
   ```

4. **重構**
   - 清理程式碼
   - 移除重複
   - 改善命名

### 步驟定義範例

```typescript
// TypeScript/Cucumber.js 範例
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('我是註冊使用者', async function () {
  this.user = await createTestUser();
});

When('我使用有效憑證登入', async function () {
  await this.loginPage.login(this.user.email, this.user.password);
});

Then('我應該看到我的儀表板', async function () {
  expect(await this.dashboardPage.isVisible()).to.be.true;
});
```

### BDD + TDD 整合

```
┌─────────────────────────────────────────────────────────────────┐
│                    BDD + TDD 整合                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BDD 層（功能層級）                                             │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  Scenario: 使用折扣結帳                              │      │
│   │    Given 購物車商品總計 $100                        │      │
│   │    When 我套用折扣碼 "SAVE20"                       │      │
│   │    Then 我的總計應該是 $80                          │      │
│   └─────────────────────────────────────────────────────┘       │
│                          │                                      │
│                          ▼                                      │
│   TDD 層（單元層級）                                             │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  test_cart_calculates_total()                        │      │
│   │  test_discount_code_validates()                      │      │
│   │  test_discount_applies_percentage()                  │      │
│   │  test_invalid_code_rejected()                        │      │
│   └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 輸出

- 運作中的步驟定義
- 通過的場景
- 實作的單元測試
- 重構、整潔的程式碼

### 檢查清單

```
□ 所有步驟已建立步驟定義
□ 步驟定義可重用
□ 場景初始失敗（RED）
□ TDD 用於單元實作
□ 所有場景現在通過（GREEN）
□ 程式碼重構且整潔
□ 活文件已產生
```

---

## 完整工作流程範例

### 用戶故事

> 身為客戶，我想要在購物車套用折扣碼，以便在購買時省錢。

### 探索會議

**Example Mapping 結果：**
```
🟡 用戶故事: 套用折扣碼

🔵 規則 1: 有效碼套用折扣
   🟢 範例: 碼 "SAVE10" 給 10% 折扣
   🟢 範例: 碼 "FLAT5" 給 $5 折扣

🔵 規則 2: 無效碼顯示錯誤
   🟢 範例: 過期碼顯示「碼已過期」
   🟢 範例: 不存在的碼顯示「無效碼」

🔵 規則 3: 某些碼有最低要求
   🟢 範例: "MIN50" 需要最低 $50 購買

🔴 問題: 碼可以組合嗎？
   → 答案: 不行，每筆訂單一個碼
```

### 制定結果

```gherkin
Feature: 折扣碼套用
  As a 客戶
  I want 在購物車套用折扣碼
  So that 我可以在購買時省錢

  Background:
    Given 我的購物車有商品

  Scenario: 套用百分比折扣碼
    Given 我的購物車總計 $100
    When 我套用折扣碼 "SAVE10"
    Then 我的總計應該是 $90
    And 我應該看到「已套用 10% 折扣」

  Scenario: 套用固定金額折扣碼
    Given 我的購物車總計 $100
    When 我套用折扣碼 "FLAT5"
    Then 我的總計應該是 $95
    And 我應該看到「已套用 $5 折扣」

  Scenario: 拒絕過期折扣碼
    When 我套用折扣碼 "EXPIRED2023"
    Then 我應該看到錯誤「此碼已過期」
    And 我的總計應該保持不變

  Scenario: 拒絕低於最低購買的碼
    Given 我的購物車總計 $30
    When 我套用折扣碼 "MIN50"
    Then 我應該看到錯誤「需要最低購買 $50」
    And 我的總計應該保持不變
```

### 自動化結果

```typescript
// 步驟定義
Given('我的購物車總計 ${int}', async function (total) {
  await this.cart.setTotal(total);
});

When('我套用折扣碼 {string}', async function (code) {
  this.result = await this.cart.applyDiscount(code);
});

Then('我的總計應該是 ${int}', async function (expected) {
  expect(await this.cart.getTotal()).to.equal(expected);
});

Then('我應該看到錯誤 {string}', async function (message) {
  expect(this.result.error).to.equal(message);
});
```

---

## 相關資源

- [Gherkin 快速參考](./gherkin-guide.md)
- [BDD 核心標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/behavior-driven-development.md)
- [TDD 工作流程](../tdd-assistant/tdd-workflow.md)
