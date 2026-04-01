# 測試標準

> **Language**: [English](../../../core/testing-standards.md) | 繁體中文

**版本**: 3.1.0
**最後更新**: 2026-03-25
**適用範圍**: 所有軟體專案
**Scope**: universal
**產業標準**: ISTQB CTFL v4.0, ISO/IEC/IEEE 29119
**參考資料**: [istqb.org](https://istqb.org/)

---

## 目的

本標準定義可操作的測試規則與慣例，供 AI 代理與開發人員使用。如需理論基礎、教育內容與詳細範例，請參閱 [測試理論知識庫](../../../skills/testing-guide/testing-theory.md)。

**參考標準**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering)

---

## 術語表

| 縮寫 | 全名 | 說明 |
|------|------|------|
| **UT** | Unit Testing | 獨立測試個別函式/方法 |
| **IT** | Integration Testing | 測試元件之間的互動 |
| **ST** | System Testing | 測試完整的整合系統 |
| **AT** | Acceptance Testing | 依據業務驗收標準進行測試 |
| **E2E** | End-to-End Testing | 測試完整的使用者工作流程 |
| **UAT** | User Acceptance Testing | 由終端使用者執行的驗收測試 |
| **SIT** | System Integration Testing | 測試多個系統的整合 |

> **注意**: 本文件中的 "IT" 一律指 "Integration Testing"（整合測試），而非 "Information Technology"（資訊科技）。

---

## 覆蓋率目標（主要指標）

> **Coverage is the primary metric for test quality.** Higher coverage means more code is protected by tests.
> **覆蓋率是測試品質的主要指標。** 更高的覆蓋率代表更多程式碼受到測試保護。

| 指標 | 最低要求 | 標準 | 理想 |
|------|---------|------|------|
| **行覆蓋率 (Line Coverage)** | 80% | 90% | 95%+ |
| **分支覆蓋率 (Branch Coverage)** | 70% | 85% | 90%+ |
| **函式覆蓋率 (Function Coverage)** | 85% | 95% | 100% |
| **突變分數 (Mutation Score)** | — | 80% | 90%+（關鍵程式碼） |

**層級定義：**
- **最低要求**: 所有專案的基準線 — 低於此值即為品質風險
- **標準**: 大多數專案的目標 — 透過紀律化的測試即可達成
- **理想**: 關鍵系統與核心業務邏輯的目標 — 在可行的情況下追求 100%

> **實務指引**: 100% 覆蓋率是理想目標。實務上，行覆蓋率達到 95% 以上時會出現邊際效益遞減。最後的 5% 應集中在關鍵路徑（認證、支付、資料完整性），而非自動產生的程式碼或簡單的 getter/setter。

---

## 覆蓋率與佔比 — 關鍵區別

> **AI 代理與開發人員：請勿混淆這兩個概念。**

| 概念 | 意義 | 重要性 |
|------|------|--------|
| **覆蓋率（Coverage）** | 測試所執行的程式碼百分比 | **主要指標** — 衡量保護程度 |
| **佔比（Ratio）** | 各層級測試數量的分布 | 僅供參考 — 影響執行時間 |

**覆蓋率**回答的問題是：「我的程式碼有多少被測試了？」
**佔比**回答的問題是：「我的測試中，單元測試、整合測試、E2E 測試各佔多少比例？」

---

## 測試框架選擇

| 框架 | 層級 | 最適用於 |
|------|------|---------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企業級、法規遵循、正式 QA |
| **業界金字塔** | UT → IT → ST → E2E | 敏捷、DevOps、CI/CD |

---

## 測試金字塔（測試數量佔比 — 僅供參考）

