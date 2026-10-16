---
source: ../../../../methodologies/guides/tdd-guide.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: 15f328d37322
status: current
---

# 測試驅動開發 (TDD) 標準

**版本**: 1.2.0
**最後更新**: 2026-01-25
**適用範圍**: 所有採用測試驅動開發的專案
**範圍**: universal

> **語言**: [English](../../../../methodologies/guides/tdd-guide.md) | [繁體中文](../../core/test-driven-development.md)

---

## 目的

本標準定義測試驅動開發 (TDD) 的原則、工作流程與最佳實踐，確保測試能夠驅動軟體功能的設計與實作。

**關鍵效益**：
- 設計從測試中浮現，產生更具可測試性與模組化的程式碼
- 對程式碼正確性獲得即時回饋
- 測試作為活文件
- 減少除錯時間與缺陷率
- 對重構更有信心

---

## 方法論分類

> **分類**: 傳統開發方法論 (1999-2011)

TDD 是源自極限編程 (XP) 與敏捷實踐的**傳統測試驅動開發家族**之一部分。它有別於 **AI 時代的 SDD (規格驅動開發)** 方法論。

### 歷史背景

| 方法論 | 時代 | 起源 | 關注點 |
|-------------|-----|--------|-------|
| **TDD** | 1999 | Kent Beck, XP | 測試驅動程式碼設計 |
| **BDD** | 2006 | Dan North | 行為驅動測試 |
| **ATDD** | 2003-2006 | GOOS, Gojko Adzic | 驗收驅動開發 |
| **SDD** | 2025+ | Thoughtworks, Martin Fowler | 規格驅動生成 (AI 時代) |

### 與 SDD 的關係

TDD 可以**在 SDD 實作階段內**使用，但不是 SDD 方法論本身的一部分：

```
┌──────────────────────────────────────────────────────────────┐
│                    Methodology Relationship                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   SDD Workflow:                                              │
│   Discuss → Proposal → Review → [Implementation] → Verify    │
│                             ↑                                │
│                     TDD can be used here                     │
│                     (optional, not required)                 │
│                                                              │
│   Traditional Double-Loop TDD (GOOS):                        │
│   BDD (Outer) → TDD (Inner)                                  │
│                                                              │
│   SDD generates test artifacts through Forward Derivation,   │
│   which TDD can then use as starting point.                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 何時使用 TDD

| 情境 | 建議 |
|---------|----------------|
| **SDD 專案** | 在實作階段使用 TDD (選擇性) |
| **舊系統專案** | 對新功能和錯誤修復使用 TDD |
| **非 AI 開發** | 將 TDD 作為主要方法論 |
| **效能關鍵程式碼** | 使用 TDD 確保演算法正確性 |

**參考**: [規格驅動開發標準](../../core/spec-driven-development.md)

---

## 目錄

1. [TDD 核心循環](#tdd-core-cycle)
2. [TDD 原則](#tdd-principles)
3. [適用場景指南](#applicability-guide)
4. [TDD vs BDD vs ATDD](#tdd-vs-bdd-vs-atdd)
5. [與 SDD 整合](#integration-with-sdd)
6. [TDD 工作流程](#tdd-workflow)
7. [測試設計指南](#test-design-guidelines)
8. [重構策略](#refactoring-strategies)
9. [TDD 中的測試替身](#test-doubles-in-tdd)
10. [反模式與修復](#anti-patterns-and-remediation)
11. [語言/框架實踐](#languageframework-practices)
12. [度量與評估](#metrics-and-assessment)
13. [相關標準](#related-standards)
14. [參考資料](#references)
15. [版本歷史](#version-history)
16. [授權](#license)

---

## TDD 核心循環

### 紅-綠-重構循環

TDD 遵循一個簡單但強大的迭代循環：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TDD Core Cycle                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌─────────┐         ┌─────────┐         ┌─────────┐                   │
│      │  🔴 RED  │────────▶│ 🟢 GREEN│────────▶│🔵 REFACTOR│                 │
│      └─────────┘         └─────────┘         └─────────┘                   │
│           ▲                                        │                        │
│           │                                        │                        │
│           └────────────────────────────────────────┘                        │
│                                                                             │
│   🔴 RED Phase (1-5 minutes)                                                │
│   ├─ Write a failing test that describes expected behavior                 │
│   ├─ Test should fail for the RIGHT reason                                 │
│   └─ Verify the test actually fails                                        │
│                                                                             │
│   🟢 GREEN Phase (1-10 minutes)                                             │
│   ├─ Write the MINIMUM code to make the test pass                          │
│   ├─ "Fake it till you make it" is acceptable                              │
│   └─ Don't over-engineer; just make it work                                │
│                                                                             │
│   🔵 REFACTOR Phase (5-15 minutes)                                          │
│   ├─ Improve code quality while keeping tests green                        │
│   ├─ Remove duplication (DRY)                                              │
│   ├─ Improve naming, structure, readability                                │
│   └─ Run tests after each refactoring step                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 循環時間建議

| 階段 | 建議時間 | 警示訊號 |
|-------|-----------------|---------------|
| 🔴 RED | 1-5 分鐘 | 若 >10 分鐘，測試範圍太大 |
| 🟢 GREEN | 1-10 分鐘 | 若 >15 分鐘，需要拆解問題 |
| 🔵 REFACTOR | 5-15 分鐘 | 若跳過，技術債會累積 |

### 口訣

> **Red → Green → Refactor → Repeat**

每次迭代都應該很小。如果你發現自己在任何階段花費太長時間，該測試可能設定得過於龐大。

---

## TDD 原則

### FIRST 原則

高品質的測試遵循 FIRST 原則：

| 原則 | 說明 | 實踐指南 |
|-----------|-------------|---------------------|
| **F**ast | 測試應該快速執行 | 單元測試每個 < 100ms；總測試套件 < 10s |
| **I**ndependent | 測試之間不互相依賴 | 無共用狀態；每個測試自行設定其資料 |
| **R**epeatable | 每次執行結果相同 | 無隨機性；無時間依賴；無外部 I/O |
| **S**elf-validating | 明確的通過/失敗結果 | 不需手動檢查；明確的斷言 |
| **T**imely | 在生產程式碼之前撰寫 | 這是 TDD 的本質 |

### Uncle Bob 的 TDD 三項規則

Robert C. Martin (Uncle Bob) 用三條嚴格的規則定義 TDD：

1. **規則一（紅色規則）**：除非是為了讓失敗的單元測試通過，否則不允許撰寫任何生產程式碼。

2. **規則二（測試規則）**：不允許撰寫超過足以失敗程度的單元測試；編譯失敗也算失敗。

3. **規則三（綠色規則）**：不允許撰寫超過足以讓單一失敗單元測試通過程度的生產程式碼。

### 測試的單一職責

每個測試應該驗證「一個」行為：

```
✅ Good: test_calculate_total_with_discount_applies_percentage()
❌ Bad:  test_calculate_total_and_tax_and_discount_and_shipping()
```

### 測試即文件

撰寫良好的測試可作為可執行的文件：

```
✅ Good test names:
- should_return_empty_list_when_no_users_found
- should_throw_validation_error_when_email_is_invalid
- should_calculate_discount_when_order_exceeds_threshold

