---
source: ../../../core/acceptance-criteria-traceability.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-18
status: current
---

# 驗收標準可追溯性規範

> **語言**: [English](../../../core/acceptance-criteria-traceability.md) | 繁體中文

**適用範圍**: 所有使用規格驅動或測試驅動工作流程的軟體專案
**Scope**: universal

---

## 概述

驗收標準可追溯性規範定義了如何追蹤驗收標準（AC）、測試實作與覆蓋狀態之間的關係。本規範確保每個 AC 都可被驗證測試，並提供標準化的覆蓋率分析報告格式。

## 參考資料

| 標準 / 來源 | 內容 |
|------------|------|
| ISO/IEC/IEEE 29119-3 | 測試文件 — 可追溯性矩陣 |
| IEEE 830 | 軟體需求規格 — 可追溯性 |
| ISTQB Foundation | 基於需求的測試 |
| INVEST 原則 | 驗收標準品質 |

---

## AC 對測試的可追溯性矩陣

### 標準矩陣格式

| AC-ID | 測試檔案 | 測試名稱 | 狀態 | 備注 |
|-------|---------|---------|------|------|
| AC-1 | `tests/auth.test.ts` | `should login with valid credentials` | ✅ 已覆蓋 | |
| AC-2 | `tests/auth.test.ts` | `should reject invalid credentials` | ✅ 已覆蓋 | |
| AC-3 | — | — | ❌ 未覆蓋 | 被 API 相依性阻擋 |
| AC-4 | `tests/auth.test.ts` | `should lock account after 5 failures` | ⚠️ 部分覆蓋 | 缺少邊界情況 |

### 矩陣欄位

| 欄位 | 必填 | 說明 |
|------|------|------|
| `AC-ID` | 是 | 規格中的唯一識別碼（例如 AC-1、AC-2） |
| `Test File` | 是（若已覆蓋） | 實作此 AC 的測試檔案路徑 |
| `Test Name` | 是（若已覆蓋） | 測試案例或 describe 區塊的名稱 |
| `Status` | 是 | 覆蓋狀態：`covered`、`partial`、`uncovered` |
| `Notes` | 否 | 補充資訊（阻擋因素、相依性等） |

### 連結慣例

測試 **必須** 使用標準注釋參照其來源 AC：

```typescript
// TypeScript/JavaScript
describe('AC-1: User login with valid credentials', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: User login with valid credentials
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

---

## 覆蓋狀態定義

### 狀態分類

| 狀態 | 符號 | 定義 | 判斷標準 |
|------|------|------|---------|
| **已覆蓋** | ✅ | AC 已完整測試 | AC 中所有條件都有對應的測試斷言 |
| **部分覆蓋** | ⚠️ | AC 已部分測試 | 部分條件已測試，但缺少邊界情況或執行路徑 |
| **未覆蓋** | ❌ | AC 沒有測試 | 沒有任何測試案例參照此 AC |

### 覆蓋率計算

```
AC Coverage % = (covered_count / total_ac_count) × 100

Where:
  covered_count = count of AC with status "covered"
  total_ac_count = total number of AC in specification
  partial counts as 0.5 for coverage calculation
```

### 計算範例

```
SPEC-001: 8 AC total
  - 5 covered (✅)
  - 2 partial (⚠️)
  - 1 uncovered (❌)

Coverage = (5 + 2×0.5) / 8 = 6/8 = 75%
```

---

## 品質門檻

### 預設門檻

| 門檻 | 數值 | 強制執行 |
|------|------|---------|
| **最低 AC 覆蓋率** | 100% | 正式發布前必須達到 |
| **簽入最低要求** | 80% | 功能分支合併前必須達到 |
| **警告級別** | 60% | 觸發覆蓋率警告 |

### 可設定門檻

專案 **可以** 在設定檔中自訂門檻：

```json
{
  "acCoverage": {
    "minimum": 100,
    "checkinMinimum": 80,
    "warningLevel": 60,
    "partialWeight": 0.5
  }
}
```

### 門檻例外

覆蓋率要求的例外情況 **必須** 記錄在案：

| 例外類型 | 允許時機 | 必要文件 |
|---------|---------|---------|
| 外部相依性阻擋 | 第三方 API 無法使用 | Issue 連結 + 時程 |
| 基礎設施限制 | 測試環境限制 | 解決方案計畫 |
| 延後至下一迭代 | 已與利害關係人確認 | Ticket 參照 |

---

## AC 覆蓋率報告格式

### 標準報告結構

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — User Authentication
**Generated**: 2026-03-18
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | Login with valid credentials | ✅ | auth.test.ts:15 |
| AC-2 | Reject invalid credentials | ✅ | auth.test.ts:32 |
| AC-3 | Rate limit login attempts | ⚠️ | auth.test.ts:48 (missing edge case) |
| ...   | ...                        | ... | ... |

## Gaps

### Uncovered AC
- **AC-8**: Social login integration — Blocked by OAuth provider sandbox

### Partial AC
- **AC-3**: Rate limit — Missing test for concurrent requests
- **AC-6**: Session timeout — Missing test for background tab behavior

## Action Items
1. [ ] AC-8: Set up OAuth sandbox environment (ETA: 2026-03-25)
2. [ ] AC-3: Add concurrent request test
3. [ ] AC-6: Add background tab test
```

