---
source: ../../core/test-driven-development.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-25
status: current
---

# 測試驅動開發 (TDD) 標準

**版本**: 1.2.0
**最後更新**: 2026-01-25
**適用範圍**: 所有採用測試驅動開發的專案
**範圍**: universal

> **語言**: [English](../../../../core/test-driven-development.md) | 繁體中文

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

TDD 是**傳統測試驅動開發家族**的一部分，源自極限編程 (XP) 和敏捷實踐。它不同於 **AI 時代 SDD (規格驅動開發)** 方法論。

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
│                    方法論關係                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   SDD 工作流程:                                              │
│   討論 → 提案 → 審查 → [實作] → 驗證    │
│                             ↑                                │
│                     TDD 可在此處使用                     │
│                     (選擇性，非必需)                 │
│                                                              │
│   傳統雙循環 TDD (GOOS):                        │
│   BDD (外層) → TDD (內層)                                  │
│                                                              │
│   SDD 透過正向推導生成測試工件,                        │
│   TDD 然後可用作起點。                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 何時使用 TDD

| 上下文 | 建議 |
|---------|----------------|
| **SDD 專案** | 在實作階段使用 TDD (選擇性) |
| **舊系統專案** | 對新功能和錯誤修復使用 TDD |
| **非 AI 開發** | 將 TDD 作為主要方法論 |
| **效能關鍵程式碼** | 使用 TDD 確保演算法正確性 |

**參考**: [規格驅動開發標準](../../core/spec-driven-development.md)

---

## 目錄