> **注意**: 以下為測試**數量**佔比（各層級有多少測試），而非覆蓋率目標。覆蓋率要求請參閱上方的[覆蓋率目標](#覆蓋率目標主要指標)。

| 層級 | 測試數量佔比 | 執行時間目標 |
|------|-------------|-------------|
| 單元測試 (UT) | 約 70% 的測試 | < 10 分鐘 |
| 整合測試 (IT) | 約 20% 的測試 | < 30 分鐘 |
| 系統測試 (ST) | 約 7% 的測試 | < 1 小時 |
| E2E 測試 | 約 3% 的測試 | < 2 小時 |

> 70/20/7/3 的比例為經驗法則建議（Mike Cohn）。其目的在於最佳化回饋速度 — 大部分測試快速執行（UT），較少測試緩慢執行（E2E）。

---

## 測試層級要求

### 單元測試 (UT)

**特性**: 隔離、快速（每個 < 100ms）、確定性

#### 範圍

| 包含 | 排除 |
|------|------|
| 單一函式/方法 | 資料庫查詢 |
| 單一類別 | 外部 API 呼叫 |
| 純業務邏輯 | 檔案 I/O 操作 |
| 資料轉換 | 多類別互動 |
| 驗證規則 | 網路呼叫 |

#### 命名慣例

**檔案命名**:
```
[ClassName]Tests.[ext]      # C#
[ClassName].test.[ext]      # TypeScript/JavaScript
[class_name]_test.[ext]     # Python, Go
```

**方法命名**（每個專案選擇一種）:

| 風格 | 最適用於 | 範例 |
|------|---------|------|
| `[Method]_[Scenario]_[Result]` | C#, Java | `CalculateTotal_NegativePrice_ThrowsException()` |
| `should_[behavior]_when_[condition]` | JavaScript/TypeScript | `should_reject_login_when_account_locked()` |
| `test_[method]_[scenario]_[expected]` | Python (pytest) | `test_validate_email_invalid_format_returns_false()` |

#### 覆蓋率門檻

> 請參閱本文件頂部的[覆蓋率目標](#覆蓋率目標主要指標)以取得權威的覆蓋率要求。

---

### 整合測試 (IT)

**特性**: 元件整合、真實相依性（通常容器化）、每個 1-10 秒

#### 何時需要

**決策規則**: 若您的單元測試使用萬用匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`）來處理查詢/過濾參數，該功能**必須**有整合測試。

| 情境 | 原因 |
|------|------|
| 查詢述詞 | Mock 無法驗證過濾表達式 |
| 實體關係 | 驗證外鍵正確性 |
| 複合鍵 | 記憶體資料庫可能與真實資料庫不同 |
| 欄位對應 | DTO ↔ Entity 轉換 |
| 分頁 | 列排序與計數 |
| 交易 | 回滾行為 |

#### 範圍

| 包含 | 排除 |
|------|------|
| 資料庫 CRUD 操作 | 完整使用者工作流程 |
| Repository + 資料庫 | 跨服務通訊 |
| Service + Repository | UI 互動 |
| API 端點 + Service 層 | |
| 訊息佇列生產者/消費者 | |
| 快取讀寫操作 | |

#### 命名慣例

```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]
```

---

### 系統測試 (ST)

**特性**: 完整系統、類生產環境、基於需求

#### 範圍

| 包含 | 排除 |
|------|------|
| 完整 API 工作流程 | UI 視覺測試 |
| 跨服務交易 | 使用者旅程模擬 |
| 資料流經整個系統 | A/B 測試情境 |
| 安全需求 | |
| 負載下的效能 | |
| 錯誤處理與復原 | |

#### 類型

| 類型 | 說明 |
|------|------|
| 功能性 | 驗證功能按規格運作 |
| 效能 | 負載、壓力、可擴展性測試 |
| 安全性 | 滲透測試、弱點掃描 |
| 可靠性 | 故障轉移、復原、穩定性 |
| 相容性 | 跨平台、瀏覽器相容性 |

#### 命名慣例

```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]
```

---

### 端對端測試 (E2E)

**特性**: 使用者視角、全端（UI → API → 資料庫）、最慢（每個 30 秒以上）

#### 範圍

| 包含 | 排除 |
|------|------|
| 關鍵使用者旅程 | 所有可能的使用者路徑 |
| 登入/認證流程 | 邊界案例（使用 UT/IT） |
| 核心業務交易 | 效能基準測試 |
| 跨瀏覽器功能 | |
| 部署的冒煙測試 | |

#### 命名慣例

```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]
```

---

## 測試替身

| 類型 | 用途 | 使用時機 |
|------|------|---------|
| **Stub** | 回傳預定義的值 | 固定的 API 回應 |
| **Mock** | 驗證互動行為 | 驗證方法是否被呼叫 |
| **Fake** | 簡化實作 | 記憶體資料庫 |
| **Spy** | 記錄呼叫，委派給真實物件 | 部分模擬 |
| **Dummy** | 佔位符，不會被使用 | 填充必要參數 |

### 各測試層級的使用指引

| 層級 | 指引 |
|------|------|
| **UT** | 對所有外部相依性使用 Mock/Stub |
| **IT** | 資料庫使用 Fake，外部 API 使用 Stub |
| **ST** | 使用真實元件，僅對外部第三方使用 Fake |
| **E2E** | 使用全部真實元件；僅對外部支付/郵件使用 Stub |

---

## Mock 的限制

**問題**: 萬用匹配器（`any()`、`It.IsAny<>`）會忽略實際查詢邏輯，使不正確的查詢通過測試。

**規則**: 若模擬一個接受查詢/過濾/述詞參數的方法，你**必須**有對應的整合測試來驗證查詢邏輯。

```python
# 範例 - Python
# ❌ 此測試無法驗證查詢正確性
mock_repo.find.return_value = users

