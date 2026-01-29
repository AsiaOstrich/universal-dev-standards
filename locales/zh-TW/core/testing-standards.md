# 測試標準

> **語言**: English | [繁體中文](locales/zh-TW/core/testing-standards.md)

**版本**: 3.0.0
**最後更新**: 2026-01-29
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)

---

## 目的

本標準為 AI 代理和開發人員定義可執行的測試規則和慣例。關於理論基礎、教育內容和詳細範例，請參閱 **[測試理論知識庫](guides/testing-guide.md)**。

**參考標準**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering)

---

## 術語表

| 縮寫 | 全稱 | 說明 |
|------|------|------|
| **UT** | 單元測試 (Unit Testing) | 隔離測試個別函式/方法 |
| **IT** | 整合測試 (Integration Testing) | 測試元件之間的互動 |
| **ST** | 系統測試 (System Testing) | 測試完整整合的系統 |
| **AT** | 驗收測試 (Acceptance Testing) | 針對業務驗收標準進行測試 |
| **E2E** | 端對端測試 (End-to-End Testing) | 測試完整的使用者工作流程 |
| **UAT** | 使用者驗收測試 (User Acceptance Testing) | 由最終使用者執行的驗收測試 |
| **SIT** | 系統整合測試 (System Integration Testing) | 測試多個系統的整合 |

> **注意**：本文件中的「IT」一律指「整合測試 (Integration Testing)」，而非「資訊科技 (Information Technology)」。

---

## 測試金字塔 (預設比例)

```
              ┌─────────┐
              │   E2E   │  ← 10% (較少，較慢，成本較高)
             ─┴─────────┴─
            ┌─────────────┐
            │    IT/SIT   │  ← 20% (整合測試)
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70% (單元測試 - 基礎)
          └─────────────────┘
```

| 層級 | 比例 | 執行時間目標 |
|------|------|--------------|
| 單元測試 (UT) | 70% | 總計 < 10 分鐘 |
| 整合測試 (IT) | 20% | 總計 < 30 分鐘 |
| E2E 測試 | 10% | 總計 < 2 小時 |

---

## 測試層級需求

### 單元測試 (UT)

**特性**: 隔離、快速 (< 100ms/個)、確定性

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

**方法命名** (每個專案擇一):

| 風格 | 最適合 | 範例 |
|------|--------|------|
| `[Method]_[Scenario]_[Result]` | C#, Java | `CalculateTotal_NegativePrice_ThrowsException()` |
| `should_[behavior]_when_[condition]` | JavaScript/TypeScript | `should_reject_login_when_account_locked()` |
| `test_[method]_[scenario]_[expected]` | Python (pytest) | `test_validate_email_invalid_format_returns_false()` |

#### 覆蓋率閾值

| 指標 | 最低 | 推薦 |
|------|------|------|
| 行覆蓋率 (Line) | 70% | 85% |
| 分支覆蓋率 (Branch) | 60% | 80% |
| 函式覆蓋率 (Function) | 80% | 90% |

---

### 整合測試 (IT)

**特性**: 元件整合、真實相依性 (通常容器化)、1-10 秒/個

#### 何時必須有整合測試

**決策規則**: 如果你的單元測試對查詢/過濾參數使用萬用匹配器 (`any()`, `It.IsAny<>`, `Arg.Any<>`)，該功能必須有整合測試。

| 情境 | 原因 |
|------|------|
| 查詢述詞 | Mock 無法驗證過濾表達式 |
| 實體關聯 | 驗證外鍵正確性 |
| 複合主鍵 | 記憶體資料庫可能與真實 DB 不同 |
| 欄位對應 | DTO ↔ Entity 轉換 |
| 分頁 | 資料排序和計數 |
| 交易 | 回滾行為 |

#### 範圍

| 包含 | 排除 |
|------|------|
| 資料庫 CRUD 操作 | 完整使用者工作流程 |
| Repository + Database | 跨服務通訊 |
| Service + Repository | UI 互動 |
| API 端點 + Service 層 | |