1. [TDD 核心循環](#tdd-核心循環)
2. [TDD 原則](#tdd-原則)
3. [適用場景指南](#適用場景指南)
4. [TDD vs BDD vs ATDD](#tdd-vs-bdd-vs-atdd)
5. [與 SDD 整合](#與-sdd-整合)
6. [TDD 工作流程](#tdd-工作流程)
7. [測試設計指南](#測試設計指南)
8. [重構策略](#重構策略)
9. [TDD 中的測試替身](#tdd-中的測試替身)
10. [反模式與修復](#反模式與修復)
11. [語言/框架實踐](#語言框架實踐)
12. [度量與評估](#度量與評估)
13. [相關標準](#相關標準)
14. [參考資料](#參考資料)
15. [版本歷史](#版本歷史)
16. [授權](#授權)

---

## TDD 核心循環

### 紅-綠-重構循環

TDD 遵循一個簡單但強大的迭代循環：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TDD 核心循環                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌─────────┐         ┌─────────┐         ┌─────────┐                   │
│      │  🔴 紅   │────────▶│ 🟢 綠   │────────▶│🔵 重構  │                   │
│      └─────────┘         └─────────┘         └─────────┘                   │
│           ▲                                        │                        │
│           │                                        │                        │
│           └────────────────────────────────────────┘                        │
│                                                                             │
│   🔴 紅色階段 (1-5 分鐘)                                                     │
│   ├─ 撰寫一個描述預期行為的失敗測試                                           │
│   ├─ 測試應該因為「正確的原因」而失敗                                         │
│   └─ 驗證測試確實失敗                                                        │
│                                                                             │
│   🟢 綠色階段 (1-10 分鐘)                                                    │
│   ├─ 撰寫「最少」的程式碼讓測試通過                                           │
│   ├─ 「先假裝，再實現」是可以接受的                                           │
│   └─ 不要過度設計；只要讓它能運作                                             │
│                                                                             │
│   🔵 重構階段 (5-15 分鐘)                                                    │
│   ├─ 在保持測試綠色的同時改善程式碼品質                                        │
│   ├─ 消除重複 (DRY)                                                         │
│   ├─ 改善命名、結構、可讀性                                                   │
│   └─ 每次重構步驟後執行測試                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 循環時間建議

| 階段 | 建議時間 | 警示訊號 |
|------|---------|---------|
| 🔴 紅 | 1-5 分鐘 | 若超過 10 分鐘，測試範圍太大 |
| 🟢 綠 | 1-10 分鐘 | 若超過 15 分鐘，需要分解問題 |
| 🔵 重構 | 5-15 分鐘 | 若跳過，技術債會累積 |

### 口訣

> **紅 → 綠 → 重構 → 重複**

每次迭代都應該很小。如果你發現自己在任何階段花費太長時間，測試可能太有野心了。

---

## TDD 原則

### FIRST 原則

高品質的測試遵循 FIRST 原則：

| 原則 | 說明 | 實踐指南 |
|------|------|---------|
| **F**ast (快速) | 測試應該快速執行 | 單元測試每個 < 100ms；總測試套件 < 10s |
| **I**ndependent (獨立) | 測試之間不互相依賴 | 無共享狀態；每個測試設置自己的資料 |
| **R**epeatable (可重複) | 每次執行結果相同 | 無隨機性；無時間依賴；無外部 I/O |
| **S**elf-validating (自我驗證) | 有明確的通過/失敗結果 | 不需手動檢查；明確的斷言 |
| **T**imely (及時) | 在生產程式碼之前撰寫 | 這是 TDD 的本質 |

### Uncle Bob 的 TDD 三規則

Robert C. Martin (Uncle Bob) 用三條嚴格的規則定義 TDD：

1. **規則一（紅色規則）**：除非是為了讓失敗的單元測試通過，否則不允許撰寫任何生產程式碼。

2. **規則二（測試規則）**：不允許撰寫超過足以失敗的單元測試；編譯失敗也算失敗。

3. **規則三（綠色規則）**：不允許撰寫超過足以讓當前失敗測試通過的生產程式碼。

### 測試的單一職責

每個測試應該驗證「一個」行為：

```
✅ 好：test_calculate_total_with_discount_applies_percentage()
❌ 差：test_calculate_total_and_tax_and_discount_and_shipping()
```

### 測試即文件

良好撰寫的測試可作為可執行的文件：

```
✅ 好的測試名稱：
- should_return_empty_list_when_no_users_found
- should_throw_validation_error_when_email_is_invalid
- should_calculate_discount_when_order_exceeds_threshold

❌ 差的測試名稱：
- test1
- testCalculate
- itWorks
```

---

## 適用場景指南

### TDD 場景適用性

| 場景 | 評分 | 說明 |
|------|------|------|
| **新功能開發** | ⭐⭐⭐⭐⭐ | TDD 最佳使用場景；設計從測試中浮現 |
| **Bug 修復** | ⭐⭐⭐⭐⭐ | 先撰寫失敗測試重現 bug |
| **API 設計** | ⭐⭐⭐⭐⭐ | 測試即 API 使用文件 |
| **核心業務邏輯** | ⭐⭐⭐⭐⭐ | 高價值程式碼必須有測試保護 |
| **演算法實現** | ⭐⭐⭐⭐ | 邊界情況多；TDD 幫助思考 |
| **重構現有程式碼** | ⭐⭐⭐⭐ | 先補測試，再安全重構 |
| **UI 組件** | ⭐⭐⭐ | 部分適用；可結合 BDD |
| **探索性原型** | ⭐⭐ | TDD 可能拖慢不確定的探索 |
| **一次性腳本** | ⭐ | 成本效益比低 |
| **第三方整合** | ⭐⭐ | 難以 Mock；改用整合測試 |

### 依專案類型的 TDD

| 專案類型 | TDD | BDD | ATDD | 建議 |
|---------|-----|-----|------|------|
| **新創 MVP** | ⚠️ 選擇性 | ✅ 推薦 | ❌ | 快速迭代優先 |
| **企業應用** | ✅ 推薦 | ✅ 推薦 | ✅ 推薦 | 品質與可維護性關鍵 |
| **開源專案** | ✅ 推薦 | ⚠️ 選擇性 | ❌ | 貢獻者需要測試文件 |
| **遺留系統改造** | ✅ 必要 | ⚠️ 選擇性 | ❌ | 使用 Golden Master 策略（見下方） |
| **微服務** | ✅ 推薦 | ✅ 推薦 | ✅ 推薦 | 契約測試重要 |
| **資料管線** | ⚠️ 選擇性 | ❌ | ❌ | 以整合測試為主 |
| **機器學習** | 🔶 視情況 | ❌ | ❌ | 見下方 ML 測試邊界 |

### 機器學習 (ML) 測試邊界

**重要**：ML 專案需要區分「模型效果」和「資料工程」：

| 面向 | TDD 適用性 | 說明 |
|------|-----------|------|
| **模型準確率** | ❌ 不適用 | 結果不確定性高；難以預先定義期望值 |
| **特徵處理** | ✅ 必須 | 避免 Garbage In, Garbage Out |
| **資料清洗** | ✅ 必須 | 資料品質直接影響模型效果 |
| **資料轉換** | ✅ 必須 | 確保轉換邏輯正確 |
| **管線整合** | ⚠️ 選擇性 | 以整合測試為主 |

### 遺留系統策略：Golden Master Testing（黃金大師測試）

**問題**：在沒有測試的遺留系統中，「補測試」本身就有破壞現有邏輯的風險。

**Golden Master Testing 工作流程**：

```
┌─────────────────────────────────────────────────────────────────┐
│           Golden Master Testing 工作流程                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  錄製階段（不修改程式碼）                                    │
│      ├─ 對系統執行大量輸入                                       │
│      ├─ 記錄所有輸出作為「黃金基準」                              │
│      └─ 使用自動化工具或 AI 生成測試案例                          │
│                                                                 │
│  2️⃣  驗證階段                                                    │
│      ├─ 建立 Snapshot/Approval 測試                              │
│      └─ 確保重構前後輸出一致                                     │
│                                                                 │
│  3️⃣  重構階段                                                    │
│      ├─ 在 Golden Master 保護下安全重構                          │
│      ├─ 每次修改後執行 Golden Master 測試                        │
│      └─ 逐步將 Golden Master 轉換為正式的單元測試                 │
│                                                                 │
│  4️⃣  演進階段                                                    │
│      └─ 新功能使用標準 TDD                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**工具支援**：
- ApprovalTests（多語言支援）
- Jest Snapshot Testing
- Python: pytest-snapshot
- AI 輔助測試輸入生成

### 決策樹

```
需求來源？
├─ 技術需求（效能、重構）→ TDD
├─ 業務需求
│   ├─ 有明確驗收標準？
│   │   ├─ 是 → ATDD → BDD → TDD
│   │   └─ 否 → BDD → TDD
│   └─ 複雜業務流程？
│       ├─ 是 → BDD（場景描述）→ TDD
│       └─ 否 → TDD
└─ 探索性/原型 → 暫時跳過 TDD
```

---

## TDD vs BDD vs ATDD

### 比較概覽

| 面向 | TDD | BDD | ATDD |
|------|-----|-----|------|
| **焦點** | 程式碼單元 | 行為 | 驗收標準 |
| **語言** | 程式碼 | 自然語言 (Gherkin) | 業務語言 |
| **參與者** | 開發者 | 開發者 + BA + QA | 全團隊 + 利益相關者 |
| **測試層級** | 單元/整合 | 功能/場景 | 系統/驗收 |
| **工具** | xUnit 框架 | Cucumber, Behave, SpecFlow | FitNesse, Concordion |
| **時機** | 編碼期間 | 編碼之前 | 開發開始之前 |

### 整合金字塔

```
┌─────────────────────────────────────────────────────────────────┐
│              完整的測試驅動開發堆疊                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   需求層       ATDD - 驗收測試驅動開發                           │
│               （接收業務驗收標準）                                │
│                        ↓                                        │
│   規格層       SDD - 規格驅動開發                                │
│               （正式規格、驗收條件）                              │
│                        ↓                                        │
│   功能層       BDD - 行為驅動開發                                │
│               （場景 → Step Definitions）                        │
│                        ↓                                        │
│   開發層       TDD - 測試驅動開發                                │
│               （單元測試 → 程式碼）                               │
│                        ↓                                        │
│   整合層       整合與系統測試                                     │
│                                                                 │
│   關鍵：ATDD → SDD → BDD → TDD → 整合測試（自上而下）            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### BDD Gherkin 語法概覽

```gherkin
Feature: 使用者登入
  作為一個註冊使用者
  我想要登入我的帳號
  以便我可以存取我的個人化內容

  Scenario: 使用有效憑證成功登入
    Given 我在登入頁面
    And 我有一個註冊帳號，電子郵件為 "user@example.com"
    When 我輸入電子郵件 "user@example.com"
    And 我輸入密碼 "correctpassword"
    And 我點擊登入按鈕
    Then 我應該被重新導向到儀表板
    And 我應該看到包含我名字的歡迎訊息

  Scenario: 使用無效密碼登入失敗
    Given 我在登入頁面
    When 我輸入電子郵件 "user@example.com"
    And 我輸入密碼 "wrongpassword"
    And 我點擊登入按鈕
    Then 我應該看到錯誤訊息 "無效的憑證"
    And 我應該保持在登入頁面
```

### ATDD 驗收標準格式

```markdown
## 功能：購物車結帳

### 驗收標準：

**AC-1：計算訂單總額**
- GIVEN 購物車中有價格為 [$10, $20, $15] 的商品
- WHEN 使用者進行結帳
- THEN 總額應為 $45

**AC-2：套用折扣碼**
- GIVEN 購物車總額為 $100
- AND 有效的折扣碼 "SAVE20" 為 20% 折扣
- WHEN 使用者套用折扣碼
- THEN 總額應為 $80

**AC-3：驗證最低訂單金額**
- GIVEN 購物車總額低於 $25
- WHEN 使用者嘗試結帳
- THEN 系統應顯示「最低訂單金額為 $25」錯誤
```

### 選擇正確的方法

| 使用案例 | 主要方法 | 輔助方法 |
|---------|---------|---------|
| 演算法實現 | TDD | - |
| 使用者驗證流程 | BDD | TDD |
| 支付處理 | ATDD | BDD + TDD |
| API 端點 | TDD | BDD 用於整合 |
| UI 組件 | BDD | TDD 用於邏輯 |
| 業務規則驗證 | ATDD | TDD |
| 效能優化 | TDD | - |
| 外部服務整合 | TDD | BDD 用於契約 |

---

## 與 SDD 整合

### SDD + TDD 統一工作流程

規格驅動開發 (SDD) 和測試驅動開發 (TDD) 是互補的：

- **SDD**：「規格優先，程式碼其次」- 定義要建構「什麼」
- **TDD**：「測試優先，程式碼其次」- 定義如何「驗證」

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SDD + TDD 整合工作流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  SDD：提案階段                                                          │
│      ├─ 撰寫 Spec：定義功能、驗收標準、邊界情況                               │
│      ├─ 包含驗收標準（轉換為 ATDD 場景）                                      │
│      └─ 取得利益相關者批准                                                    │
│         (Spec ID: SPEC-001)                                                 │
│                                                                             │
│  2️⃣  TDD：紅色階段                                                          │
│      ├─ 基於 Spec 的驗收標準撰寫測試                                         │
│      ├─ 撰寫描述預期行為的失敗測試                                           │
│      ├─ 測試實現 Spec：一個標準 = 多個測試                                   │
│      └─ 在測試文件註解中參考 SPEC-001                                        │
│                                                                             │
│  3️⃣  TDD：綠色 + 重構階段                                                   │
│      ├─ 迭代開發，一次實現一個小功能                                         │
│      ├─ 測試通過後重構                                                       │
│      └─ 保持所有 Spec 驗收標準測試通過                                       │
│                                                                             │
│  4️⃣  SDD：驗證階段                                                          │
│      ├─ 確認實現與 Spec 相符                                                 │
│      ├─ 驗收測試套件通過                                                     │
│      └─ 所有驗收標準已實現 ✓                                                 │
│                                                                             │
│  5️⃣  提交 PR 和撰寫提交訊息                                                  │
│      ├─ Commit: "feat(auth): implement login"                               │
│      ├─ Body: "Implements SPEC-001 with OAuth2"                             │
│      ├─ Refs: SPEC-001                                                      │
│      └─ 包含測試覆蓋率報告                                                   │
│                                                                             │
│  6️⃣  SDD：歸檔階段                                                          │
│      └─ 歸檔 Spec，連結到 PR/提交                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 將 Spec 驗收標準對應到 TDD 測試

| Spec 驗收標準 | TDD 測試 |
|--------------|----------|
| 「使用者可以用有效憑證登入」 | `test_login_with_valid_credentials_succeeds()` |
| 「無效密碼顯示錯誤」 | `test_login_with_invalid_password_shows_error()` |
| 「3 次失敗嘗試後帳號鎖定」 | `test_account_locks_after_three_failed_attempts()` |
| 「鎖定的帳號無法登入」 | `test_locked_account_cannot_login()` |

### 在測試中參考 Spec

```typescript
/**
 * SPEC-001：使用者驗證 的測試
 * @see specs/SPEC-001-user-authentication.md
 */
describe('使用者驗證 (SPEC-001)', () => {
  // AC-1：使用者可以用有效憑證登入
  test('should login successfully with valid credentials', async () => {
    // ...
  });

  // AC-2：無效密碼顯示錯誤
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
│              個人 TDD 工作階段流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 理解需求                                                     │
│     ├─ 閱讀 spec/使用者故事                                      │
│     └─ 識別驗收標準                                              │
│                                                                 │
│  2. 列出測試案例（紙上或 TODO 註解）                               │
│     ├─ 快樂路徑場景                                              │
│     ├─ 邊界情況                                                  │
│     ├─ 錯誤場景                                                  │
│     └─ 邊界條件                                                  │
│                                                                 │
│  3. 選擇最簡單的測試案例                                          │
│     └─ 從最基本的快樂路徑開始                                     │
│                                                                 │
│  4. 紅色：撰寫測試                                                │
│     ├─ 使用清晰的 Arrange-Act-Assert 撰寫測試                    │
│     ├─ 使用描述性的測試名稱                                       │
│     └─ 執行測試，驗證它失敗                                       │
│                                                                 │
│  5. 綠色：讓它通過                                                │
│     ├─ 撰寫最少的程式碼讓測試通過                                 │
│     ├─ 「假裝」是可以接受的                                       │
│     └─ 執行測試，驗證它通過                                       │
│                                                                 │
│  6. 重構：清理                                                    │
│     ├─ 消除重複                                                  │
│     ├─ 改善命名                                                  │
│     ├─ 提取方法/函式                                             │
│     └─ 每次變更後執行所有測試                                     │
│                                                                 │
│  7. 從步驟 3 重複，直到所有測試完成                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 團隊層級 TDD

#### 使用 TDD 的結對程式設計

**乒乓模式**：
1. 開發者 A 撰寫一個失敗的測試
2. 開發者 B 撰寫程式碼讓測試通過
3. 開發者 B 撰寫下一個失敗的測試
4. 開發者 A 撰寫程式碼讓測試通過
5. 任一開發者可以隨時重構
6. 重複

**駕駛員-領航員模式**：
1. 領航員思考設計和測試案例
2. 駕駛員撰寫測試和程式碼
3. 每 15-30 分鐘交換角色

#### 使用 TDD 的群體程式設計

- 一個駕駛員（打字），多個領航員（指導）
- 每 5-10 分鐘輪換駕駛員
- 集體決定測試案例和實現
- 透過多元視角獲得更高品質

### CI/CD 整合

```yaml
# TDD 的 GitHub Actions 工作流程範例
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
  // Arrange - 設置測試資料和依賴
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.setDiscountCode('SAVE20'); // 20% 折扣

  // Act - 執行被測試的行為
  const total = cart.calculateTotal();

  // Assert - 驗證結果
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
| `should_[行為]_when_[條件]` | `should_return_error_when_email_invalid` |
| `[方法]_[場景]_[預期]` | `calculateTotal_withDiscount_returnsReducedPrice` |
| `test_[方法]_[場景]_[預期]` | `test_login_invalidPassword_throwsError` |
| `it_[做某事]` | `it_calculates_total_correctly` |

### 測試資料最佳實踐

```typescript
// ✅ 好：清晰、有意義的測試資料
const validUser = {
  email: 'john.doe@example.com',
  password: 'SecureP@ss123',
  role: 'admin'
};

// ❌ 差：沒有上下文的魔術字串
const user = {
  email: 'a@b.c',
  password: '123',
  role: 'x'
};

// ✅ 好：使用測試資料建構器
const user = UserBuilder.create()
  .withEmail('john.doe@example.com')
  .withRole('admin')
  .build();

// ✅ 好：使用常數表示邊界值
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

test('should reject password exceeding max length', () => {
  const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
  expect(() => validatePassword(longPassword)).toThrow();
});
```

### 測試邊界情況

確保測試涵蓋 [測試完整性維度](../../core/test-completeness-dimensions.md) 定義的所有八個維度。這些維度包括：快樂路徑、邊界條件、錯誤處理、授權、狀態變化、驗證、整合，以及 AI 生成品質（適用時）。

請使用該文件中的檢查清單來驗證每個功能的覆蓋率。

---

## 重構策略

### 何時重構

當你看到以下情況時進行重構：

- **重複**：相同的程式碼出現在多個地方
- **過長方法**：函式做太多事
- **命名不佳**：不清楚的變數/函式名稱
- **複雜條件**：巢狀的 if/else 鏈
- **功能嫉妒**：方法過度使用另一個類別的資料
- **資料團塊**：相同的資料群組一起出現

### 安全重構檢查清單

```
重構前：
□ 所有測試都通過（綠色）
□ 有足夠的測試覆蓋
□ 你理解程式碼在做什麼

重構中：
□ 一次只做「一個」小變更
□ 「每次」變更後執行測試
□ 如果測試失敗，立即復原
□ 重構時不要新增功能

重構後：
□ 所有測試仍然通過
□ 程式碼更乾淨/簡單
□ 沒有新增功能
```

### 常見重構技術

| 技術 | 使用時機 | 範例 |
|------|---------|------|
| **提取方法** | 過長方法、重複程式碼 | 提取 10 行到 `calculateDiscount()` |
| **重新命名** | 不清楚的名稱 | `calc()` → `calculateOrderTotal()` |
| **內聯** | 過度抽象 | 移除不必要的包裝函式 |
| **提取變數** | 複雜表達式 | `const isEligible = age >= 18 && hasLicense` |
| **用多型取代條件** | 複雜的 switch/if 鏈 | 使用策略模式 |
| **引入參數物件** | 太多參數 | `(x, y, width, height)` → `Rectangle rect` |

### 程式碼異味目錄

根據 Martin Fowler 的《Refactoring》（第二版），程式碼異味分為五大類別：

#### 1. 膨脹型（Bloaters）

| 異味 | 說明 | 重構方式 |
|------|------|---------|
| **Long Method（過長方法）** | 方法超過 20 行，做太多事 | Extract Method、Replace Temp with Query、Introduce Parameter Object、Preserve Whole Object、Replace Method with Method Object |
| **Large Class（過大類別）** | 類別有太多職責 | Extract Class、Extract Subclass、Extract Interface、Duplicate Observed Data |
| **Primitive Obsession（基本型別偏執）** | 過度使用基本型別而非小物件 | Replace Data Value with Object、Replace Type Code with Class/Subclass/Strategy、Extract Class、Introduce Parameter Object |
| **Long Parameter List（過長參數列表）** | 方法有太多參數（>3-4 個） | Replace Parameter with Method Call、Preserve Whole Object、Introduce Parameter Object |
| **Data Clumps（資料泥團）** | 相同的資料群組一起出現 | Extract Class、Introduce Parameter Object、Preserve Whole Object |

#### 2. 物件導向濫用者（OO Abusers）

| 異味 | 說明 | 重構方式 |
|------|------|---------|
| **Switch Statements（Switch 語句）** | 複雜的 switch/case 或 if/else 鏈 | Replace Type Code with Subclasses、Replace Conditional with Polymorphism、Replace Parameter with Explicit Methods、Introduce Null Object |
| **Temporary Field（暫時欄位）** | 只在某些情況下有值的欄位 | Extract Class、Introduce Null Object |
| **Refused Bequest（被拒絕的遺產）** | 子類別不使用繼承的方法/資料 | Replace Inheritance with Delegation、Push Down Method/Field |
| **Alternative Classes with Different Interfaces（介面不同的替代類別）** | 做相同事情但有不同介面的類別 | Rename Method、Move Method、Extract Superclass |
| **Parallel Inheritance Hierarchies（平行繼承階層）** | 每次建立一個類別的子類別就需要建立另一個類別的子類別 | Move Method、Move Field 合併階層 |

#### 3. 變更阻礙者（Change Preventers）

| 異味 | 說明 | 重構方式 |
|------|------|---------|
| **Divergent Change（發散式變更）** | 一個類別因不同原因經常被修改 | Extract Class 分離不同的關注點 |
| **Shotgun Surgery（散彈槍手術）** | 一個變更需要修改多個類別 | Move Method、Move Field、Inline Class 合併相關行為 |
| **Parallel Inheritance Hierarchies（平行繼承階層）** | 每次建立一個類別的子類別就需要建立另一個 | Move Method、Move Field |

#### 4. 可有可無者（Dispensables）

| 異味 | 說明 | 重構方式 |
|------|------|---------|
| **Lazy Class（懶惰類別）** | 做太少事的類別 | Inline Class、Collapse Hierarchy |
| **Data Class（資料類別）** | 只有欄位和 getter/setter 的類別 | Move Method、Encapsulate Field、Encapsulate Collection |
| **Duplicate Code（重複程式碼）** | 相同程式碼在多處出現 | Extract Method、Extract Class、Pull Up Method、Form Template Method |
| **Dead Code（死碼）** | 未使用的程式碼 | 刪除未使用的程式碼 |
| **Speculative Generality（推測式通用性）** | 為「未來可能需要」建立的未使用抽象 | Collapse Hierarchy、Inline Class、Remove Parameter、Rename Method |
| **Comments（註解）** | 用於解釋難懂程式碼的過多註解 | Extract Method、Rename Method、Introduce Assertion（讓程式碼自我說明） |

#### 5. 耦合者（Couplers）

| 異味 | 說明 | 重構方式 |
|------|------|---------|
| **Feature Envy（功能嫉妒）** | 方法過度使用另一個類別的資料 | Move Method、Extract Method |
| **Inappropriate Intimacy（不當親密）** | 類別過度存取彼此的內部 | Move Method、Move Field、Change Bidirectional to Unidirectional、Extract Class、Hide Delegate |
| **Message Chains（訊息鏈）** | 一連串的 getThis().getThat().getOther() | Hide Delegate、Extract Method、Move Method |
| **Middle Man（中間人）** | 類別的大部分方法只是委派給另一個類別 | Remove Middle Man、Inline Method、Replace Delegation with Inheritance |
| **Incomplete Library Class（不完整的函式庫類別）** | 函式庫類別缺少你需要的功能 | Introduce Foreign Method、Introduce Local Extension |

#### 快速診斷表

```
┌─────────────────────────────────────────────────────────────────┐
│              程式碼異味快速診斷                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  症狀                          可能的異味                        │
│  ─────────────────────────────────────────────                  │
│  方法太長（>20 行）             Long Method                      │
│  類別太大（>200 行）            Large Class                      │
│  太多參數（>4 個）              Long Parameter List              │
│  重複程式碼                     Duplicate Code                   │
│  複雜的 if/else 或 switch       Switch Statements                │
│  過度使用基本型別               Primitive Obsession              │
│  一個變更影響多處               Shotgun Surgery                  │
│  一個類別因多種原因變更         Divergent Change                 │
│  方法使用別的類別資料           Feature Envy                     │
│  長串的方法呼叫                 Message Chains                   │
│  類別只委派給另一個類別         Middle Man                       │
│  只有 getter/setter 的類別     Data Class                       │
│  未使用的程式碼或類別           Dead Code / Lazy Class           │
│  解釋程式碼的大量註解           Comments                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TDD 中的測試替身

### 測試替身類型

| 類型 | 目的 | 使用時機 |
|------|------|---------|
| **Dummy** | 填充參數列表 | 必要參數但測試中未使用 |
| **Stub** | 回傳預定義的值 | 模擬特定場景 |
| **Spy** | 記錄互動 | 驗證方法是否被呼叫 |
| **Mock** | 驗證互動 + 回傳值 | 測試行為和協作 |
| **Fake** | 簡化的實作 | 記憶體內資料庫 |

### 依測試層級的測試替身使用

| 層級 | 建議的替身 |
|------|-----------|
| **單元測試** | 所有外部依賴使用 Mock、Stub |
| **整合測試** | DB 使用 Fake，外部 API 使用 Stub |
| **系統測試** | 真實元件，只有外部服務使用 Fake |
| **E2E 測試** | 全部使用真實 |

### 範例：使用 Mock 和 Stub

```typescript
// Stub 範例 - 預定義的回傳值
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

  // 驗證 mock 是否使用正確的參數被呼叫
  expect(emailService.sendConfirmation).toHaveBeenCalledWith(
    'user@example.com',
    expect.objectContaining({ transactionId: 'TXN123' })
  );
});
```

### 避免過度 Mock

```
❌ 過度 mock（測試實作細節）：
- Mock 私有方法
- Mock 每一個依賴
- 驗證每一個內部方法呼叫

✅ 適當的 mock：
- Mock 外部服務（API、資料庫）
- Mock 慢速操作（檔案 I/O、網路）
- Mock 非確定性操作（時間、隨機）
```

---

## 反模式與修復

### 程式碼層級反模式

| 反模式 | 說明 | 影響 | 修復方式 |
|--------|------|------|---------|
| **測試實作細節** | 測試私有方法或內部狀態 | 脆弱的測試，重構會破壞測試 | 只測試公開行為 |
| **過度 Mock** | Mock 所有東西，失去真實性 | 虛假的信心，bug 進入生產環境 | 平衡 mock 和真實元件 |
| **測試相依性** | 測試依賴執行順序 | 隨機失敗，難以隔離 | 每個測試設置自己的狀態 |
| **魔術數字/字串** | 沒有意義的硬編碼值 | 可讀性差，維護噩夢 | 使用命名常數、建構器 |
| **缺少斷言** | 測試沒有適當的斷言 | 假陽性 | 每個測試需要明確的斷言 |
| **不穩定測試** | 有時通過，有時失敗 | 對測試套件信任度降低 | 消除時間/順序依賴 |
| **過大的 Arrange 區塊** | 每個測試都有複雜設置 | 難以理解、維護 | 提取設置到建構器/fixtures |
| **測試中的條件邏輯** | 測試程式碼中的 if/else | 一個測試中有多個測試 | 分割成獨立的測試 |
| **測試程式碼重複** | 許多測試中相同的設置 | 維護負擔 | 提取共享設置 |
| **過於特定的斷言** | 斷言每一個欄位 | 脆弱的測試 | 只斷言相關欄位 |
| **忽略測試失敗** | 跳過或註解掉失敗的測試 | 隱藏的 bug | 修復或移除失敗的測試 |
| **測試第三方程式碼** | 測試程式庫/框架行為 | 浪費努力 | 信任第三方，測試你的程式碼 |
| **一個巨大的測試** | 單一測試涵蓋所有 | 難以診斷失敗 | 分割成聚焦的測試 |
| **沒有測試名稱** | `test1`、`test2` | 無法理解 | 使用描述性名稱 |
| **捕獲所有例外** | 測試中的 `catch (Exception e)` | 隱藏的失敗 | 捕獲特定例外 |

### 流程層級反模式

| 反模式 | 說明 | 影響 | 修復方式 |
|--------|------|------|---------|
| **跳過紅色階段** | 在測試之前寫程式碼 | 失去 TDD 設計優點 | 紀律：始終先寫失敗的測試 |
| **跳過重構階段** | 從不清理 | 技術債累積 | 安排重構時間 |
| **開發後測試 (TAD)** | 程式碼完成後才寫測試 | 不是 TDD，錯過設計回饋 | 真正的 TDD：測試優先 |
| **一次寫所有測試** | 同時寫所有測試 | 不堪負荷，覆蓋率差 | 一次一個測試 |
| **100% 覆蓋率迷思** | 追求覆蓋率指標 | 無意義的測試 | 專注於行為覆蓋 |
| **不審查測試** | PR 中不審查測試 | 測試品質差 | 在程式碼審查中包含測試 |
| **延遲執行測試** | 不常執行測試 | 回饋延遲 | 持續執行測試 |
| **忽略慢速測試** | 讓測試套件變慢 | 開發者跳過測試 | 優化或並行化 |
| **TDD 狂熱** | 到處強制使用 TDD | 團隊挫敗 | 務實地應用 TDD |
| **不維護測試** | 讓測試腐敗 | 假陽性/假陰性 | 將測試視為生產程式碼 |

### 診斷與修復步驟

```
┌─────────────────────────────────────────────────────────────────┐
│           反模式診斷工作流程                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  症狀：重構時測試經常失敗                                         │
│  ├─ 可能原因：測試實作細節                                        │
│  └─ 修復：審查測試，確保只測試行為                                 │
│                                                                 │
│  症狀：測試通過但 bug 進入生產環境                                 │
│  ├─ 可能原因：過度 mock，缺少邊界情況                              │
│  └─ 修復：新增整合測試，審查覆蓋差距                               │
│                                                                 │
│  症狀：測試隨機失敗                                               │
│  ├─ 可能原因：測試相依性，時間問題                                 │
│  └─ 修復：隔離測試，mock 時間相關操作                              │
│                                                                 │
│  症狀：測試套件執行時間太長                                        │
│  ├─ 可能原因：整合測試太多，慢速 I/O                               │
│  └─ 修復：增加單元測試比例，並行化                                 │
│                                                                 │
│  症狀：團隊迴避寫測試                                             │
│  ├─ 可能原因：測試太複雜，工具不佳                                 │
│  └─ 修復：簡化測試設置，改善測試工具                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 語言/框架實踐

詳細的語言特定 TDD 範例，請參閱 TDD Assistant skill：
- [語言範例](../skills/tdd-assistant/language-examples.md)

### 依語言快速參考

| 語言 | 測試框架 | Mock 程式庫 | BDD 工具 |
|------|---------|------------|---------|
| **JavaScript/TypeScript** | Jest, Vitest | jest.mock, vitest.mock | Cucumber.js |
| **Python** | pytest, unittest | unittest.mock, pytest-mock | Behave |
| **C#** | xUnit, NUnit, MSTest | Moq, NSubstitute | SpecFlow |
| **Java** | JUnit 5, TestNG | Mockito, EasyMock | Cucumber-JVM |
| **Go** | testing | testify/mock | godog |
| **Ruby** | RSpec, minitest | rspec-mocks | Cucumber |

### 框架選擇指南

| 考量 | 建議 |
|------|------|
| **新專案** | 使用 IDE 支援最好的框架 |
| **團隊經驗** | 使用團隊最熟悉的 |
| **現有程式碼庫** | 匹配現有測試框架 |
| **需要 BDD** | 選擇有 BDD 整合的框架 |
| **速度關鍵** | 考慮並行執行支援 |

---

## 度量與評估

### TDD 成熟度模型

| 層級 | 名稱 | 特徵 |
|------|------|------|
| **Level 0** | 無 TDD | 程式碼之後寫測試（如果有的話） |
| **Level 1** | 測試優先 | 有時在程式碼之前寫測試 |
| **Level 2** | TDD 實踐者 | 一致的紅-綠-重構循環 |
| **Level 3** | TDD 專家 | 有效的測試替身，乾淨的測試 |
| **Level 4** | TDD 大師 | TDD 驅動設計，指導他人 |

### 關鍵指標

| 指標 | 目標 | 警示閾值 |
|------|------|---------|
| **程式碼覆蓋率** | > 80% | < 60% |
| **測試對程式碼比** | 1:1 到 2:1 | < 0.5:1 |
| **測試執行時間** | < 30 秒（單元） | > 2 分鐘 |
| **不穩定測試率** | 0% | > 1% |
| **測試維護成本** | < 15% 開發時間 | > 30% |
| **缺陷逃逸率** | 下降中 | 上升中 |

### 評估檢查清單

```
團隊 TDD 評估：

□ 在生產程式碼之前寫測試
□ 遵循紅-綠-重構循環
□ 測試名稱清楚描述行為
□ 測試是獨立且可重複的
□ 測試套件執行快速（< 2 分鐘）
□ 沒有不穩定的測試
□ 足夠的覆蓋率（> 80%）
□ 程式碼審查中審查測試
□ 定期進行重構
□ CI/CD 自動執行測試
```

---

## 相關標準

- [重構標準](../../core/refactoring-standards.md) - 完整重構指南（遺留程式碼策略、大規模模式、度量指標）
- [測試標準](../../core/testing-standards.md) - 核心測試標準（UT/IT/ST/E2E）（或使用 `/testing-guide` 技能）
- [測試完整性維度](../../core/test-completeness-dimensions.md) - 8 維度框架
- [規格驅動開發](../../core/spec-driven-development.md) - SDD 工作流程
- [程式碼入庫標準](../../core/checkin-standards.md) - 入庫要求
- [程式碼審查檢查清單](../../core/code-review-checklist.md) - 審查指南

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
- [ISTQB 認證測試員基礎級](https://www.istqb.org/)

### 線上資源

- [TDD by Example - Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Three Rules of TDD - Uncle Bob](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)
- [Approval Tests](https://approvaltests.com/)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.2.0 | 2026-01-25 | 新增：方法論分類章節，明確 TDD 與 SDD 的關係、歷史背景、使用上下文 |
| 1.1.0 | 2026-01-12 | 新增：完整程式碼異味目錄（22+ 種異味，分為 5 大類別），基於 Martin Fowler《Refactoring》第二版 |
| 1.0.0 | 2026-01-07 | 初始 TDD 標準定義 |

---

## 授權

本標準依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
