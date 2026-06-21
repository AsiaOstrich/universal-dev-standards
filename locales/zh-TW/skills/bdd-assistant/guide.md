---
source: ../../../../skills/bdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: partial
description: |
  引導開發者完成行為驅動開發工作流程。
  使用時機：撰寫 BDD 場景、使用 Gherkin 語法、Given-When-Then 格式、Feature 檔案、三方協作。
  關鍵字：BDD, behavior-driven, Given When Then, Gherkin, Cucumber, scenario, feature file, step definition, 行為驅動開發.
---

# BDD 助手

> **語言**: [English](../../../../skills/bdd-assistant/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-19
**適用範圍**: Claude Code Skills

---

## 目的

本技能引導開發者完成行為驅動開發工作流程，協助：
- 進行 Discovery 會議探索需求
- 以 Given-When-Then 格式撰寫有效的 Gherkin 場景
- 建立可重用的步驟定義
- 整合 BDD 與 TDD 進行實作
- 維護活文件

---

## 快速參考

### BDD 工作流程檢查清單

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 探索階段                                                     │
│  □ 利害關係人已識別（商業、Dev、QA）                             │
│  □ 用戶故事已討論並理解                                          │
│  □ 具體範例已收集（Example Mapping）                             │
│  □ 邊界案例已識別                                                │
│  □ 問題已回答或記錄待追蹤                                        │
├─────────────────────────────────────────────────────────────────┤
│  📝 制定階段                                                     │
│  □ 場景使用正確的 Gherkin 語法                                   │
│  □ 場景是宣告式的（WHAT，不是 HOW）                              │
│  □ 使用商業語言（無技術術語）                                    │
│  □ 每個場景獨立且自包含                                          │
│  □ 場景最多 5-10 個步驟                                          │
│  □ 場景已由利害關係人審查                                        │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ 自動化階段                                                   │
│  □ 所有步驟已建立步驟定義                                        │
│  □ 步驟定義可重用                                                │
│  □ 場景初始失敗（RED）                                           │
│  □ TDD 用於單元層級實作                                          │
│  □ 所有場景通過（GREEN）                                         │
│  □ 程式碼重構且整潔                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Gherkin 快速參考

| 關鍵字 | 用途 | 範例 |
|--------|------|------|
| `Feature` | 場景容器 | `Feature: 用戶登入` |
| `Scenario` | 單一測試案例 | `Scenario: 成功登入` |
| `Given` | 設定初始情境 | `Given 我在登入頁面` |
| `When` | 觸發動作 | `When 我輸入有效憑證` |
| `Then` | 斷言結果 | `Then 我應該看到我的儀表板` |
| `And`/`But` | 延續前一個 | `And 我應該看到歡迎訊息` |
| `Background` | 共同設定 | 每個場景前執行 |
| `Scenario Outline` | 資料驅動 | 帶 Examples 表格的範本 |

### 宣告式 vs 命令式

```gherkin
# ❌ 壞 - 命令式（太詳細，UI 導向）
Scenario: 登入
  Given 我導航到 "http://example.com/login"
  And 我點擊使用者名稱欄位
  And 我輸入 "john@example.com"
  And 我點擊密碼欄位
  And 我輸入 "secret123"
  And 我點擊提交按鈕
  Then 我應該在頁面標題看到 "Dashboard"

# ✅ 好 - 宣告式（行為導向）
Scenario: 使用有效憑證成功登入
  Given 我是註冊使用者
  When 我使用有效憑證登入
  Then 我應該看到我的儀表板
```

---

## 三方協作快速參考

| 角色 | 焦點 | 要問的問題 |
|------|------|----------|
| **商業** (PO/BA) | What & Why | 「價值是什麼？」「使用者是誰？」 |
| **開發** | How | 「技術影響是什麼？」「依賴？」 |
| **測試** (QA) | What if | 「可能出什麼錯？」「邊界案例？」 |

---

## 工作流程協助

### 探索階段指引

探索需求時：

1. **Example Mapping**
   ```
   🟡 用戶故事: "使用者可以登入"
        │
        ├─ 🔵 規則: "使用者必須通過驗證"
        │      ├─ 🟢 範例: 有效憑證 → 登入成功
        │      └─ 🟢 範例: 無效憑證 → 錯誤訊息
        │
        ├─ 🔵 規則: "失敗後帳號鎖定"
        │      ├─ 🟢 範例: 3 次失敗 → 帳號鎖定
        │      └─ 🟢 範例: 鎖定帳號 → 無法登入
        │
        └─ 🔴 問題: 密碼過期政策？
   ```

2. **要問的問題**
   - Happy path 是什麼？
   - 可能出什麼錯？
   - 邊界條件是什麼？
   - 明確的範圍外是什麼？

### 制定階段指引

撰寫場景時：

1. **Feature 檔案結構**
   ```gherkin
   Feature: 功能名稱
     As a [角色]
     I want [功能]
     So that [好處]

     Background:
       Given 共同前置條件

     Scenario: 描述性場景名稱
       Given [初始情境]
       When [動作]
       Then [預期結果]
   ```

2. **場景風格指南**
   - 每個場景一個行為
   - 使用商業語言
   - 保持步驟宣告式
   - 最多 5-10 個步驟
   - 使場景獨立

### 自動化階段指引

實作時：

1. **步驟定義最佳實踐**
   ```typescript
   // ✅ 好: 可重用、參數化
   Given('我的購物車有 {int} 個商品', (count) => { ... });

   // ❌ 壞: 特定於一個場景
   Given('我的購物車有 3 個 Widget', () => { ... });
   ```

2. **BDD + TDD 整合**
   ```
   BDD 場景（功能層級）
        │
        └──▶ 步驟定義
                │
                └──▶ TDD 循環（單元層級）
                      🔴 撰寫失敗的單元測試
                      🟢 實作最小程式碼
                      🔵 重構
   ```

---

## 與其他工作流程整合

### BDD + SDD

與規格驅動開發一起工作時：

```gherkin
# 在 feature 檔案中引用規格
# @spec SPEC-001
Feature: 用戶認證
  實作 SPEC-001 用戶認證需求。

  @SPEC-001 @AC-1
  Scenario: 成功登入
    # SPEC-001 的驗收標準 1
    ...
```

### BDD + TDD

```
場景層級（BDD）           單元層級（TDD）
─────────────────────    ─────────────────
Scenario: 結帳    ──────▶  test_calculate_total()
  Given 購物車商品         test_apply_discount()
  When 結帳                test_create_order()
  Then 訂單建立            test_send_email()
```

### BDD + ATDD

```
ATDD: 驗收標準（商業簽核）
  │
  └──▶ BDD: Feature 檔案（Gherkin 場景）
         │
         └──▶ TDD: 單元測試（實作）
```

---

## 配置偵測

本技能支援專案特定配置。

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 的「Disabled Skills」區段
   - 若此技能被列出，則在此專案中禁用
2. 檢查 `CONTRIBUTING.md` 的「BDD Standards」區段
3. 檢查程式碼庫中現有的 `.feature` 檔案
4. 若未找到，**預設使用標準 BDD 實務**

### 首次設定

若未找到配置且情境不明確：

1. 詢問：「此專案尚未配置 BDD 偏好。您使用哪個 BDD 工具？」
   - Cucumber (JavaScript/TypeScript)
   - Behave (Python)
   - SpecFlow (C#)
   - 其他

2. 選擇後，建議記錄在 `CONTRIBUTING.md`：

```markdown
## BDD 標準

### BDD 工具
- Cucumber.js

### Feature 檔案位置
- `features/` 目錄

### 場景風格
- 宣告式（行為導向）
- 需要商業語言
- 每個場景最多 10 個步驟
```

---

## 詳細指南

完整標準請參閱：
- [BDD 核心標準](../../../../core/behavior-driven-development.md)
- [BDD 工作流程指南](./bdd-workflow.md)
- [Gherkin 快速參考](./gherkin-guide.md)

相關標準：
- [TDD 標準](../../core/test-driven-development.md)
- [ATDD 標準](../../../../core/acceptance-test-driven-development.md)
- [測試標準](../../core/testing-standards.md)

---

## 反模式快速偵測

| 症狀 | 可能問題 | 快速修復 |
|------|---------|---------|
| 場景因 UI 變更而失敗 | 命令式風格 | 使用宣告式語言 |
| 商業無法閱讀場景 | 技術術語 | 使用商業語言 |
| 場景通過但功能不工作 | 缺少場景 | 更好的 Discovery 會議 |
| 太多場景 | 場景爆炸 | 使用 Scenario Outline |
| 步驟定義重複 | 不可重用 | 抽取到輔助函數 |

---

## 相關標準

- [行為驅動開發](../../../../core/behavior-driven-development.md) - 核心 BDD 標準
- [驗收測試驅動開發](../../../../core/acceptance-test-driven-development.md) - ATDD 標準
- [測試驅動開發](../../core/test-driven-development.md) - TDD 標準
- [規格驅動開發](../../core/spec-driven-development.md) - SDD 工作流程
- [測試標準](../../core/testing-standards.md) - 測試框架
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 技能

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-19 | 初始發布 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
