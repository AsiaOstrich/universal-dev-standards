# [SPEC-DERIVE-001] Feature: Multi-Level Test Derivation

- **Status**: Draft
- **Created**: 2026-04-01
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/forward-derivation-standards.md` (擴展), `core/testing-standards.md`

## Overview

擴展 `forward-derivation-standards.md` 和 `/derive` 命令，從 BDD .feature 檔案推演出 Integration Test 和 E2E Test 的可執行骨架。現有推演只涵蓋 Unit Test 和 BDD 場景描述，本規格將推演範圍擴展到完整的測試金字塔。

## Motivation

### 問題陳述

1. **推演缺口** — `/derive all` 只產生 BDD .feature + TDD Unit Test，缺少 IT 和 E2E
2. **.feature 不可執行** — BDD 場景是描述性的 Gherkin，沒有 step definitions 就無法執行
3. **IT/E2E 無引導** — 開發者知道「測什麼」（AC）但不知道「怎麼寫 IT/E2E 骨架」
4. **層級判斷無標準** — 哪個 AC 該用 UT、IT 還是 E2E 測試沒有決策指引

### 與現有標準的關係

| 標準 | 關係 |
|------|------|
| `forward-derivation-standards` | **擴展** — 新增 IT/E2E 推演映射和骨架格式 |
| `testing-standards` | **消費** — 使用其測試金字塔比例（70/20/7/3） |
| `test-data-standards` | **整合** — IT/E2E 骨架引用 fixture/seed 策略 |

## Requirements

### REQ-1: 測試層級決策樹

系統 SHALL 定義根據 AC 內容判斷建議測試層級的決策樹。

#### Scenario: 使用決策樹判斷測試層級
- **GIVEN** 一個 AC 需要決定測試層級
- **WHEN** 使用測試層級決策樹
- **THEN** 根據以下邏輯判斷：

```
AC 涉及使用者介面操作（點擊、瀏覽、重導向、表單填寫）？
├─ Yes → E2E Test
└─ No
   ├─ AC 涉及多個服務/元件互動（API 呼叫、DB 查詢、Queue）？
   │  ├─ Yes → Integration Test
   │  └─ No → Unit Test（已由 /derive-tdd 覆蓋）
   └─ AC 涉及外部系統呼叫（第三方 API、外部 DB）？
      └─ Yes → Integration Test
