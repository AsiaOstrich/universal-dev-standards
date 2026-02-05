---
source: ../../../../skills/bdd-assistant/gherkin-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
---

# Gherkin 快速參考指南

**版本**: 1.0.0
**最後更新**: 2026-01-19

---

## 概述

Gherkin 是一種商業可讀、領域特定的語言，用於描述軟體行為而不詳述該行為如何實作。

---

## 關鍵字

### Feature

相關場景的容器。

```gherkin
Feature: 購物車
  As a 客戶
  I want 管理我的購物車
  So that 我可以購買我想要的產品
```

### Scenario

描述特定行為的單一測試案例。

```gherkin
Scenario: 新增商品到空購物車
  Given 我有一個空的購物車
  When 我新增「Widget」到我的購物車
  Then 我的購物車應該包含 1 個商品
```

### Given

設定初始情境或狀態。

```gherkin
Given 我以 "admin@example.com" 登入
Given 我的購物車有 3 個商品
Given 存在以下使用者:
  | email            | role  |
  | user@example.com | user  |
  | admin@example.com| admin |
```

### When

觸發動作或事件。

```gherkin
When 我點擊「提交」按鈕
When 我搜尋「筆電」
When 我新增「Widget」到我的購物車
```

### Then

斷言預期結果。

```gherkin
Then 我應該看到「訂單已確認」
Then 我的購物車總計應該是 $99.99
Then 我應該收到確認電子郵件
```

### And / But

延續前一個關鍵字。

```gherkin
Scenario: 使用有效憑證登入
  Given 我在登入頁面
  And 我有一個註冊帳號
  When 我輸入我的電子郵件
  And 我輸入我的密碼
  And 我點擊登入
  Then 我應該看到我的儀表板
  And 我應該看到歡迎訊息
  But 我不應該看到登入表單
```

### Background

功能中所有場景的共同設定。

```gherkin
Feature: 使用者個人資料
  Background:
    Given 我已登入
    And 我在我的個人資料頁面

  Scenario: 更新顯示名稱
    When 我將顯示名稱改為「新名稱」
    Then 我的顯示名稱應該是「新名稱」

  Scenario: 更新電子郵件
    When 我將電子郵件改為 "new@example.com"
    Then 我的電子郵件應該是 "new@example.com"
```

### Scenario Outline

帶多組資料的範本。

```gherkin
Scenario Outline: 計算折扣
  Given 我的購物車總計 <cart_total>
  When 我套用折扣碼 "<code>"
  Then 我的總計應該是 <final_total>

  Examples:
    | cart_total | code    | final_total |
    | $100       | SAVE10  | $90         |
    | $100       | SAVE20  | $80         |
    | $50        | SAVE10  | $45         |
```

---

## 資料表格

### 雜湊表格（具名欄位）

```gherkin
Given 存在以下使用者:
  | name  | email            | role  |
  | John  | john@example.com | admin |
  | Jane  | jane@example.com | user  |
```

```typescript
// 步驟定義
Given('存在以下使用者:', async function (dataTable) {
  const users = dataTable.hashes();
  // users = [
  //   { name: 'John', email: 'john@example.com', role: 'admin' },
  //   { name: 'Jane', email: 'jane@example.com', role: 'user' }
  // ]
  for (const user of users) {
    await createUser(user);
  }
});
```

### 原始表格（無標題）

```gherkin
Given 我有以下商品:
  | Widget A |
  | Widget B |
  | Widget C |
```

```typescript
// 步驟定義
Given('我有以下商品:', async function (dataTable) {
  const items = dataTable.raw().flat();
  // items = ['Widget A', 'Widget B', 'Widget C']
});
```

### 列陣列

```gherkin
Given 這些價格等級:
  | tier     | min | max  | discount |
  | Bronze   | 0   | 99   | 0%       |
  | Silver   | 100 | 499  | 5%       |
  | Gold     | 500 | 999  | 10%      |
```

```typescript
// 步驟定義
Given('這些價格等級:', async function (dataTable) {
  const rows = dataTable.rows();
  // rows = [
  //   ['Bronze', '0', '99', '0%'],
  //   ['Silver', '100', '499', '5%'],
  //   ['Gold', '500', '999', '10%']
  // ]
});
```

---

## Doc Strings

用於多行文字內容。

```gherkin
Scenario: 建立文章
  Given 我在新文章頁面
  When 我輸入以下內容:
    """
    # 歡迎

    這是文章內容。

    - 要點 1
    - 要點 2
    """
  And 我點擊發布
  Then 文章應該被建立
```

---

## Tags

組織和篩選場景。

### 常用 Tags

```gherkin
@smoke @critical
Feature: 使用者認證

  @happy-path
  Scenario: 成功登入
    ...

  @error-handling
  Scenario: 失敗登入
    ...

  @wip
  Scenario: 雙因素認證
    ...

  @slow @integration
  Scenario: SSO 登入
    ...
```