❌ Bad test names:
- test1
- testCalculate
- itWorks
```

---

## 適用場景指南

### 依情境劃分的 TDD 適用性

| 情境 | 評級 | 附註 |
|------|------|------|
| **新功能開發** | ⭐⭐⭐⭐⭐ | TDD 最佳使用案例；設計從測試中浮現 |
| **Bug 修復** | ⭐⭐⭐⭐⭐ | 先撰寫失敗測試以重現 bug |
| **API 設計** | ⭐⭐⭐⭐⭐ | 測試可作為 API 使用文件 |
| **核心業務邏輯** | ⭐⭐⭐⭐⭐ | 高價值程式碼必須具備測試保護 |
| **演算法實作** | ⭐⭐⭐⭐ | 邊界情況繁多；TDD 有助於全面思考 |
| **重構既有程式碼** | ⭐⭐⭐⭐ | 先補足測試，再安全地重構 |
| **UI 元件** | ⭐⭐⭐ | 部分適用；可與 BDD 結合 |
| **探索性原型** | ⭐⭐ | TDD 可能會拖慢充滿不確定性的探索 |
| **一次性指令碼** | ⭐ | 成本效益比低 |
| **第三方整合** | ⭐⭐ | 難以 Mock；改用整合測試 |

### 依專案類型的 TDD

| 專案類型 | TDD | BDD | ATDD | 建議 |
|----------|-----|-----|------|------|
| **新創 MVP** | ⚠️ 選擇性 | ✅ 建議 | ❌ | 優先考量快速迭代 |
| **企業級應用程式** | ✅ 建議 | ✅ 建議 | ✅ 建議 | 品質與可維護性極為關鍵 |
| **開源專案** | ✅ 建議 | ⚠️ 選擇性 | ❌ | 貢獻者需要測試文件 |
| **老舊系統改造** | ✅ 必須 | ⚠️ 選擇性 | ❌ | 使用 Golden Master 策略（見下方） |
| **微服務** | ✅ 建議 | ✅ 建議 | ✅ 建議 | 合約測試至關重要 |
| **資料管線** | ⚠️ 選擇性 | ❌ | ❌ | 以整合測試為主 |
| **機器學習** | 🔶 視情況 | ❌ | ❌ | 請參閱下方的 ML 測試邊界 |

### 機器學習 (ML) 測試邊界

**重要提示**：ML 專案需要區分「模型效能」與「資料工程」：

| 面向 | TDD 適用性 | 說明 |
|------|-----------|------|
| **模型準確度** | ❌ 不適用 | 結果具非確定性；難以預先定義預期結果 |
| **特徵工程** | ✅ 必須 | 避免 Garbage In, Garbage Out |
| **資料清理** | ✅ 必須 | 資料品質會直接影響模型效能 |
| **資料轉換** | ✅ 必須 | 確保轉換邏輯正確無誤 |
| **管線整合** | ⚠️ 選擇性 | 以整合測試為主 |

### 老舊系統策略：Golden Master 測試

**問題**：在沒有測試的老舊系統中，「新增測試」本身就伴隨著破壞既有邏輯的風險。

**Golden Master 測試工作流程**：

```
┌─────────────────────────────────────────────────────────────────┐
│           Golden Master Testing Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  RECORD Phase (Don't modify code)                           │
│      ├─ Execute system with many inputs                         │
│      ├─ Record all outputs as "golden baseline"                 │
│      └─ Use automation tools or AI to generate test cases       │
│                                                                 │
│  2️⃣  VERIFY Phase                                                │
│      ├─ Create Snapshot/Approval tests                          │
│      └─ Ensure pre/post refactoring outputs match               │
│                                                                 │
│  3️⃣  REFACTOR Phase                                              │
│      ├─ Safely refactor under Golden Master protection          │
│      ├─ Run Golden Master tests after each modification         │
│      └─ Gradually convert Golden Masters to proper unit tests   │
│                                                                 │
│  4️⃣  EVOLVE Phase                                                │
│      └─ New features use standard TDD                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**工具支援**：
- ApprovalTests（支援多種語言）
- Jest 快照測試（Jest Snapshot Testing）
- Python：pytest-snapshot
- AI 輔助的測試輸入生成

### 決策樹

```
Requirement Source?
├─ Technical (performance, refactoring) → TDD
├─ Business Requirement
│   ├─ Has clear acceptance criteria?
│   │   ├─ Yes → ATDD → BDD → TDD
│   │   └─ No → BDD → TDD
│   └─ Complex business flow?
│       ├─ Yes → BDD (scenario description) → TDD
│       └─ No → TDD
└─ Exploratory/Prototype → Skip TDD temporarily
```

---

## TDD vs BDD vs ATDD

### 比較概覽

| 面向 | TDD | BDD | ATDD |
|------|-----|-----|------|
| **焦點** | 程式碼單元 | 行為 | 驗收條件 |
| **語言** | 程式碼 | 自然語言 (Gherkin) | 業務語言 |
| **參與者** | 開發人員 | 開發人員 + 業務分析師 (BA) + 品質工程師 (QA) | 全體團隊 + 利害關係人 |
| **測試層級** | 單元／整合 | 功能／場景 | 系統／驗收 |
| **工具** | xUnit 框架 | Cucumber、Behave、SpecFlow | FitNesse、Concordion |
| **時機** | 編寫程式碼期間 | 編寫程式碼之前 | 開發開始之前 |

### 雙循環 TDD (GOOS 模式)

```
┌─────────────────────────────────────────────────────────────────┐
│             Double-Loop TDD (Freeman & Pryce, 2009)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  BDD (Outer Loop) - Hours to Days                        │   │
│   │  ├─ Feature/Acceptance level                             │   │
│   │  ├─ User/Business perspective                            │   │
│   │  └─ Given-When-Then scenarios                            │   │
│   │        ↓                                                 │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │  TDD (Inner Loop) - Minutes                      │   │   │
│   │   │  ├─ Unit/Component level                         │   │   │
│   │   │  ├─ Code/Implementation perspective              │   │   │
│   │   │  └─ Red → Green → Refactor                       │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Key: BDD → TDD (Double-Loop from GOOS)                        │
│                                                                 │
│   Note: ATDD is an optional collaboration method for defining   │
│   acceptance criteria, not a required step in this sequence.    │
│   SDD (2025) is a separate AI-era methodology.                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 傳統與 AI 時代方法論

| 類別 | 方法論 | 焦點 |
|------|--------|------|
| **傳統 (1999-2011)** | TDD、BDD、ATDD | 測試驅動設計 |
| **AI 時代 (2025+)** | SDD | 規格驅動生成 |

> **附註**：SDD 可在其實作階段使用 TDD，但兩者是獨立的方法論。詳情請參閱 [規格驅動開發](../../core/spec-driven-development.md)。

### BDD Gherkin 語法概覽

```gherkin
Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access my personalized content

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter email "user@example.com"
    And I enter password "correctpassword"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message with my name

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter email "user@example.com"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

### ATDD 驗收條件格式

```markdown
## Feature: Shopping Cart Checkout

### Acceptance Criteria:

**AC-1: Calculate Order Total**
- GIVEN items in cart with prices [$10, $20, $15]
- WHEN user proceeds to checkout
- THEN total should be $45

**AC-2: Apply Discount Code**
- GIVEN cart total is $100
- AND valid discount code "SAVE20" for 20% off
- WHEN user applies discount code
- THEN total should be $80

**AC-3: Validate Minimum Order**
- GIVEN cart total is below $25
- WHEN user attempts checkout
- THEN system should show "Minimum order is $25" error
```

### 選擇適當的做法

| 使用案例 | 主要做法 | 輔助做法 |
|----------|----------|----------|
| 演算法實作 | TDD | - |
| 使用者驗證流程 | BDD | TDD |
| 付款處理 | ATDD | BDD + TDD |
| API 端點 | TDD | BDD（用於整合） |
| UI 元件 | BDD | TDD（用於邏輯） |
| 業務規則驗證 | ATDD | TDD |
| 效能最佳化 | TDD | - |
| 外部服務整合 | TDD | BDD（用於合約） |

---

## 與 SDD 整合

### SDD + TDD 統一工作流程

規格驅動開發 (SDD) 和測試驅動開發 (TDD) 是互補的：

- **SDD**：「規格優先，程式碼其次」- 定義要建構「什麼」
- **TDD**：「測試優先，程式碼其次」- 定義如何「驗證」

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SDD + TDD 整合工作流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  SDD: PROPOSAL 階段                                                     │
│      ├─ 撰寫 Spec：定義功能、驗收條件、邊界情況                              │
│      ├─ 包含驗收條件（轉換為 ATDD 場景）                                     │
│      └─ 取得利益相關者核准                                                   │
│         (Spec ID: SPEC-001)                                                 │
│                                                                             │
│  2️⃣  TDD: RED 階段                                                          │
│      ├─ 根據 Spec 的驗收條件撰寫測試                                         │
│      ├─ 撰寫描述預期行為的失敗測試                                           │
│      ├─ 測試實作 Spec：一個條件 = 多個測試                                   │
│      └─ 在測試檔案註釋中引用 SPEC-001                                        │
│                                                                             │
│  3️⃣  TDD: GREEN + REFACTOR 階段                                             │
│      ├─ 迭代開發，一次實作一個小功能                                         │
│      ├─ 測試通過後進行重構                                                   │
│      └─ 保持所有 Spec 驗收條件測試處於通過狀態                               │
│                                                                             │
│  4️⃣  SDD: VERIFICATION 階段                                                 │
│      ├─ 確認實作符合 Spec                                                    │
│      ├─ 驗收測試套件通過                                                     │
│      └─ 所有驗收條件均已實作 ✓                                               │
│                                                                             │
│  5️⃣  提交 PR 並撰寫 Commit 訊息                                             │
│      ├─ Commit: "feat(auth): implement login"                               │
│      ├─ 內文: "Implements SPEC-001 with OAuth2"                             │
│      ├─ 引用: SPEC-001                                                      │
│      └─ 包含測試覆蓋率報告                                                   │
│                                                                             │
│  6️⃣  SDD: ARCHIVE 階段                                                      │
│      └─ 封存 Spec，連結至 PR/commits                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 將 Spec 驗收條件對應至 TDD 測試

| Spec 驗收條件 | TDD 測試 |
|---------------|----------|
| "User can login with valid credentials" | `test_login_with_valid_credentials_succeeds()` |
| "Invalid password shows error" | `test_login_with_invalid_password_shows_error()` |
| "Account locked after 3 failed attempts" | `test_account_locks_after_three_failed_attempts()` |
| "Locked account cannot login" | `test_locked_account_cannot_login()` |

### 在測試中引用 Spec

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * @see specs/SPEC-001-user-authentication.md
 */
describe('User Authentication (SPEC-001)', () => {
  // AC-1: User can login with valid credentials
  test('should login successfully with valid credentials', async () => {
    // ...
  });

  // AC-2: Invalid password shows error
  test('should show error message for invalid password', async () => {
    // ...
  });
});
```

---

## TDD 工作流程

### 個人層級 TDD

```
┌─────────────────────────────────────────────────────────────────┐
│              個人 TDD 工作階段流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 理解需求                                                    │
│     ├─ 閱讀規格／使用者故事                                     │
│     └─ 識別驗收條件                                             │
│                                                                 │
│  2. 列出測試案例（在紙上或 TODO 註釋中）                        │
│     ├─ 正常路徑（Happy path）場景                               │
│     ├─ 邊界情況                                                 │
│     ├─ 錯誤場景                                                 │
│     └─ 邊界條件                                                 │
│                                                                 │
│  3. 挑選最簡單的測試案例                                        │
│     └─ 從最基本的正常路徑開始                                   │
│                                                                 │
│  4. RED：撰寫測試                                               │
│     ├─ 撰寫具有清晰 Arrange-Act-Assert 的測試                   │
│     ├─ 使用具描述性的測試名稱                                   │
│     └─ 執行測試，驗證其失敗                                     │
│                                                                 │
│  5. GREEN：讓測試通過                                           │
│     ├─ 撰寫最少量的程式碼使其通過                               │
│     ├─ 「先假裝，再實現」是可以接受的                           │
│     └─ 執行測試，驗證其通過                                     │
│                                                                 │
│  6. REFACTOR：清理程式碼                                        │
│     ├─ 消除重複                                                 │
│     ├─ 改善命名                                                 │
│     ├─ 擷取方法／函式                                           │
│     └─ 每次變更後執行所有測試                                   │
│                                                                 │
│  7. 從步驟 3 重複，直到所有測試完成                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 團隊層級 TDD

#### 結對編程與 TDD

**乒乓模式（Ping-Pong Pattern）**：
1. 開發者 A 撰寫一個失敗的測試
2. 開發者 B 撰寫程式碼使測試通過
3. 開發者 B 撰寫下一個失敗的測試
4. 開發者 A 撰寫程式碼使測試通過
5. 任一開發者均可在任何時間進行重構
6. 重複此過程

**駕駛與領航員模式（Driver-Navigator Pattern）**：
1. 領航員（Navigator）思考設計與測試案例
2. 駕駛（Driver）撰寫測試與程式碼
3. 每 15-30 分鐘輪換角色

#### 群體編程（Mob Programming）與 TDD

- 一位駕駛（鍵盤輸入），多位領航員（引導方向）
- 每 5-10 分鐘輪換一次駕駛
- 共同決定測試案例與實作方式
- 透過多元觀點獲得更高品質

### CI/CD 整合

```yaml
# Example GitHub Actions workflow for TDD
name: TDD CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Check coverage threshold
        run: npm run test:coverage -- --coverage-threshold=80

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
```

---

## 測試設計指南

### AAA 模式（Arrange-Act-Assert）

```typescript
test('should calculate total with discount', () => {
  // Arrange - Set up test data and dependencies
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.setDiscountCode('SAVE20'); // 20% discount

  // Act - Execute the behavior being tested
  const total = cart.calculateTotal();

  // Assert - Verify the result
  expect(total).toBe(80);
});
```

### Given-When-Then 模式（BDD 風格）

```typescript
test('given a cart with items, when discount applied, then total is reduced', () => {
  // Given
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });

  // When
  cart.applyDiscount('SAVE20');
  const total = cart.calculateTotal();

  // Then
  expect(total).toBe(80);
});
```

### 測試命名慣例

| 模式 | 範例 |
|------|------|
| `should_[behavior]_when_[condition]` | `should_return_error_when_email_invalid` |
| `[method]_[scenario]_[expected]` | `calculateTotal_withDiscount_returnsReducedPrice` |
| `test_[method]_[scenario]_[expected]` | `test_login_invalidPassword_throwsError` |
| `it_[does something]` | `it_calculates_total_correctly` |

### 測試資料最佳實踐

```typescript
// ✅ Good: Clear, meaningful test data
const validUser = {
  email: 'john.doe@example.com',
  password: 'SecureP@ss123',
  role: 'admin'
};

// ❌ Bad: Magic strings without context
const user = {
  email: 'a@b.c',
  password: '123',
  role: 'x'
};

// ✅ Good: Use test data builders
const user = UserBuilder.create()
  .withEmail('john.doe@example.com')
  .withRole('admin')
  .build();

// ✅ Good: Use constants for boundary values
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

test('should reject password exceeding max length', () => {
  const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
  expect(() => validatePassword(longPassword)).toThrow();
});
```

### 測試邊界情況

確保測試涵蓋 [測試完整性維度](../../core/test-completeness-dimensions.md) 中定義的所有八個維度。其中包括正常路徑（happy path）、邊界條件、錯誤處理、授權、狀態變更、驗證、整合以及 AI 生成品質（適用時）。

使用該文件中的檢查清單來驗證各功能的覆蓋率。

---

## 重構策略

### 何時進行重構

當你看到程式碼壞味道（code smell）時就進行重構。使用下方的完整目錄來識別問題與對應的解決方案。

### 程式碼壞味道目錄

根據 Martin Fowler 的《重構》（第 2 版），程式碼壞味道分為五大類：

#### 1. 膨脹劑（Bloaters）

程式碼過於龐大而難以處理。

| 壞味道 | 說明 | 重構手法 |
|-------|-------------|-------------|
| **過長函式（Long Method）** | 函式超過 20 行，做太多事情 | 提煉函式（Extract Method）、以查詢取代暫存變數（Replace Temp with Query）、引入參數物件（Introduce Parameter Object） |
| **過大類別（Large Class）** | 類別承擔過多職責 | 提煉類別（Extract Class）、提煉子類別（Extract Subclass）、提煉介面（Extract Interface） |
| **基本型別偏執（Primitive Obsession）** | 對簡單任務使用基本型別而非小型物件 | 以物件取代基本型別（Replace Primitive with Object）、以類別取代型別碼（Replace Type Code with Class）、引入參數物件（Introduce Parameter Object） |
| **過長參數列（Long Parameter List）** | 超過 3 個參數 | 引入參數物件（Introduce Parameter Object）、保持物件完整（Preserve Whole Object）、以函式呼叫取代參數（Replace Parameter with Method Call） |
| **資料泥團（Data Clumps）** | 相同的一組資料在多處一同出現 | 提煉類別（Extract Class）、引入參數物件（Introduce Parameter Object）、保持物件完整（Preserve Whole Object） |

#### 2. 物件導向濫用者（Object-Orientation Abusers）

對物件導向原則不完整或不正確的應用。

| 壞味道 | 說明 | 重構手法 |
|-------|-------------|-------------|
| **Switch 語句（Switch Statements）** | 依據型別而生的複雜 switch/if-else 鏈 | 以多型取代條件邏輯（Replace Conditional with Polymorphism）、以策略取代型別碼（Replace Type Code with Strategy）、以狀態取代型別碼（Replace Type Code with State） |
| **暫時性欄位（Temporary Field）** | 僅在特定情況下設定的欄位 | 提煉類別（Extract Class）、引入空物件（Introduce Null Object）、引入特例（Introduce Special Case） |
| **拒絕繼承（Refused Bequest）** | 子類別未使用繼承的函式 | 下移函式（Push Down Method）、下移欄位（Push Down Field）、以委託取代繼承（Replace Inheritance with Delegation） |
| **介面不同的替代類別（Alternative Classes with Different Interfaces）** | 做相同事情但函式簽章不同的類別 | 重新命名函式（Rename Method）、搬移函式（Move Method）、提煉超類別（Extract Superclass） |
| **平行繼承體系（Parallel Inheritance Hierarchies）** | 建立子類別時必須在另一個體系中也建立一個子類別 | 搬移函式（Move Method）、搬移欄位（Move Field） |

#### 3. 變更預防者（Change Preventers）

讓變更比必要更困難的程式碼。

| 壞味道 | 說明 | 重構手法 |
|-------|-------------|-------------|
| **發散式變化（Divergent Change）** | 一個類別因許多不同原因而改變 | 提煉類別（Extract Class）、拆分階段（Split Phase） |
| **散彈式手術（Shotgun Surgery）** | 一個變更需要修改許多類別 | 搬移函式（Move Method）、搬移欄位（Move Field）、內聯函式（Inline Function）、內聯類別（Inline Class） |
| **平行繼承體系（Parallel Inheritance Hierarchies）** | （見上） | 搬移函式（Move Method）、搬移欄位（Move Field） |

#### 4. 可贅除物（Dispensables）

可以被移除的不必要程式碼。

| 壞味道 | 說明 | 重構手法 |
|-------|-------------|-------------|
| **註解（Comments）** | 掩蓋糟糕程式碼的過多註解 | 提煉函式（Extract Method）、重新命名函式（Rename Method）、引入斷言（Introduce Assertion） |
| **重複程式碼（Duplicate Code）** | 多處出現相同或相似的程式碼 | 提煉函式（Extract Method）、上推函式（Pull Up Method）、提煉類別（Extract Class）、搬移陳述句（Slide Statements） |
| **死碼（Dead Code）** | 未使用的程式碼（變數、函式、類別） | 移除死碼（Remove Dead Code） |
| **冗贅類別（Lazy Class）** | 做的太少不足以證明其存在價值的類別 | 內聯類別（Inline Class）、折疊體系（Collapse Hierarchy） |
| **誇誇其談未來性（Speculative Generality）** | 「以備將來之需」的未使用抽象 | 折疊體系（Collapse Hierarchy）、內聯函式（Inline Function）、內聯類別（Inline Class）、移除死碼（Remove Dead Code） |
| **純資料類別（Data Class）** | 僅有欄位與 getter/setter 的類別 | 搬移函式（Move Method）、封裝欄位（Encapsulate Field）、封裝集合（Encapsulate Collection） |

#### 5. 耦合者（Couplers）

類別之間存在過度耦合的程式碼。

| 壞味道 | 說明 | 重構手法 |
|-------|-------------|-------------|
| **依戀情結（Feature Envy）** | 函式使用另一個類別的資料多於自己的資料 | 搬移函式（Move Method）、提煉函式（Extract Method） |
| **狎暱關係（Inappropriate Intimacy）** | 類別過度緊密耦合，存取彼此的私有部分 | 搬移函式（Move Method）、搬移欄位（Move Field）、隱藏委託（Hide Delegate）、以繼承取代委託（Replace Delegation with Inheritance） |
| **訊息鏈（Message Chains）** | `a.getB().getC().getD().getValue()` | 隱藏委託（Hide Delegate）、提煉函式（Extract Method）、搬移函式（Move Method） |
| **中間人（Middle Man）** | 類別只是一味委託給另一個類別 | 移除中間人（Remove Middle Man）、內聯函式（Inline Function）、以委託取代超類別（Replace Superclass with Delegate） |

### 程式碼壞味道偵測檢查清單

用於識別常見壞味道的快速檢查清單：

```
函式/方法層級：
□ 函式 > 20 行？ → 提煉函式（Extract Method）
□ > 3 個參數？ → 引入參數物件（Introduce Parameter Object）
□ 巢狀過深（> 3 層）？ → 提煉函式（Extract Method）、以保護子句取代巢狀條件式（Replace Nested Conditional with Guard Clauses）
□ 多個 return 陳述句？ → 考慮重構

類別層級：
□ 類別 > 200 行？ → 提煉類別（Extract Class）
□ > 10 個函式？ → 考慮拆分職責
□ 上帝類別（God class，無所不做）？ → 提煉類別（Extract Class）
□ 純資料類別（僅有欄位）？ → 移入行為

程式碼模式：
□ 依型別切換（Switch on type）？ → 以多型取代（Replace with Polymorphism）
□ 複製貼上的程式碼？ → 提煉函式/類別（Extract Method/Class）
□ 未使用的程式碼？ → 刪除它
□ 魔術數字？ → 以具名常數取代（Replace with Named Constant）
```

### 安全重構檢查清單

```
重構前：
□ 所有測試皆通過（綠色）
□ 存在足夠的測試覆蓋率
□ 你理解程式碼在做什麼

重構期間：
□ 一次只做一個微小變更
□ 每次變更後都執行測試
□ 若測試失敗，立即還原
□ 重構時不要加入新功能

重構後：
□ 所有測試仍然通過
□ 程式碼更整潔/更簡單
□ 未加入任何新功能
```

### 重構技巧目錄

基於 Martin Fowler 的《重構：改善既有程式碼的設計》（第 2 版，2018）。

#### 重新組織函式（Composing Methods）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **提煉函式（Extract Method）** | 過長函式、重複程式碼 | 將 10 行提煉為 `calculateDiscount()` |
| **內聯函式（Inline Method）** | 函式本體與其名稱一樣清晰 | 移除微不足道的委託 |
| **提煉變數（Extract Variable）** | 複雜運算式 | `const isEligible = age >= 18 && hasLicense` |
| **內聯變數（Inline Variable）** | 變數未增加任何資訊 | 移除 `const x = obj.value; return x;` |
| **以查詢取代暫存變數（Replace Temp with Query）** | 暫存變數被多次使用 | 轉為函式以供重複使用 |
| **拆分變數（Split Variable）** | 變數因不同目的被多次賦值 | 建立各自獨立的變數 |
| **移除對參數的賦值（Remove Assignments to Parameters）** | 令人困惑的參數修改 | 改用區域變數 |
| **以函式物件取代函式（Replace Method with Method Object）** | 帶有許多區域變數的過長函式 | 提煉至新類別 |

#### 在物件之間搬移特性（Moving Features Between Objects）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **搬移函式（Move Method）** | 函式使用另一個類別的特性更多 | 搬移至其所依戀的類別 |
| **搬移欄位（Move Field）** | 欄位被另一個類別使用更多 | 搬移至使用它最多的類別 |
| **提煉類別（Extract Class）** | 類別做太多事 | 拆分為兩個類別 |
| **內聯類別（Inline Class）** | 類別做太少事 | 合併至另一個類別 |
| **隱藏委託（Hide Delegate）** | 用戶端透過委託鏈進行呼叫 | 加入中介函式 |
| **移除中間人（Remove Middle Man）** | 過多的委託 | 直接公開委託物件 |

#### 組織資料（Organizing Data）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **以物件取代基本型別（Replace Primitive with Object）** | 帶有行為的基本型別 | `string phoneNumber` → `PhoneNumber` 類別 |
| **以物件取代資料值（Replace Data Value with Object）** | 資料項目需要額外行為 | 將價格作為帶有幣別的物件 |
| **以常數取代魔術數字（Replace Magic Number with Constant）** | 程式碼中的魔術數字 | `const MAX_RETRIES = 3` |
| **封裝欄位（Encapsulate Field）** | 公開欄位 | 加入 getter/setter 函式 |
| **封裝集合（Encapsulate Collection）** | Getter 直接回傳集合 | 回傳防禦性複本 |
| **以類別取代型別碼（Replace Type Code with Class）** | 型別碼影響行為 | 改用類別/列舉 |
| **以子類別取代型別碼（Replace Type Code with Subclasses）** | 型別碼對行為產生不同影響 | 建立子類別體系 |
| **以狀態/策略取代型別碼（Replace Type Code with State/Strategy）** | 型別碼在執行時期改變 | 使用 State/Strategy 模式 |

#### 簡化條件運算式（Simplifying Conditional Expressions）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **分解條件式（Decompose Conditional）** | 複雜條件式 | 將條件與分支提煉為函式 |
| **合併條件運算式（Consolidate Conditional Expression）** | 多個條件具有相同結果 | 使用邏輯運算子合併 |
| **合併重複的條件片段（Consolidate Duplicate Conditional Fragments）** | 所有分支中皆有相同程式碼 | 移至條件式之外 |
| **以保護子句取代巢狀條件式（Replace Nested Conditional with Guard Clauses）** | 深度巢狀 | 針對特殊情況提早回傳 |
| **以多型取代條件邏輯（Replace Conditional with Polymorphism）** | 依型別切換（Switch on type） | 使用多型 |
| **引入空物件（Introduce Null Object）** | 頻繁的 null 檢查 | 建立 Null Object 類別 |
| **引入斷言（Introduce Assertion）** | 關於狀態的假設 | 加入明確的斷言 |

#### 簡化函式呼叫（Making Method Calls Simpler）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **重新命名函式（Rename Method）** | 不清晰的名稱 | `calc()` → `calculateOrderTotal()` |
| **加入參數（Add Parameter）** | 函式需要更多資料 | 加入必要參數 |
| **移除參數（Remove Parameter）** | 參數不再使用 | 移除未使用的參數 |
| **將查詢與修改分離（Separate Query from Modifier）** | 函式同時回傳值並進行修改 | 拆分為兩個函式 |
| **參數化函式（Parameterize Method）** | 僅有字面值差異的相似函式 | 透過參數進行合併 |
| **引入參數物件（Introduce Parameter Object）** | 多個參數總是一同傳遞 | `(x, y, w, h)` → `Rectangle` |
| **保持物件完整（Preserve Whole Object）** | 從物件傳遞多個數值 | 改為傳遞該物件 |
| **以函式呼叫取代參數（Replace Parameter with Method Call）** | 參數可被計算取得 | 在內部呼叫函式 |
| **以工廠函式取代建構式（Replace Constructor with Factory Method）** | 複雜的建構邏輯 | 使用工廠函式 |

#### 處理概括關係（Dealing with Generalization）

| 技巧 | 何時使用 | 範例 |
|-----------|-------------|---------|
| **上推欄位（Pull Up Field）** | 子類別中的相同欄位 | 移至超類別 |
| **上推函式（Pull Up Method）** | 子類別中的相同函式 | 移至超類別 |
| **下移欄位（Push Down Field）** | 僅被部分子類別使用的欄位 | 移至相關子類別 |
| **下移函式（Push Down Method）** | 僅被部分子類別使用的函式 | 移至相關子類別 |
| **提煉超類別（Extract Superclass）** | 相似類別 | 建立共享的超類別 |
| **提煉介面（Extract Interface）** | 多個類別具有相同的函式子集 | 建立介面 |
| **折疊體系（Collapse Hierarchy）** | 超類別/子類別差異不夠大 | 合併類別 |
| **以委託取代繼承（Replace Inheritance with Delegation）** | 子類別不想要所有繼承的函式 | 改用組合（composition） |
| **以繼承取代委託（Replace Delegation with Inheritance）** | 過多的轉發 | 改為繼承 |

#### 快速參考：最常見的重構

```
每日重構（5-15 分鐘）：
├── 重新命名（變數、函式、類別）
├── 提煉函式
├── 內聯變數
├── 以常數取代魔術數字
└── 提煉變數

每週重構（30 分鐘 - 2 小時）：
├── 提煉類別
├── 搬移函式/欄位
├── 以多型取代條件邏輯
├── 引入參數物件
└── 以物件取代基本型別

策略性重構（數天 - 數週）：
├── 以委託取代繼承
├── 提煉超類別/介面
├── 引入空物件
└── 以狀態/策略取代型別碼
```

---

## TDD 中的測試替身

### 測試替身類型

| 類型 | 目的 | 使用時機 |
|------|---------|-------------|
| **Dummy** | 填補參數列表 | 測試中不需要使用但必填的參數 |
| **Stub** | 回傳預先定義的值 | 模擬特定情境 |
| **Spy** | 記錄互動 | 驗證方法是否被呼叫 |
| **Mock** | 驗證互動 + 回傳值 | 測試行為與協作 |
| **Fake** | 簡化的可用實作 | 記憶體內部資料庫 |

### 依測試層級的測試替身使用

| 層級 | 建議替身 |
|-------|---------------------|
| **單元測試** | 對所有外部相依使用 Mock、Stub |
| **整合測試** | 對資料庫使用 Fake，對外部 API 使用 Stub |
| **系統測試** | 真實元件，僅對外部服務使用 Fake |
| **E2E 測試** | 全部使用真實元件 |

### 範例：使用 Mock 與 Stub

```typescript
// Stub 範例 - 預先定義的回傳值
const paymentGateway = {
  processPayment: jest.fn().mockResolvedValue({ success: true, transactionId: 'TXN123' })
};

// Mock 範例 - 驗證互動
const emailService = {
  sendConfirmation: jest.fn()
};

test('should send confirmation email after successful payment', async () => {
  const order = new OrderService(paymentGateway, emailService);

  await order.checkout({ amount: 100, email: 'user@example.com' });

  // 驗證 mock 是否以正確的引數被呼叫
  expect(emailService.sendConfirmation).toHaveBeenCalledWith(
    'user@example.com',
    expect.objectContaining({ transactionId: 'TXN123' })
  );
});
```

### 避免過度 Mock

```
❌ 過度 Mock（測試實作細節）：
- Mock 私有方法
- Mock 每一個相依套件
- 驗證每一個內部方法呼叫

✅ 適當的 Mock：
- Mock 外部服務（API、資料庫）
- Mock 耗時操作（檔案 I/O、網路）
- Mock 不確定性操作（時間、隨機）
```

---

## 反模式與修復

### 程式碼層級反模式

| 反模式 | 說明 | 影響 | 修復 |
|--------------|-------------|--------|-------------|
| **測試實作細節** | 測試私有方法或內部狀態 | 脆性測試，重構會破壞測試 | 僅測試公開行為 |
| **過度 Mock** | Mock 所有東西，失去真實性 | 虛假信心，正式環境出現 bug | 在 Mock 與真實元件間取得平衡 |
| **測試相互依賴** | 測試依賴執行順序 | 隨機失敗，難以隔離 | 每個測試設置自己的狀態 |
| **魔術數字/字串** | 未賦予意義的寫死數值 | 可讀性差，維護惡夢 | 使用具名常數、Builder |
| **缺少斷言** | 測試缺乏適當的斷言 | 偽陽性（假警報） | 每個測試都需要明確的斷言 |
| **不穩定測試 (Flaky Tests)** | 有時通過，有時失敗 | 侵蝕對測試套件的信任 | 消除時間/順序相依性 |
| **過大的 Arrange 區段** | 每個測試都有複雜的設置 | 難以理解、維護 | 將設置抽取至 Builder/Fixture |
| **測試中的條件邏輯** | 測試程式碼中出現 if/else | 多個測試混在同一個測試裡 | 拆分為獨立的測試 |
| **測試程式碼重複** | 許多測試中有一樣的設置 | 維護負擔 | 抽取共用設置 |
| **過度具體的斷言** | 斷言每一個欄位 | 脆性測試 | 僅斷言相關欄位 |
| **忽略測試失敗** | 跳過或註解掉失敗的測試 | 隱藏 bug | 修復或移除失敗的測試 |
| **測試第三方程式碼** | 測試函式庫/框架行為 | 浪費精力 | 信任第三方，測試自己的程式碼 |
| **單一龐大測試** | 單一測試涵蓋所有東西 | 難以診斷失敗原因 | 拆分為專注的小測試 |
| **無意義的測試名稱** | `test1`、`test2` | 無法理解 | 使用具描述性的名稱 |
| **捕捉所有例外** | 測試中使用 `catch (Exception e)` | 隱藏失敗 | 捕捉特定例外 |

### 流程層級反模式

| 反模式 | 說明 | 影響 | 修復 |
|--------------|-------------|--------|-------------|
| **跳過紅色階段** | 在寫測試之前先寫程式碼 | 失去 TDD 設計效益 | 紀律：始終先撰寫失敗的測試 |
| **跳過重構階段** | 從不清理程式碼 | 技術債累積 | 排定重構時間 |
| **後測開發 (TAD)** | 程式碼完成後才寫測試 | 非 TDD，錯失設計回饋 | 真正的 TDD：測試優先 |
| **大霹靂測試撰寫** | 一次寫完所有測試 | 難以招架，覆蓋率不佳 | 一次一個測試 |
| **100% 覆蓋率執念** | 盲目追求覆蓋率指標 | 毫無意義的測試 | 聚焦於行為覆蓋率 |
| **缺乏測試審查** | PR 中未審查測試 | 測試品質差 | 在程式碼審查中納入測試 |
| **延遲執行測試** | 不常執行測試 | 回饋太晚 | 持續執行測試 |
| **忽略緩慢測試** | 任由測試套件變慢 | 開發者跳過測試 | 最佳化或平行化 |
| **TDD 狂熱** | 在所有地方強推 TDD | 團隊感到沮喪 | 務實應用 TDD |
| **缺乏測試維護** | 任由測試腐爛 | 偽陽性/偽陰性 | 將測試視為正式環境程式碼 |

### 診斷與修復步驟

```
┌─────────────────────────────────────────────────────────────────┐
│           反模式診斷工作流程                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  症狀：重構時測試經常損壞                                       │
│  ├─ 可能原因：測試實作細節                                      │
│  └─ 修復：審查測試，確保僅測試行為                              │
│                                                                 │
│  症狀：測試通過但 bug 流入正式環境                              │
│  ├─ 可能原因：過度 Mock、缺少邊界情況                           │
│  └─ 修復：加入整合測試，審查覆蓋率缺口                          │
│                                                                 │
│  症狀：測試隨機失敗                                             │
│  ├─ 可能原因：測試相互依賴、時序問題                            │
│  └─ 修復：隔離測試，Mock 與時間相依的操作                       │
│                                                                 │
│  症狀：測試套件耗時過長                                         │
│  ├─ 可能原因：太多整合測試、緩慢的 I/O                          │
│  └─ 修復：提高單元測試比例、平行化執行                          │
│                                                                 │
│  症狀：團隊排斥寫測試                                           │
│  ├─ 可能原因：測試過於複雜、工具支援差                          │
│  └─ 修復：簡化測試設置，改善測試公用程式                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 語言/框架實踐

有關特定語言的詳細 TDD 範例，請參閱 TDD Assistant 技能：
- [Language Examples](../skills/tdd-assistant/language-examples.md)

### 依語言速查手冊

| 語言 | 測試框架 | Mock 函式庫 | BDD 工具 |
|----------|---------------|--------------|----------|
| **JavaScript/TypeScript** | Jest, Vitest | jest.mock, vitest.mock | Cucumber.js |
| **Python** | pytest, unittest | unittest.mock, pytest-mock | Behave |
| **C#** | xUnit, NUnit, MSTest | Moq, NSubstitute | SpecFlow |
| **Java** | JUnit 5, TestNG | Mockito, EasyMock | Cucumber-JVM |
| **Go** | testing | testify/mock | godog |
| **Ruby** | RSpec, minitest | rspec-mocks | Cucumber |

### 框架選擇指南

| 考量因素 | 建議 |
|---------------|----------------|
| **新專案** | 使用 IDE 支援最佳的框架 |
| **團隊經驗** | 使用團隊最熟悉的工具 |
| **現有程式碼庫** | 與現有測試框架一致 |
| **需要 BDD** | 選擇具備 BDD 整合支援的框架 |
| **速度關鍵** | 考量平行執行支援能力 |

---

## 指標與評估

### TDD 成熟度模型

| 等級 | 名稱 | 特徵 |
|-------|------|-----------------|
| **等級 0** | 無 TDD | 測試在寫完程式碼後才寫，甚至完全不寫 |
| **等級 1** | 測試優先 (Test-First) | 有時在寫程式碼之前先寫測試 |
| **等級 2** | TDD 實踐者 | 一貫遵循紅-綠-重構循環 |
| **等級 3** | TDD 專家 | 有效運用測試替身，測試乾淨俐落 |
| **等級 4** | TDD 大師 | TDD 驅動設計，指導他人 |

### 關鍵指標

| 指標 | 目標 | 警示門檻 |
|--------|--------|-------------------|
| **程式碼覆蓋率** | > 80% | < 60% |
| **測試與程式碼比例** | 1:1 至 2:1 | < 0.5:1 |
| **測試執行時間** | < 30 秒（單元測試） | > 2 分鐘 |
| **不穩定測試比例** | 0% | > 1% |
| **測試維護成本** | < 15% 開發時間 | > 30% |
| **缺陷逃逸率** | 下降中 | 上升中 |

### 評估檢查清單

```
團隊 TDD 評估：

□ 測試在生產程式碼之前撰寫
□ 遵循紅-綠-重構循環
□ 測試名稱清楚描述行為
□ 測試具備獨立性與可重複性
□ 測試套件執行快速（< 2 分鐘）
□ 無不穩定測試
□ 足夠的覆蓋率（> 80%）
□ 程式碼審查中包含測試審查
□ 定期進行重構
□ CI/CD 自動執行測試
```

---

## 相關標準

- [Testing Standards](../../core/testing-standards.md) - 核心測試標準 (UT/IT/ST/E2E)（或使用 `/testing-guide` 技能）
- [Test Completeness Dimensions](../../core/test-completeness-dimensions.md) - 八維度框架
- [Behavior-Driven Development](../../core/behavior-driven-development.md) - 採用 Given-When-Then 格式的 BDD 工作流程
- [Acceptance Test-Driven Development](../../core/acceptance-test-driven-development.md) - 包含規格工作坊的 ATDD 工作流程
- [Spec-Driven Development](../../core/spec-driven-development.md) - SDD 工作流程
- [Code Check-in Standards](../../core/checkin-standards.md) - 簽入要求
- [Code Review Checklist](../../core/code-review-checklist.md) - 審查指南

---

## 參考資料

### 書籍

- Kent Beck - "Test Driven Development: By Example" (2002)
- Robert C. Martin - "Clean Code" 第 9 章：單元測試 (2008)
- Michael Feathers - "Working Effectively with Legacy Code" (2004)
- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009)

### 標準

- [IEEE 29119 - 軟體測試標準](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0 - 第 5 章：軟體建構](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/)

### 線上資源

- [TDD by Example - Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Three Rules of TDD - Uncle Bob](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)
- [Double-Loop TDD - Samman Coaching](https://sammancoaching.org/learning_hours/bdd/double_loop_tdd.html) - 解說 BDD 外循環 / TDD 內循環模式
- [Approval Tests](https://approvaltests.com/)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.2.0 | 2026-01-25 | 新增：方法論分類章節（傳統開發方法論定位、與 SDD 的關係） |
| 1.1.0 | 2026-01-12 | 新增：完整程式碼壞味道目錄（基於 Martin Fowler《Refactoring》第 2 版，分為 5 大類共 22+ 種壞味道）、程式碼壞味道偵測檢查清單 |
| 1.0.0 | 2026-01-07 | 初始 TDD 標準定義 |

---

## 授權

本標準依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