```

### REQ-2: Integration Test 骨架推演

系統 SHALL 定義從 AC 或 .feature 推演 Integration Test 骨架的格式。

#### Scenario: 推演 HTTP API Integration Test
- **GIVEN** AC 描述一個 API 端點的行為
- **WHEN** 執行 `/derive it`
- **THEN** 產生的骨架包含：

| 段落 | 內容 |
|------|------|
| **Setup** | `[TODO]` Base URL、認證、test fixtures |
| **Request** | HTTP method、path、headers、body（從 AC 推導） |
| **Assert** | Status code、response body 結構、side effects |
| **Teardown** | `[TODO]` 清理 test data |

骨架有 4 種介面範本：

| 介面 | 適用場景 | 骨架重點 |
|------|---------|---------|
| **HTTP API** | REST/GraphQL 端點 | Request → Response → Side Effect |
| **Database** | 資料層操作 | Seed → Execute → Assert State |
| **Message Queue** | 事件驅動 | Publish → Consume → Assert Processing |
| **Service-to-Service** | 微服務互動 | Call → Mock Dependencies → Assert |

#### Scenario: IT 骨架語言無關格式
- **GIVEN** 推演 IT 骨架
- **WHEN** 產生骨架內容
- **THEN** 使用偽代碼格式（非特定框架），以 `[TODO]` 標記需人工填寫的部分

### REQ-3: E2E Test 骨架推演

系統 SHALL 定義從 .feature 推演 E2E Test 骨架的格式。

#### Scenario: 推演 Browser E2E Test
- **GIVEN** .feature 包含涉及 UI 操作的 Scenario
- **WHEN** 執行 `/derive e2e`
- **THEN** 產生的骨架包含：

| 段落 | 內容 |
|------|------|
| **Environment** | `[TODO]` Base URL、test user、browser config |
| **Navigation** | 從 Given 推導頁面導航 |
| **Interaction** | 從 When 推導使用者操作（填寫、點擊） |
| **Assertion** | 從 Then 推導頁面狀態驗證（URL、元素可見、文字內容） |
| **Cleanup** | `[TODO]` 登出、清理 test data |

#### Scenario: E2E 骨架從 Gherkin 步驟映射
- **GIVEN** .feature 中有 `Given a registered user with valid credentials`
- **WHEN** 推演 E2E 骨架
- **THEN** 映射為：
  ```
  // [Source] Given: a registered user with valid credentials
  // [TODO] Navigate to login page
  // [TODO] Ensure test user exists (or create via API)
  ```

### REQ-4: `/derive` 命令擴展

系統 SHALL 擴展 `/derive` 命令支援新的子命令。

#### Scenario: 新增子命令
- **GIVEN** 使用者執行 `/derive`
- **WHEN** 查看可用子命令
- **THEN** 看到以下完整清單：

| 子命令 | 輸入 | 輸出 | 說明 |
|--------|------|------|------|
| `bdd` | SPEC | .feature | BDD 場景（現有） |
| `tdd` | SPEC | .test.* | Unit test 骨架（現有） |
| `atdd` | SPEC | .md | Acceptance table（現有） |
| `contracts` | SPEC | .json | Contract 定義（現有） |
| `it` | SPEC 或 .feature | .it.test.* | Integration test 骨架（🆕） |
| `e2e` | SPEC 或 .feature | .e2e.test.* | E2E test 骨架（🆕） |
| `all` | SPEC | 全部上述 | 完整推演（🆕 擴展） |

#### Scenario: `/derive all` 產出完整測試金字塔
- **GIVEN** 使用者執行 `/derive all SPEC-XXX.md`
- **WHEN** 推演完成
- **THEN** 產生：
  - `.feature` — BDD 場景
  - `.test.*` — Unit test 骨架
  - `.it.test.*` — Integration test 骨架
  - `.e2e.test.*` — E2E test 骨架
  - 每個 AC 標記建議的測試層級

### REQ-5: AC 層級標記

系統 SHALL 在推演時為每個 AC 標記建議的測試層級。

#### Scenario: AC 層級標記輸出
- **GIVEN** SPEC 有多個 AC
- **WHEN** 執行 `/derive all`
- **THEN** 在輸出中包含 AC 層級摘要：

```markdown
## AC Level Summary
| AC | Suggested Level | Rationale |
|----|----------------|-----------|
| AC-1 | E2E | Involves UI redirect |
| AC-2 | IT | API endpoint behavior |
| AC-3 | Unit | Pure calculation |
```

### REQ-6: Test Level Configuration Awareness

系統 SHALL 在推演前檢查專案的 `test_levels` 配置，只推演已啟用的測試層級。

#### Scenario: 專案只啟用 Unit + Integration
- **GIVEN** manifest 中 `test_levels: ['unit-testing', 'integration-testing']`
- **WHEN** 執行 `/derive all`
- **THEN** 只推演 BDD + TDD + IT，跳過 E2E
- **AND** 顯示訊息「Skipping E2E derivation — not in project test_levels configuration」

#### Scenario: 無 manifest 時預設全推演
- **GIVEN** 專案沒有 manifest 或沒有 `test_levels` 設定
- **WHEN** 執行 `/derive all`
- **THEN** 推演所有層級（BDD + TDD + IT + E2E）

## Acceptance Criteria

- **AC-1**: Given AC 內容, when 使用決策樹, then 能判斷 E2E/IT/Unit 三種層級
- **AC-2**: Given API 相關 AC, when 執行 `/derive it`, then 產生含 Setup/Request/Assert/Teardown 的 IT 骨架
- **AC-3**: Given IT 骨架, when 查看介面範本, then 有 4 種範本（HTTP/DB/MQ/Service）
- **AC-4**: Given UI 相關 .feature, when 執行 `/derive e2e`, then 產生含 Environment/Navigation/Interaction/Assertion/Cleanup 的 E2E 骨架
- **AC-5**: Given E2E 骨架, when 查看 Gherkin 映射, then Given→Navigation、When→Interaction、Then→Assertion
- **AC-6**: Given `/derive` 命令, when 查看子命令, then 有 7 個子命令（bdd/tdd/atdd/contracts/it/e2e/all）
- **AC-7**: Given `/derive all`, when 執行完成, then 產生 .feature + .test + .it.test + .e2e.test 四層
- **AC-8**: Given 多個 AC, when 推演完成, then 有 AC Level Summary 標記每個 AC 的建議層級
- **AC-9**: Given manifest 有 test_levels 設定, when 執行 `/derive all`, then 只推演已啟用的層級並跳過未啟用的

## Technical Design

### 變更方式

擴展 `core/forward-derivation-standards.md`，新增以下段落：
- `## Test Level Decision Tree`
- `## Integration Test Derivation`
- `## E2E Test Derivation`
- `## AC Level Marking`

更新 `skills/forward-derivation/SKILL.md` 和 `.claude/skills/forward-derivation/SKILL.md` 的子命令表。

更新 `skills/commands/derive.md` 加入 `it` 和 `e2e` 子命令。

### 不需要修改的

- 現有 BDD/TDD/ATDD 推演邏輯不變
- 現有 .feature 格式不變
- 不綁定特定測試框架

## Test Plan

- [ ] 決策樹涵蓋 E2E/IT/Unit 三種判斷路徑
- [ ] IT 骨架有 4 種介面範本
- [ ] E2E 骨架有 Gherkin→骨架的映射規則
- [ ] `/derive` 有 7 個子命令
- [ ] `/derive all` 產生 4 層測試檔案
- [ ] test_levels 配置感知：只推演已啟用層級
- [ ] 無 manifest 時預設推演所有層級
- [ ] AC Level Summary 有層級+理由

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-04-01 | 初始草稿 |
