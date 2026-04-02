# [SPEC-E2E-001] Feature: `/e2e` 斜線命令 — 從 BDD 場景生成 E2E 測試骨架

- **Status**: Approved
- **Approved**: 2026-04-02
- **Created**: 2026-04-02
- **Priority**: Medium
- **Scope**: partial (概念 universal，Skill 實作為 UDS 工具)
- **Depends-on**: `/derive e2e`（骨架生成引擎）
- **Issue**: #66

## Overview

新增 `/e2e` 斜線命令，補完 UDS 測試金字塔的 E2E 層引導。此命令從 BDD `.feature` 場景或 SDD 規格出發，偵測專案的 E2E 框架、分析既有測試模式，並生成框架適配的 E2E 測試骨架。

## Motivation

UDS 測試金字塔各層級都有對應指令，唯獨缺少 E2E 層：

| 測試層級 | UDS 指令 | 狀態 |
|---------|---------|:----:|
| 單元測試 | `/tdd` | ✔ |
| BDD 場景 | `/bdd`, `/derive bdd` | ✔ |
| ATDD 表格 | `/atdd`, `/derive atdd` | ✔ |
| **E2E 測試** | **無** | ❌ |

E2E 違反 TDD 的 FIRST 原則（慢、有依賴、需基礎設施），因此不適合整合到 `/tdd`，應作為獨立命令。

### 與 `/derive e2e` 的差異

| 工具 | 職責 | 輸入 | 輸出 |
|------|------|------|------|
| `/derive e2e` | 機械式 1:1 AC→骨架生成 | `SPEC-XXX.md` | `.e2e.test.*` 骨架 |
| `/e2e`（本 spec） | 智慧化 E2E 工程引導 | `.feature` 或 SPEC | 框架適配測試 + 分析報告 |

`/e2e` 在內部可委派 `/derive e2e` 做骨架生成，自身負責框架偵測、模式分析、AC 篩選和測試數據引導。

## Requirements

### REQ-1: AC 適用性分析

系統 SHALL 分析 BDD 場景或 SDD 規格中的 AC，判斷哪些適合 E2E 測試。

#### Scenario: 篩選適合 E2E 的 AC

- **GIVEN** 一個 `.feature` 檔案包含 10 個 Scenario
- **WHEN** 執行 `/e2e --analyze <feature-file>`
- **THEN** 系統依照篩選規則將每個 Scenario 分類為 `e2e-suitable`、`unit-suitable` 或 `integration-suitable`，並輸出分類結果

#### Scenario: 排除純邏輯型 AC

- **GIVEN** 一個 Scenario 描述純計算邏輯（如排序演算法、數學公式）
- **WHEN** 系統進行 E2E 適用性分析
- **THEN** 該 Scenario 被標記為 `unit-suitable` 並附帶原因說明

#### Scenario: 識別使用者流程型 AC

- **GIVEN** 一個 Scenario 描述跨多步驟的使用者操作流程（如「使用者登入 → 建立訂單 → 付款」）
- **WHEN** 系統進行 E2E 適用性分析
- **THEN** 該 Scenario 被標記為 `e2e-suitable`

#### Scenario: 空 feature 檔案

- **GIVEN** 一個 `.feature` 檔案不包含任何 Scenario
- **WHEN** 執行 `/e2e --analyze <feature-file>`
- **THEN** 系統輸出提示「此 feature 檔案不包含可分析的 Scenario」，不產生分類結果

#### Scenario: feature 檔案不存在

- **GIVEN** 指定的 `.feature` 檔案路徑不存在
- **WHEN** 執行 `/e2e <non-existent-file>`
- **THEN** 系統輸出錯誤訊息「找不到檔案：<path>」並列出 `tests/features/` 下可用的 feature 檔案

### REQ-2: E2E 框架偵測

系統 SHALL 自動偵測專案使用的 E2E 測試框架。

#### Scenario: 偵測 Playwright

- **GIVEN** 專案的 `package.json` 包含 `@playwright/test` 依賴
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統偵測到 Playwright 並使用 Playwright 模板生成測試

#### Scenario: 偵測 Cypress

- **GIVEN** 專案的 `package.json` 包含 `cypress` 依賴且存在 `cypress.config.*`
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統偵測到 Cypress 並使用 Cypress 模板生成測試