#### 命名慣例

```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]
```

---

### 端對端測試 (E2E)

**特性**: 使用者視角、全端 (UI → API → Database)、最慢 (30s+/個)

#### 範圍

| 包含 | 排除 |
|------|------|
| 關鍵使用者旅程 | 每個可能的使用者路徑 |
| 登入/驗證流程 | 邊緣案例 (使用 UT/IT) |
| 核心業務交易 | 效能基準測試 |

#### 命名慣例

```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]
```

---

## 測試替身 (Test Doubles)

| 類型 | 目的 | 何時使用 |
|------|------|----------|
| **Stub** | 回傳預定義值 | 固定的 API 回應 |
| **Mock** | 驗證互動 | 驗證方法被呼叫 |
| **Fake** | 簡化的實作 | 記憶體資料庫 |
| **Spy** | 記錄呼叫 | 部分 Mock |
| **Dummy** | 佔位符 | 填補必要參數 |

### 依測試層級使用

| 層級 | 指引 |
|------|------|
| **UT** | 對所有外部依賴使用 Mocks/Stubs |
| **IT** | 資料庫使用 Fakes，外部 API 使用 Stubs |
| **E2E** | 全部使用真實元件；僅外部支付/郵件使用 Stub |

---

## Mock 限制

**問題**: 萬用匹配器 (`any()`, `It.IsAny<>`) 會忽略實際查詢邏輯，允許錯誤的查詢通過。

**規則**: 如果 Mock 一個接受查詢/過濾/述詞參數的方法，你**必須**有對應的整合測試來驗證查詢邏輯。

```python
# 範例 - Python
# ❌ 此測試無法驗證查詢正確性
mock_repo.find.return_value = users

# ✓ 新增整合測試來驗證實際查詢
```

---

## 測試資料需求

### 區分識別碼規則

當實體同時具有代理鍵 (自動產生 ID) 和業務識別碼時，測試資料**必須**為兩者使用不同的值。

```python
# ❌ 錯誤: id 等於 business_code - 對應錯誤無法偵測
dept = Department(id=1, business_code=1)

# ✓ 正確: 區分值可捕捉對應錯誤
dept = Department(id=1, business_code=1001)
```

---

## 測試環境

### 依測試層級的容器使用

| 層級 | 容器使用 |
|------|----------|
| UT | 不需要 - 使用 mocks |
| IT | Testcontainers 用於資料庫、快取 |
| ST | Docker Compose 用於完整環境 |
| E2E | 完整容器化堆疊 |

---

## CI/CD 整合

### 測試執行策略

| 階段 | 時機 | 逾時 |
|------|------|------|
| 單元測試 | 每次提交 | 10 分鐘 |
| 整合測試 | 每次提交 | 30 分鐘 |
| 系統測試 | PR 合併至 main | 2 小時 |
| E2E 測試 | 發布候選版 | 4 小時 |

---

## 相關標準

- [測試理論知識庫](guides/testing-guide.md) - 教育內容、範例、技巧
- [測試驅動開發](test-driven-development.md) - TDD/BDD/ATDD 方法論
- [測試完整性維度](test-completeness-dimensions.md) - 8 維度測試覆蓋
- [規格驅動開發](spec-driven-development.md) - SDD 工作流程整合
- [程式碼簽入標準](checkin-standards.md)
- [程式碼審查清單](code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 3.0.0 | 2026-01-29 | **重大重構**：拆分為規則（本文件）和理論（testing-guide.md）。優化 AI 閱讀效率。 |
| 2.2.0 | 2026-01-20 | 新增測試文件結構章節 |
| 2.1.0 | 2026-01-05 | 新增 SWEBOK v4.0 參考 |
| 2.0.0 | 2026-01-05 | 根據 ISTQB CTFL v4.0 和 ISO/IEC/IEEE 29119 進行重大更新 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