### 機器可讀格式

```json
{
  "specId": "SPEC-001",
  "specName": "User Authentication",
  "generatedAt": "2026-03-18T10:00:00Z",
  "coverage": {
    "percentage": 75,
    "covered": 5,
    "partial": 2,
    "uncovered": 1,
    "total": 8
  },
  "matrix": [
    {
      "acId": "AC-1",
      "description": "Login with valid credentials",
      "status": "covered",
      "testFile": "tests/auth.test.ts",
      "testName": "should login with valid credentials",
      "testLine": 15
    }
  ]
}
```

---

## 自動規格生成品質規則

### AC 品質要求

當從 PRD、使用者故事或需求自動生成規格時，所生成的 AC **必須** 符合以下品質標準：

| 標準 | 說明 | 驗證方式 |
|------|------|---------|
| **具體（Specific）** | AC 描述具體、可觀察的行為 | 不使用模糊用語（「應該運作正常」、「夠快」） |
| **可衡量（Measurable）** | AC 有可量化或可驗證的結果 | 包含預期數值、狀態或行為 |
| **可達成（Achievable）** | AC 在技術上可行 | 參照已知的 API、資料或能力 |
| **相關（Relevant）** | AC 與功能目的相關 | 對應使用者需求或業務需求 |
| **可測試（Testable）** | AC 可通過測試驗證 | 可以用 Given-When-Then 表達 |

### 規格生成 I/O 契約

#### 輸入格式

| 輸入類型 | 必要欄位 | 範例 |
|---------|---------|------|
| PRD | 標題、說明、使用者故事 | 產品需求文件 |
| 使用者故事 | As a / I want / So that | 「As a user, I want to login...」 |
| 功能簡報 | 功能名稱、目標、限制 | 功能說明文件 |

#### 輸出格式

生成的規格 **必須** 包含：

| 區段 | 必填 | 說明 |
|------|------|------|
| SPEC ID | 是 | 唯一識別碼（例如 SPEC-001） |
| 標題 | 是 | 功能名稱 |
| 說明 | 是 | 功能描述 |
| 驗收標準 | 是 | 編號 AC 清單（AC-1、AC-2、…） |
| AC 格式 | 是 | Given-When-Then 或結構化條列 |
| 可測試性標記 | 是 | 每個 AC 標記為可測試 / 不可測試 |

#### 驗證規則

1. **AC 數量**：生成的規格 **必須** 至少有 1 個 AC
2. **AC 唯一性**：不可有重複的 AC 描述
3. **AC 完整性**：正常路徑 + 至少 1 個錯誤或邊界情況
4. **AC 可測試性**：100% 的 AC 必須可測試
5. **可追溯性**：每個 AC 都連結回來源需求

---

## 反模式

| 反模式 | 影響 | 正確做法 |
|-------|------|---------|
| 測試無法追溯 | 無法驗證規格覆蓋率 | 測試中一律標注 AC-ID |
| 將部分覆蓋視為完整覆蓋 | 對覆蓋率產生錯誤信心 | 使用誠實的狀態分類 |
| 忽略未覆蓋的 AC | 驗證存在缺口 | 追蹤並規劃所有 AC 的覆蓋工作 |
| AC 缺乏可測試性 | 無法驗證 | 確保所有 AC 都可測試 |
| 覆蓋但缺乏斷言 | 測試執行但不驗證任何內容 | 確認測試含有有意義的斷言 |

---

## 相關規範

- [正向推導規範](forward-derivation-standards.md) — 從 AC 生成測試
- [規格驅動開發](spec-driven-development.md) — AC 定義格式
- [測試規範](testing-standards.md) — 測試實作規範
- [簽入規範](checkin-standards.md) — 簽入的覆蓋率門檻
- [測試治理](test-governance.md) — 完成標準

---

## 版本歷程

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| 1.0.0 | 2026-03-18 | 初始版本 — 可追溯性矩陣、覆蓋率計算、規格生成規則 |