# ✓ 新增整合測試以驗證實際查詢
```

---

## 測試資料要求

### 原則

1. **隔離**: 每個測試管理自己的資料
2. **清理**: 測試結束後自行清理
3. **確定性**: 測試不依賴共享狀態
4. **可讀性**: 測試資料清楚表達意圖

### 區別識別碼規則

當實體同時擁有代理鍵（自動產生的 ID）和業務識別碼時，測試資料**必須**使用不同的值。

```python
# ❌ 錯誤: id 等於 business_code - 映射錯誤無法被偵測
dept = Department(id=1, business_code=1)

# ✓ 正確: 不同的值可捕捉映射錯誤
dept = Department(id=1, business_code=1001)
```

### 複合鍵規則

對於擁有複合主鍵的實體，確保每筆記錄有唯一的鍵組合。

```python
# ❌ 鍵衝突
batch1 = BatchRecord(id=0, send_time=now)
batch2 = BatchRecord(id=0, send_time=now)  # 衝突！

# ✓ 唯一組合
batch1 = BatchRecord(id=0, send_time=now + timedelta(seconds=1))
batch2 = BatchRecord(id=0, send_time=now + timedelta(seconds=2))
```

---

## 測試環境

### 各語言工具

| 語言 | 版本管理工具 | 鎖定檔案 |
|------|-------------|---------|
| Python | venv, virtualenv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm, fnm | package-lock.json, yarn.lock |
| Ruby | rbenv, rvm | Gemfile.lock |
| Java | SDKMAN, jenv | pom.xml, build.gradle.lock |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |
| Rust | rustup, cargo | Cargo.lock |

### 最佳實踐

1. **始終使用虛擬環境**進行開發與測試
2. **提交鎖定檔案**至版本控制
3. **在 CI/CD 管線中固定版本**
4. **在 README 或 .tool-versions 中記錄所需的執行環境版本**

### 各測試層級的容器使用

| 層級 | 容器使用 |
|------|---------|
| UT | 不需要 - 使用 mock |
| IT | 使用 Testcontainers 處理資料庫、快取 |
| ST | 使用 Docker Compose 建立完整環境 |
| E2E | 完整容器化堆疊 |

---

## CI/CD 整合

### 測試執行策略

| 階段 | 時機 | 逾時 |
|------|------|------|
| 單元測試 | 每次提交 | 10 分鐘 |
| 整合測試 | 每次提交 | 30 分鐘 |
| 系統測試 | PR 合併至 main | 2 小時 |
| E2E 測試 | 發布候選版本 | 4 小時 |

### 必要指標

| 指標 | UT | IT | ST | E2E |
|------|----|----|----|----|
| 通過/失敗數 | 必要 | 必要 | 必要 | 必要 |
| 執行時間 | 必要 | 必要 | 必要 | 必要 |
| 覆蓋率 % | 必要 | 必要 | 選用 | 不需要 |
| 不穩定測試率 | 必要 | 必要 | 必要 | 必要 |
| 截圖/影片 | 不需要 | 不需要 | 選用 | 必要 |

---

## 最佳實踐

### AAA 模式

```
// Arrange - 設置測試資料與環境
// Act - 執行待測行為
// Assert - 驗證結果
```

### FIRST 原則

| 原則 | 說明 |
|------|------|
| **F**ast（快速） | 測試快速執行 |
| **I**ndependent（獨立） | 測試之間互不影響 |
| **R**epeatable（可重複） | 每次結果相同 |
| **S**elf-validating（自我驗證） | 明確的通過/失敗 |
| **T**imely（及時） | 與生產程式碼同時撰寫 |

### 應避免的反模式

- 測試相依性（測試必須按特定順序執行）
- 不穩定測試（時而通過、時而失敗）
- 測試實作細節（重構時測試就壞了）
- 過度 Mock（沒有真正測試到任何東西）
- 缺少斷言（測試沒有驗證有意義的內容）
- 魔術數字/字串（無法解釋的值）
- 相同的測試 ID（代理鍵與業務鍵使用相同值）

---

## 測試文件結構

### tests/README.md 必要章節

每個 `tests/` 目錄**應該**包含一個 README.md，內含：

#### 1. 測試概覽表

| 測試類型 | 數量 | 框架 | 環境 |
|---------|------|------|------|
| 單元測試 | 150 | Jest | Node.js |
| 整合測試 | 45 | Jest | Node.js + TestContainers |
| E2E 測試 | 12 | Playwright | Browser |

#### 2. 目前狀態章節

| 指標 | 值 | 目標 | 狀態 |
|------|-----|------|------|
| 通過率 | 98.5% | >= 95% | 通過 |
| 行覆蓋率 | 82% | >= 80% | 通過 |
| 分支覆蓋率 | 75% | >= 70% | 通過 |

#### 3. 報告連結章節

| 報告類型 | 位置 | 說明 |
|---------|------|------|
| 測試結果 | `results/` | 時間戳記的執行報告 |
| 覆蓋率 | `coverage/` | 程式碼覆蓋率報告 |
| 差距分析 | `docs/gap-analysis.md` | 缺失覆蓋率分析 |

### 測試報告命名慣例

| 項目 | 慣例 | 範例 |
|------|------|------|
| 報告檔名 | `test-report-YYYYMMDD-HHMMSS.md` | `test-report-20260129-143000.md` |
| 報告目錄 | `tests/results/` | |
| 覆蓋率目錄 | `tests/coverage/` | |

### 目錄結構

```
tests/
├── README.md                    # 測試概覽與狀態
├── results/                     # 測試執行報告
├── coverage/                    # 覆蓋率報告
├── docs/                        # 測試文件
├── unit/                        # 單元測試
├── integration/                 # 整合測試
└── e2e/                         # 端對端測試
```

---

## 探索式測試

> **參考**：ISTQB CTFL v4.0 §4.4、James Bach 的 Session-Based Test Management (SBTM)

探索式測試是一種結構化方法，測試設計、執行與學習同時進行，透過發現腳本測試無法預見的未知缺陷來補充自動化測試。

### Session-Based Test Management (SBTM)

| 元素 | 說明 | 需求 |
|------|------|------|
| **Time Box** | 固定 60-90 分鐘的 session | 必要 |
| **Charter** | 明確的探索目標、測試區域與預期風險 | 必要 |
| **Session Notes** | 步驟、觀察、偏差與問題的結構化記錄 | 必要 |
| **Debrief** | Session 後與團隊回顧 | 建議 |

### 啟發法（SFDPOT）

| 維度 | 關注領域 | 範例問題 |
|------|----------|----------|
| Structure | 系統元件與其關係 | 存在哪些模組？如何連接？ |
| Function | 系統提供的功能與能力 | 每個功能做什麼？邊界情況？ |
| Data | 輸入/輸出資料、邊界值 | 接受哪些資料類型？邊界發生什麼？ |
| Platform | OS、瀏覽器、硬體差異 | 所有支援平台都能運作？ |
| Operations | 安裝、設定、維護、監控 | 能乾淨安裝嗎？如何維護？ |
| Time | 並發、逾時、排程、時區 | 並發存取時會發生什麼？ |

### 自動化互補

| 面向 | 探索式測試 | 自動化測試 |
|------|-----------|-----------|
| **目的** | 發現未知缺陷 | 防止已知回歸 |
| **時機** | 新功能、風險區域、發布前 | 每次 build、CI |
| **優勢** | 創造力、適應性 | 速度、可重複性 |

**發現到保護循環**：探索 → 記錄 → 自動化 → 保護 → 重複

> **規則**：透過探索式測試發現的每個 Bug 應在同一 Sprint 內新增對應的自動化迴歸測試。

---

## 相關標準

- [測試理論知識庫](../../../skills/testing-guide/testing-theory.md) - 教育內容、範例、技術
- [測試驅動開發](test-driven-development.md) - TDD/BDD/ATDD 方法論
- [測試完整性維度](test-completeness-dimensions.md) - 8 維度測試覆蓋
- [規格驅動開發](spec-driven-development.md) - SDD 工作流程整合
- [程式碼簽入標準](checkin-standards.md)
- [程式碼審查檢查清單](code-review-checklist.md)
- [部署標準](deployment-standards.md) - 部署準備的測試要求

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 3.1.0 | 2026-03-24 | **覆蓋率優先重構**: 將覆蓋率目標提升至首要位置，提高門檻（行 80/90/95+、分支 70/85/90+、函式 85/95/100），新增覆蓋率與佔比的區別，將測試金字塔降為僅供參考 |
| 3.0.0 | 2026-01-29 | **重大重構**: 拆分為規則（本檔案）與理論（testing-theory.md）。從 141KB/3185 行縮減至約 12KB/350 行。所有教育內容移至 skills/testing-guide/testing-theory.md。純規則格式，針對 AI 代理消費最佳化。 |
| 2.2.0 | 2026-01-20 | 新增測試文件結構章節 |
| 2.1.0 | 2026-01-05 | 新增 SWEBOK v4.0 參考、測試基礎知識、測試相關量測 |
| 2.0.0 | 2026-01-05 | 重大更新，對齊 ISTQB CTFL v4.0 與 ISO/IEC/IEEE 29119 |
| 1.3.0 | 2025-12-29 | 新增測試框架選擇、IT/SIT 縮寫說明 |
| 1.2.0 | 2025-12-19 | 新增 Mock 限制、整合測試要求、測試資料模式 |
| 1.1.1 | 2025-12-11 | 改善系統測試範例，使用通用領域概念 |
| 1.1.0 | 2025-12-05 | 新增測試環境隔離章節 |
| 1.0.0 | 2025-12-05 | 初始測試標準，包含 UT/IT/ST/E2E 覆蓋 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

---

**維護者**: 開發團隊