#### Scenario: 偵測 Vitest（CLI E2E 模式）

- **GIVEN** 專案使用 Vitest 且有 `tests/e2e/` 目錄
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統偵測到 Vitest E2E 模式並使用 Vitest 模板生成測試

#### Scenario: 無法偵測框架

- **GIVEN** 專案沒有已知的 E2E 測試框架
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統提示使用者選擇框架，列出支援的選項（Playwright、Cypress、Vitest）

#### Scenario: 多框架並存

- **GIVEN** 專案的 `package.json` 同時包含 `@playwright/test` 和 `cypress` 依賴
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統列出偵測到的所有框架，提示使用者選擇要使用哪一個

### REQ-3: 既有模式分析

系統 SHALL 分析專案中既有的 E2E 測試，學習其編碼模式。

#### Scenario: 學習既有測試模式

- **GIVEN** 專案有 3 個以上既有的 E2E 測試檔案，使用 `import { runNonInteractive } from '../utils/cli-runner.js'` 風格
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統生成的測試使用相同的 import 來源和 helper 函式，且輸出模式摘要供使用者確認

#### Scenario: 無既有測試

- **GIVEN** 專案的 E2E 測試目錄為空
- **WHEN** 執行 `/e2e` 命令
- **THEN** 系統使用框架的預設最佳實踐模板生成測試

### REQ-4: E2E 測試骨架生成

系統 SHALL 生成框架適配的 E2E 測試骨架。

#### Scenario: 從 feature 檔案生成 E2E 骨架

- **GIVEN** 一個 `.feature` 檔案且已完成 AC 篩選和框架偵測
- **WHEN** 執行 `/e2e <feature-file>`
- **THEN** 系統生成對應的 E2E 測試檔案，其中：
  - 每個 `e2e-suitable` 的 Scenario 對應一個 test case
  - test case 包含 `[TODO]` 標記指示需手動實作的部分
  - 追蹤標籤引用原始 Scenario（`@SPEC-XXX @AC-N`）

#### Scenario: 從 SDD 規格生成 E2E 骨架

- **GIVEN** 一個 `SPEC-XXX.md` 規格檔案
- **WHEN** 執行 `/e2e <spec-file>`
- **THEN** 系統委派 `/derive e2e` 生成基礎骨架，再套用框架模板和既有模式進行後處理

#### Scenario: 生成包含 fixture 引導

- **GIVEN** E2E 測試需要測試數據（如 DB seed、API mock）
- **WHEN** 系統生成測試骨架
- **THEN** 測試檔案包含 `beforeAll`/`beforeEach` 區塊，附帶 `[TODO]` 標記提示需要準備的 fixture

### REQ-5: 覆蓋差距分析

系統 SHALL 提供分析模式，報告 BDD 場景與 E2E 測試之間的覆蓋差距。

#### Scenario: 掃描覆蓋差距

- **GIVEN** 專案有 34 個 `.feature` 檔案和 6 個 `.e2e.test.*` 檔案
- **WHEN** 執行 `/e2e --analyze`
- **THEN** 系統輸出覆蓋報告，包含：
  - 有 E2E 覆蓋的 feature 數量
  - 缺少 E2E 覆蓋的 feature 清單
  - 建議的優先順序（依風險/複雜度）

#### Scenario: 與 ac-coverage-assistant 整合

- **GIVEN** 執行 `/e2e --analyze` 產生覆蓋報告
- **WHEN** 使用者希望更詳細的 AC 層級追蹤
- **THEN** 系統建議執行 `/ac-coverage-assistant` 並傳遞分析結果

## Acceptance Criteria