### Tag 類別

| Tag | 用途 |
|-----|------|
| `@smoke` | 快速健全性測試 |
| `@critical` | 高優先級功能 |
| `@wip` | 進行中的工作 |
| `@slow` | 長時間執行的測試 |
| `@manual` | 需要手動驗證 |
| `@skip` | 暫時禁用 |
| `@integration` | 整合測試 |
| `@api` | API 層級測試 |
| `@ui` | UI 層級測試 |

### 使用 Tags 執行

```bash
# 只執行 smoke 測試
cucumber --tags @smoke

# 執行 critical 但不執行 slow 測試
cucumber --tags "@critical and not @slow"

# 執行 smoke 或 critical 測試
cucumber --tags "@smoke or @critical"
```

---

## 本地化

Gherkin 支援多種語言。

### 英文（預設）

```gherkin
Feature: Shopping Cart
  Scenario: Add item
    Given I have an empty cart
    When I add an item
    Then my cart should have 1 item
```

### 繁體中文 (zh-TW)

```gherkin
# language: zh-TW
功能: 購物車
  場景: 新增商品
    假設 我有一個空的購物車
    當 我新增一個商品
    那麼 我的購物車應該有 1 個商品
```

### 簡體中文 (zh-CN)

```gherkin
# language: zh-CN
功能: 购物车
  场景: 添加商品
    假如 我有一个空的购物车
    当 我添加一个商品
    那么 我的购物车应该有 1 个商品
```

### 日文 (ja)

```gherkin
# language: ja
機能: ショッピングカート
  シナリオ: 商品を追加
    前提 カートが空である
    もし 商品を追加する
    ならば カートには 1 個の商品がある
```

---

## 最佳實踐

### 應該

```gherkin
# ✅ 宣告式 - 描述行為
Scenario: 成功結帳
  Given 我的購物車有商品
  And 我已登入
  When 我使用有效付款完成結帳
  Then 我的訂單應該被確認

# ✅ 商業語言
Scenario: 套用會員折扣
  Given 我是金卡會員
  And 我的購物車總計 $100
  When 我進入結帳
  Then 我應該獲得 15% 折扣

# ✅ 獨立場景
# 每個場景設定自己的情境
Scenario: 新使用者註冊
  Given 我是新訪客
  When 我使用有效資訊註冊
  Then 我應該擁有一個帳號
```

### 不應該

```gherkin
# ❌ 命令式 - 太技術
Scenario: 登入
  Given 我導航到 "/login"
  And 我輸入 "user@example.com" 到 "#email"
  And 我輸入 "password" 到 "#password"
  And 我點擊 "#submit"
  Then 我應該看到元素 ".dashboard"

# ❌ 技術術語
Scenario: API 認證
  Given 我 POST 到 "/api/auth" 帶 JSON payload
  Then 回應碼應該是 200
  And 回應應該包含 "token"

# ❌ 相依場景
Scenario: 步驟 1 - 建立使用者
  ...
Scenario: 步驟 2 - 以上面建立的使用者登入
  # 這依賴於 Scenario 1 先執行！
```

---

## 常見模式

### Page Object 整合

```gherkin
# 場景引用頁面，不是元素
Scenario: 導航到結帳
  Given 我在購物車頁面
  When 我點擊進入結帳
  Then 我應該在結帳頁面
```

### 資料驅動測試

```gherkin
Scenario Outline: 驗證電子郵件格式
  When 我以電子郵件 "<email>" 註冊
  Then 我應該看到 "<message>"

  Examples:
    | email           | message         |
    | valid@test.com  | 成功            |
    | invalid         | 無效電子郵件    |
    | @test.com       | 無效電子郵件    |
    |                 | 需要電子郵件    |
```

### Hooks（非 Gherkin）

```typescript
// 在步驟定義中
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function () {
  // 所有場景前設定一次
  await database.connect();
});

Before(async function () {
  // 每個場景前設定
  await database.beginTransaction();
});

After(async function () {
  // 每個場景後清理
  await database.rollback();
});

AfterAll(async function () {
  // 所有場景後清理一次
  await database.disconnect();
});
```

---

## 各語言工具

| 語言 | 工具 | 套件 |
|------|------|------|
| JavaScript | Cucumber.js | `@cucumber/cucumber` |
| TypeScript | Cucumber.js | `@cucumber/cucumber` |
| Python | Behave | `behave` |
| Python | pytest-bdd | `pytest-bdd` |
| Java | Cucumber-JVM | `io.cucumber:cucumber-java` |
| C# | SpecFlow | `SpecFlow` |
| Ruby | Cucumber | `cucumber` |
| Go | Godog | `github.com/cucumber/godog` |

---

## 相關資源

- [BDD 工作流程指南](./bdd-workflow.md)
- [BDD 核心標準](../../core/behavior-driven-development.md)
- [官方 Gherkin 參考](https://cucumber.io/docs/gherkin/reference/)
