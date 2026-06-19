---
source: options/testing/istqb-framework.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# ISTQB 測試框架

> **語言**: [English](../../../../options/testing/istqb-framework.md) | 繁體中文

**上層標準**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## 概觀

ISTQB（International Software Testing Qualifications Board，國際軟體測試認證委員會）測試框架提供標準化的四層測試模型。它具備正式的結構、明確的文件要求，並在企業環境中廣泛採用。

## 最適用情境

- 需要正式 QA 流程的企業專案
- 需要認證或合規的專案
- 設有專責 QA 團隊的組織
- 瀑布式或混合式開發方法論
- 具備嚴格稽核要求的專案

## 測試層級（Testing Levels）

### 1. 單元測試（Unit Testing, UT）

| 面向 | 說明 |
|--------|---------|
| **ISTQB 術語** | Component Testing（元件測試） |
| **定義** | 隔離地測試個別軟體元件 |
| **目的** | 驗證程式碼單元是否正確運作 |
| **執行者** | 開發人員 |

### 2. 整合測試（Integration Testing, IT/SIT）

| 面向 | 說明 |
|--------|---------|
| **ISTQB 術語** | Integration Testing（整合測試） |
| **縮寫** | IT 或 SIT |
| **定義** | 測試已整合元件之間的介面與互動 |
| **目的** | 驗證元件之間的互動 |
| **執行者** | 開發人員或 QA |

**注意：**
- IT（Integration Testing，整合測試）：常見於 Agile/DevOps 環境
- SIT（System Integration Testing，系統整合測試）：常見於 Enterprise/ISTQB 情境
- 兩個術語指的是同一個測試層級

### 3. 系統測試（System Testing, ST）

| 面向 | 說明 |
|--------|---------|
| **ISTQB 術語** | System Testing（系統測試） |
| **定義** | 測試完整整合後的系統，以驗證其是否符合需求 |
| **目的** | 驗證系統是否滿足功能性與非功能性需求 |
| **執行者** | QA 團隊 |

### 4. 驗收測試（Acceptance Testing, AT/UAT）

| 面向 | 說明 |
|--------|---------|
| **ISTQB 術語** | Acceptance Testing（驗收測試） |
| **縮寫** | AT 或 UAT |
| **定義** | 進行測試以判定系統是否滿足業務需求 |
| **目的** | 驗證系統是否符合業務需求 |
| **執行者** | 終端使用者或業務利害關係人 |

**子類型：**
- **使用者驗收測試（User Acceptance Testing, UAT）：** 由實際使用者進行驗證
- **合約驗收測試（Contract Acceptance Testing）：** 對照合約條件進行驗證
- **法規驗收測試（Regulatory Acceptance Testing）：** 合規性驗證

## 測試類型（Test Types）

### 功能性測試（Functional Testing）

- 功能測試（Functional testing）
- 使用者介面測試（User interface testing）
- 回歸測試（Regression testing）

### 非功能性測試（Non-Functional Testing）

- 效能測試（Performance testing）
- 安全測試（Security testing）
- 可用性測試（Usability testing）
- 可靠性測試（Reliability testing）

## 何時選擇 ISTQB

**適合選擇的情況：**
- 需要正式的測試文件
- 與 QA 認證機構合作
- 具備合規要求的企業環境
- 團隊中包含 ISTQB 認證的專業人員
- 重視稽核軌跡（audit trail）

**應避免的情況：**
- 以快速迭代為優先
- 沒有專責 QA 的小型團隊
- 純 DevOps／持續交付（Continuous Delivery）導向
- 在意文件開銷（documentation overhead）

## 與 Industry Pyramid 的比較

| ISTQB 層級 | 業界對應 | 主要差異 |
|-------------|---------------------|----------------|
| Unit Testing | Unit Testing (UT) | 概念相同 |
| Integration Testing | Integration Testing (IT/SIT) | 概念相同，縮寫慣例不同 |
| System Testing | 通常與 E2E 合併 | ISTQB 將系統驗證與使用者驗收分開 |
| Acceptance Testing | E2E 的一部分 | ISTQB 設有專屬層級進行業務驗證 |

## 規則

| 規則 | 說明 | 優先級 |
|------|-------------|----------|
| 四層結構 | 採用 4 個層級：UT → IT/SIT → ST → AT/UAT，並設有進入／退出條件（entry/exit criteria） | Required |
| 需求可追溯性 | 每個測試案例應可追溯至某項需求 | Required |
| 缺陷分類 | 依 ISTQB 準則按嚴重性（severity）與優先級（priority）分類缺陷 | Recommended |

## 相關選項

- [Industry Pyramid](./industry-pyramid.md) - Agile 三層測試模型
- [Unit Testing](./unit-testing.md) - 詳細的單元測試實務
- [System Testing](./system-testing.md) - 系統測試實務

---

## 參考資料

- [ISTQB Glossary v4.0](https://glossary.istqb.org)
- [ISTQB Foundation Level Syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