- **AC-1**: `/e2e --analyze <feature-file>` 正確分類 AC 為 e2e-suitable / unit-suitable / integration-suitable（REQ-1）
- **AC-2**: 純邏輯型 AC 被排除在 E2E 之外（REQ-1）
- **AC-3**: 使用者流程型 AC 被識別為 e2e-suitable（REQ-1）
- **AC-4**: 空 feature 檔案輸出提示訊息，不產生分類結果（REQ-1）
- **AC-5**: 不存在的 feature 路徑輸出錯誤並列出可用檔案（REQ-1）
- **AC-6**: 自動偵測 Playwright 框架（REQ-2）
- **AC-7**: 自動偵測 Cypress 框架（REQ-2）
- **AC-8**: 自動偵測 Vitest E2E 模式（REQ-2）
- **AC-9**: 無框架時提示使用者選擇（REQ-2）
- **AC-10**: 多框架並存時提示使用者選擇（REQ-2）
- **AC-11**: 分析既有 E2E 測試的編碼模式並輸出模式摘要（REQ-3）
- **AC-12**: 無既有測試時使用預設模板（REQ-3）
- **AC-13**: 從 `.feature` 生成框架適配的 E2E 骨架（REQ-4）
- **AC-14**: 從 `SPEC-XXX.md` 生成時委派 `/derive e2e`（REQ-4）
- **AC-15**: 生成的骨架包含 fixture/seed 引導（REQ-4）
- **AC-16**: `/e2e --analyze` 輸出覆蓋差距報告（REQ-5）
- **AC-17**: 建議與 `/ac-coverage-assistant` 整合（REQ-5）

## Technical Design

### 架構

```
/e2e (Skill)
  ├─ 模式 1: 生成模式 (預設)
  │   ├─ analyzeAcSuitability()    ← REQ-1
  │   ├─ detectFramework()         ← REQ-2
  │   ├─ analyzeExistingPatterns() ← REQ-3
  │   ├─ generateSkeleton()        ← REQ-4 (可委派 /derive e2e)
  │   └─ applyFrameworkTemplate()  ← REQ-4
  │
  ├─ 模式 2: 分析模式 (--analyze)
  │   ├─ scanFeatureFiles()        ← REQ-5
  │   ├─ scanE2eTests()            ← REQ-5
  │   └─ generateCoverageReport()  ← REQ-5
  │
  └─ 整合
      ├─ /ac-coverage-assistant (覆蓋率追蹤)
      └─ /derive e2e (骨架生成引擎)
```

### Skill 檔案結構

```
skills/e2e-assistant/
├── SKILL.md           # Skill 定義（frontmatter + 工作流程）
├── guide.md           # 詳細使用指南
└── templates/         # 框架模板
    ├── playwright.md   # Playwright 骨架模板
    ├── cypress.md      # Cypress 骨架模板
    └── vitest.md       # Vitest 骨架模板
```

### CLI 命令

```bash
/e2e <feature-file>           # 從 BDD 場景生成 E2E 骨架（預設模式）
/e2e <spec-file>              # 從 SDD 規格生成 E2E 骨架
/e2e --analyze                # 掃描所有 feature 的 E2E 覆蓋差距
/e2e --analyze <feature-file> # 分析特定 feature 的 AC 適用性
```

### AC 篩選規則

| 分類 | 條件 | 範例 |
|------|------|------|
| `e2e-suitable` | 跨多元件/多步驟的使用者流程 | 登入→操作→驗證 |
| `e2e-suitable` | 涉及 UI 互動 | 表單提交、頁面導航 |
| `e2e-suitable` | 涉及 CLI 完整流程 | `uds init` → 驗證輸出檔案 |
| `integration-suitable` | 跨兩個元件但無 UI | API 呼叫 → DB 寫入 |
| `unit-suitable` | 純邏輯/計算 | 排序、驗證、格式化 |

## Test Plan

- [ ] 單元測試：AC 分類邏輯（`analyzeAcSuitability` 各分類路徑）
- [ ] 單元測試：框架偵測邏輯（Playwright/Cypress/Vitest/無框架）
- [ ] 單元測試：模式分析（有/無既有測試）
- [ ] 整合測試：從 `.feature` 到 E2E 骨架的完整流程
- [ ] 整合測試：從 `SPEC-XXX.md` 委派 `/derive e2e` 的流程
- [ ] 整合測試：`--analyze` 覆蓋差距報告
- [ ] E2E 測試：CLI 命令 `/e2e` 端到端流程

## Out of Scope

- 自動生成 `docker-compose.test.yml`（可作為 v2 考慮）
- E2E 測試的自動執行（使用者手動執行）
- 瀏覽器驅動程式安裝引導
- 反向追蹤（從 E2E 反推缺少的 BDD 場景，可作為 v2 考慮）
