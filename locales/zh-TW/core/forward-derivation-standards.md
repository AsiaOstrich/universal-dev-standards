---
source: ../../../core/forward-derivation-standards.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-16
source_hash: aaa890a7c159
status: current
---

# 正向推演標準 | Forward Derivation Standards

**版本**: 1.3.0
**最後更新**: 2026-03-18
**適用範圍**: 所有使用規格驅動開發的專案
**範疇**: uds-specific
**業界標準**: JSON Schema 2020-12
**參考資料**: [specmatic.io](https://specmatic.io/)

> **語言**: [English](../../../core/forward-derivation-standards.md) | 繁體中文

---

## 目的

本標準定義正向推演的原則與工作流程——從已核准的 SDD 規格自動生成 BDD 場景、TDD 測試骨架與 ATDD 驗收測試。正向推演與[反向工程標準](reverse-engineering-standards.md)互補，形成對稱的推演系統。

**主要優點**：
- 一致的測試結構與規格對齊
- 從需求到測試的可追溯性（@SPEC-XXX、@AC-N 標籤）
- 從已核准的規格更快啟動 TDD
- 減少手動轉換錯誤

---

## 正向推演工作流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       Forward Derivation Workflow                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ Parse SPEC  │───▶│Extract AC   │───▶│Generate BDD │───▶│Generate   │  │
│  │ 解析規格     │    │提取驗收條件  │    │生成 BDD     │    │TDD/ATDD   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │ Human Review  │ │
│        │                  │                  │         │ 人類審查       │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [Source]           [Parsed]          [Generated]        [Reviewed]    │
│   SPEC-XXX.md        AC List           .feature/.test     Ready to use  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 工作流程階段

| 階段 | 描述 | 輸出 | 確定性等級 |
|------|------|------|-----------|
| **Parse SPEC** | 讀取已核准的規格文件 | SPEC 元資料、章節 | [Source] |
| **Extract AC** | 解析驗收條件（GWT 或條列） | 結構化 AC 列表 | [Derived] |
| **Generate BDD** | 將 AC 轉換為 Gherkin 場景 | .feature 檔案 | [Generated] |
| **Generate TDD** | 從 AC 建立測試骨架 | 包含 TODO 的測試檔案 | [Generated] |
| **Generate ATDD** | 建立驗收測試表格 | Markdown 測試表格 | [Generated] |
| **Generate Contracts** | 提取前置／後置條件 | contract.json、schema.json | [Generated] |
| **Human Review** | 驗證生成的輸出 | 已核准的測試結構 | [Reviewed] |

---

## 核心原則

### 1. 規格限定生成

**規則**：僅推演已核准規格中存在的內容。絕不添加超出 AC 明確定義範圍的功能、場景或測試。

**正向推演原則**：只推演規格中明確存在的內容。不添加 AC 未明確定義的功能、場景或測試。

**正確**：
```markdown
# SPEC AC
- [ ] User can login with email and password

# Generated BDD (correct)
Scenario: User login with email and password
```

**錯誤**：
```markdown
# Generated BDD (wrong - adding beyond spec)
Scenario: User login with email and password
Scenario: User login with social auth  # <-- NOT in AC
Scenario: User password recovery       # <-- NOT in AC
```

### 2. 反幻覺合規

**規則**：本標準嚴格遵循[反幻覺標準](anti-hallucination.md)：

- **1:1 對應**：每個 AC 恰好產生一個場景／測試群組
- **禁止捏造**：絕不捏造驗收條件或測試案例
- **來源標註**：所有生成項目皆參照來源 SPEC 與 AC 編號

**反幻覺檢查**：
```
Input: SPEC with N acceptance criteria
Output: Exactly N scenarios (BDD), N test groups (TDD), N acceptance tables (ATDD)

If output count ≠ input count → VIOLATION
```

### 3. 來源標註

**規則**：每個生成的項目都必須包含可追溯性：

```gherkin
# BDD Example
# Generated from: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

```typescript
// TDD Example
/**
 * Generated from: specs/SPEC-001.md
 * AC: AC-1
 */
describe('AC-1: User login with valid credentials', () => {
```

### 4. 確定性標籤

使用這些標籤標示推演確定性：

| 標籤 | 定義 | 範例 |
|------|------|------|
| `[Source]` | 直接來自 SPEC 的內容 | 功能標題、AC 文字 |
| `[Derived]` | 從 SPEC 內容轉換 | 從條列 AC 轉換的 GWT |
| `[Generated]` | AI 生成的結構 | 測試骨架、TODO 註解 |
| `[TODO]` | 需要人類實作 | 測試斷言、步驟定義 |

### 5. 測試層級組態感知

**規則**：在推演測試之前，`/derive` 應檢查專案的 `test_levels` 組態，以決定要生成哪些測試層級。這可確保推演遵循團隊的測試策略。

**組態來源**（依序檢查）：
1. `.standards/.uds.manifest.json` → `options.test_levels`
2. `uds-manifest.json` → `stats` 或根層級的 `test_levels`
3. 若未找到任何組態 → 預設為所有層級（`unit-testing`、`integration-testing`、`system-testing`、`e2e-testing`）

**行為**：

| 設定的 test_levels | `/derive all` 產出 |
|-------------------|-------------------|
| `['unit-testing']` | 僅 BDD + TDD |
| `['unit-testing', 'integration-testing']` | BDD + TDD + IT |
| `['unit-testing', 'integration-testing', 'e2e-testing']` | BDD + TDD + IT + E2E |
| `['unit-testing', 'integration-testing', 'system-testing', 'e2e-testing']`（預設） | BDD + TDD + IT + E2E（全部） |
| 無 manifest / 無 test_levels | 所有層級（同預設） |

**對應**：

| test_levels 值 | 推演輸出 |
|----------------|---------|
| `unit-testing` | `/derive-tdd`（一律包含） |
| `integration-testing` | `/derive-it` |
| `system-testing` | `/derive-it`（系統 = 涵蓋範圍更廣的整合） |
| `e2e-testing` | `/derive-e2e` |

**附註**：無論 `test_levels` 為何，BDD（.feature）、ATDD（acceptance.md）與契約（contract.json）都會生成，因為它們屬於規格產物，而非特定測試層級專用。

**AI Agent 指令**：執行 `/derive all` 時，請先檢查 `test_levels` 組態。如果 `e2e-testing` 不在設定的層級中，請略過 E2E 骨架生成並通知使用者：「略過 E2E 推演——未包含在專案 test_levels 組態中。請執行 `uds config --type test_levels` 以加入。」

---

## 輸入格式要求

### 支援的 AC 格式

#### 格式 1：Given-When-Then（推薦）

```markdown
### AC-1: User Login
**Given** a registered user with valid credentials
**When** the user submits login form with email and password
**Then** the user is redirected to dashboard
**And** a session token is created
```

#### 格式 2：條列式

```markdown
### AC-1: User Login
- User can login with email and password
- Login redirects to dashboard on success
- Login shows error for invalid credentials
```

#### 格式 3：勾選清單

```markdown
## Acceptance Criteria
- [ ] User can login with email and password
- [ ] Session is created on successful login
- [ ] Error message shown for invalid credentials
```

---

## 輸出格式

### BDD 輸出 (.feature)

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: forward-derivation v1.0.0
# Generated at: 2026-01-19T10:00:00Z

Feature: User Authentication
  As a user
  I want to login to the system
  So that I can access my dashboard

  @SPEC-001 @AC-1 @happy-path
  Scenario: User login with valid credentials
    # [Source] From SPEC-001 AC-1
    Given a registered user with valid credentials
    When the user submits login form with email and password
    Then the user is redirected to dashboard
    And a session token is created

  @SPEC-001 @AC-2 @error-handling
  Scenario: Login fails with invalid credentials
    # [Source] From SPEC-001 AC-2
    Given a user with invalid credentials
    When the user submits login form
    Then an error message is displayed
    And no session is created
```

### TDD 輸出 (.test.ts)

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2
 *
 * [Generated] This file contains test skeletons.
 * [TODO] Implement test logic and assertions.
 */

describe('SPEC-001: User Authentication', () => {
  /**
   * AC-1: User login with valid credentials
   * [Source] specs/SPEC-001.md#AC-1
   */
  describe('AC-1: User login with valid credentials', () => {
    it('should redirect to dashboard on successful login', async () => {
      // Arrange
      // [TODO] Set up registered user with valid credentials

      // Act
      // [TODO] Submit login form with email and password

      // Assert
      // [TODO] Verify redirect to dashboard
      // [TODO] Verify session token is created
      expect(true).toBe(true); // Placeholder - replace with actual assertion
    });
  });

  /**
   * AC-2: Login fails with invalid credentials
   * [Source] specs/SPEC-001.md#AC-2
   */
  describe('AC-2: Login fails with invalid credentials', () => {
    it('should display error message for invalid credentials', async () => {
      // Arrange
      // [TODO] Set up user with invalid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify error message is displayed
      // [TODO] Verify no session is created
      expect(true).toBe(true); // Placeholder - replace with actual assertion
    });
  });
});
```

### ATDD 輸出 (acceptance.md)

```markdown
# SPEC-001 Acceptance Tests

**Specification**: [SPEC-001](../specs/SPEC-001.md)
**Generated**: 2026-01-19
**Status**: Pending Review

---

## AT-001: User login with valid credentials

**Source**: AC-1 from SPEC-001

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to login page | Login form is displayed | [ ] |
| 2 | Enter valid email | Email field accepts input | [ ] |
| 3 | Enter valid password | Password field accepts input (masked) | [ ] |
| 4 | Click "Login" button | Form is submitted | [ ] |
| 5 | Verify redirect | User is on dashboard page | [ ] |
| 6 | Verify session | Session token exists in storage | [ ] |

**Prerequisites**: User account exists in system

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

## AT-002: Login fails with invalid credentials

**Source**: AC-2 from SPEC-001

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to login page | Login form is displayed | [ ] |
| 2 | Enter invalid email | Email field accepts input | [ ] |
| 3 | Enter invalid password | Password field accepts input | [ ] |
| 4 | Click "Login" button | Form is submitted | [ ] |
| 5 | Verify error | Error message is displayed | [ ] |
| 6 | Verify no session | No session token in storage | [ ] |

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________
```

### 契約輸出 (contract.json)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "metadata": {
    "generatedFrom": "specs/SPEC-001.md",
    "generatedAt": "2026-01-25T10:00:00Z",
    "generator": "forward-derivation v1.1.0",
    "acCoverage": ["AC-1", "AC-2"]
  },
  "contracts": [
    {
      "id": "AC-1",
      "name": "User login with valid credentials",
      "preconditions": [
        { "type": "state", "description": "User is registered in system" },
        { "type": "input", "description": "Valid email and password provided" }
      ],
      "postconditions": [
        { "type": "state", "description": "User session created" },
        { "type": "output", "description": "Redirect to dashboard" }
      ],
      "invariants": [
        { "description": "Session token is cryptographically secure" }
      ]
    },
    {
      "id": "AC-2",
      "name": "Login fails with invalid credentials",
      "preconditions": [
        { "type": "input", "description": "Invalid credentials provided" }
      ],
      "postconditions": [
        { "type": "state", "description": "No session created" },
        { "type": "output", "description": "Error message displayed" }
      ]
    }
  ]
}
```

### Schema 輸出 (schema.json)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "metadata": {
    "generatedFrom": "specs/SPEC-001.md",
    "generatedAt": "2026-01-25T10:00:00Z",
    "generator": "forward-derivation v1.1.0"
  },
  "schemas": {
    "LoginRequest": {
      "type": "object",
      "required": ["email", "password"],
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "description": "[Source] SPEC-001 AC-1: Valid email required"
        },
        "password": {
          "type": "string",
          "minLength": 8,
          "description": "[Source] SPEC-001 AC-1: Password required"
        }
      }
    },
    "LoginResponse": {
      "type": "object",
      "required": ["success"],
      "properties": {
        "success": { "type": "boolean" },
        "sessionToken": {
          "type": "string",
          "description": "[Source] SPEC-001 AC-1: Session token on success"
        },
        "errorMessage": {
          "type": "string",
          "description": "[Source] SPEC-001 AC-2: Error message on failure"
        }
      }
    }
  }
}
```

---

## 條列式轉 GWT 轉換

當 AC 以條列點撰寫時，使用此模式轉換：

### 轉換規則

| 條列模式 | 對應到 | 範例 |
|----------|--------|------|
| 條件/狀態 | Given | 「使用者已登入」→ Given 使用者已登入 |
| 使用者動作 | When | 「使用者點擊按鈕」→ When 使用者點擊按鈕 |
| 系統回應 | Then | 「顯示訊息」→ Then 顯示訊息 |
| 「可以/應該/必須」 | When + Then | 「使用者可以刪除項目」→ When 使用者刪除項目 Then 項目已移除 |

### 轉換範例

**輸入（條列式）**：
```markdown
- [ ] User can add item to cart
- [ ] Cart displays item count
- [ ] Cart total updates automatically
```

**輸出（GWT）**：
```gherkin
Scenario: Add item to cart
  Given user is on product page
  When user clicks "Add to Cart" button
  Then item is added to cart
  And cart displays updated item count
  And cart total updates automatically
```

---

## 與開發方法論的整合

### 正向推演管道

```
┌───────────────────────────────────────────────────────────────────────┐
│              Symmetrical Derivation System                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  REVERSE ENGINEERING                    FORWARD DERIVATION            │
│  (Code → Spec)                          (Spec → Tests)                │
│                                                                       │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ Existing Code │                      │ Approved SPEC │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ /reverse-spec │                      │  /derive-bdd  │            │
│  │ /reverse-bdd  │◀─────SPEC-XXX───────▶│  /derive-tdd  │            │
│  │ /reverse-tdd  │                      │  /derive-atdd │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ Draft SPEC    │                      │ .feature      │            │
│  │ [Confirmed]   │                      │ .test.ts      │            │
│  │ [Inferred]    │                      │ acceptance.md │            │
│  │ [Unknown]     │                      │ [Generated]   │            │
│  └───────────────┘                      └───────────────┘            │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 與整合流程方法論

正向推演位於 `spec-review` 和 `discovery` 階段之間：

```yaml
spec-review → forward-derivation → discovery
```

1. **規格審查 (SDD)**：規格已批准
2. **正向推演**：自動生成 BDD 場景、TDD 骨架
3. **探索 (BDD)**：與利害關係人審查和精煉生成的場景
4. **TDD 紅燈**：使用生成的骨架開始實作測試

---

## 終端投影：使用者指南

推演鏈不止於測試。**使用者指南是同一條鏈的終端投影**——E2E／旅程測試以機器驗證的那條作業流程，其供人閱讀的視圖。「使用者讀到的操作步驟」與「E2E 實際驗證的行為」因此成為一個被維持的不變量。

- **單一真實來源**：SPEC 的驗收條件（AC）。所有下游產物——BDD 場景、TDD／IT／E2E 骨架、ATDD 表格、契約，**以及使用者指南**——都是同一條 AC 主幹的投影。使用者指南不是另一個要互相對照的來源，而是又一個投影。
- **僅限 user-facing AC**：唯有**終端使用者可直接觀察或操作**的 AC（UI 流程、CLI 指令、對外 API 的使用者語意）才需要使用者指南步驟。純內部 AC（重構、內部模組契約、效能門檻、安全內控）無使用者指南義務。**判不準時一律歸 user-facing**——保守預設；必須明確標記才能排除。
- **共用編號（`T-NNN`）**：每個使用者指南步驟標 `T-NNN`，且該 `T-NNN` 必須是某個真實 journey／E2E 測試的 id。使用者指南與 E2E 套件是同一作業流程的兩個投影、共用一把尺。模稜兩可或未標記一律報為**未覆蓋**（寧可冗餘不要遺漏）。
  - ✅ 使用者指南步驟 `T-012 "Create a project"` ↔ journey spec 中的 E2E 測試 `T-012`。
  - ❌ 使用者指南自造 `UG-3` 卻無對應測試 → drift，報為未覆蓋。
- **Drift 反例**：使用者指南寫 "2-click checkout"、E2E 卻仍驗 "3-step payment"——沒有共用編號就無人察覺。共用 `T-NNN` 把這種 drift 變成被報出的覆蓋缺口。

### 單一主幹原則（非平行對照）

測試與文件來源是**同一條 AC 主幹的多層投影**，不是互相對照的獨立真實來源。TDD／IT／E2E 是同一主幹的金字塔*層級*（參見測試層級決策樹），非彼此競爭的來源。兩兩對照 N 個來源（N×N）會滋生 drift；把每個產物投影回單一 AC 主幹（N×1）則消除它。

> **規則**：每個測試或文件產物都必須回溯到某個 AC。另立**平行編號體系**——一條脫離 AC 主幹的第二套 `T-NNN` 系列——即為違規。只有一把尺：AC 主幹，且 `T-NNN` 由 journey／E2E 測試與使用者指南共用。

---

## 測試層級決策樹

根據 AC 的性質決定應生成哪種測試層級：

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

---

## 整合測試推演

當 AC 涉及多個服務/元件互動或外部系統呼叫時，生成 Integration Test 骨架。

### 介面範本

#### HTTP API

```
Setup:
  - Start test server / mock server
  - Seed test data (DB fixtures, mock responses)

Request:
  - Send HTTP request (method, path, headers, body)
  - [TODO] Fill in request details from AC

Assert:
  - Verify response status code
  - Verify response body structure
  - Verify side effects (DB state, event published)
  - [TODO] Fill in expected values from AC

Teardown:
  - Clean up test data
  - Stop test server / mock server
```

#### Database

```
Setup:
  - Connect to test database
  - Run migrations / seed schema
  - Insert prerequisite data

Action:
  - Execute query / repository method
  - [TODO] Fill in operation details from AC

Assert:
  - Verify returned data matches expected
  - Verify data persistence (read-after-write)
  - Verify constraints (unique, foreign key)
  - [TODO] Fill in expected results from AC

Teardown:
  - Rollback transaction / truncate tables
  - Disconnect from test database
```

#### Message Queue

```
Setup:
  - Connect to test queue (or in-memory broker)
  - Subscribe to target topic/queue
  - Prepare message payload

Action:
  - Publish message to queue
  - [TODO] Fill in message details from AC

Assert:
  - Verify message received by consumer
  - Verify message payload structure
  - Verify consumer side effects (DB write, API call)
  - [TODO] Fill in expected behavior from AC

Teardown:
  - Drain queue
  - Disconnect from broker
```

#### Service-to-Service

```
Setup:
  - Start dependent service (or mock/stub)
  - Configure service discovery / endpoints
  - Prepare request context

Action:
  - Call target service method / endpoint
  - [TODO] Fill in service call details from AC

Assert:
  - Verify response from target service
  - Verify downstream service was called correctly
  - Verify error propagation (if applicable)
  - [TODO] Fill in expected interactions from AC

Teardown:
  - Stop mock services
  - Clean up shared state
```

---

## E2E 測試推演

當 AC 涉及使用者介面操作時，生成 E2E Test 骨架。

### Browser E2E Skeleton | 瀏覽器 E2E 骨架

```
Environment:
  - Launch browser (headless or headed)
  - Set viewport, locale, auth state
  - [TODO] Configure environment from AC prerequisites

Navigation:
  - Navigate to target URL / page
  - Wait for page load / element visibility
  - [TODO] Fill in target page from AC

Interaction:
  - Perform user actions (click, type, select, scroll)
  - [TODO] Fill in user actions from AC steps

Assertion:
  - Verify page state (URL, title, element text)
  - Verify visual elements (visible, hidden, enabled)
  - Verify data changes reflected in UI
  - [TODO] Fill in expected outcomes from AC

Cleanup:
  - Reset application state
  - Close browser context
```

### Gherkin Step Mapping | Gherkin 步驟映射

| Gherkin 關鍵字 | 對應到 | E2E 階段 |
|-----------------|---------|-----------|
| `Given` | 設定 + 導航 | 環境準備、頁面導航、前置狀態 |
| `When` | 互動 | 使用者動作（點擊、輸入、提交） |
| `Then` | 斷言 | 驗證預期結果（頁面狀態、UI 元素、資料） |
| `And` / `But` | 延伸前一項 | 額外的設定、互動或斷言 |

**映射範例**：

```gherkin
# Gherkin (from BDD)
Given a logged-in user on the dashboard     → Environment: set auth state; Navigation: go to /dashboard
When the user clicks "Create Project"       → Interaction: click button "Create Project"
And fills in the project name "My Project"  → Interaction: type "My Project" into name field
And clicks "Submit"                         → Interaction: click button "Submit"
Then a success message is displayed         → Assertion: verify success message visible
And the project appears in the project list → Assertion: verify "My Project" in project list
```

---

## AC 層級摘要標記

當 `/derive all` 產生多層級輸出時，在輸出的末尾包含一份 **AC 層級摘要**（AC Level Summary），以協助開發人員理解每個 AC 為何被分配到特定測試層級：

```markdown
## AC Level Summary
| AC | Suggested Level | Rationale |
|----|----------------|-----------|
| AC-1 | E2E | Involves UI redirect and page navigation |
| AC-2 | Integration | API endpoint with database interaction |
| AC-3 | Unit | Pure calculation, no external dependencies |
| AC-4 | Integration | Calls external payment gateway API |
```

此摘要僅供參考——開發人員可根據自身判斷覆寫建議的層級。

---

## 命令

### 命令參考

| 命令 | 輸入 | 輸出 | 目的 |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 場景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 測試骨架 |
| `/derive-it` | SPEC-XXX.md or .feature | .it.test.* | AC → 整合測試骨架 |
| `/derive-e2e` | SPEC-XXX.md or .feature | .e2e.test.* | AC → E2E 測試骨架 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 驗收測試表格 |
| `/derive-contracts` | SPEC-XXX.md | contract.json, schema.json | AC → 合約與 schema 定義 |
| `/derive-all` | SPEC-XXX.md | 以上全部 | 完整推演管線（BDD + TDD + IT + E2E + ATDD + 合約） |

### 命令參數

| 參數 | 類型 | 預設值 | 描述 |
|-----------|------|---------|-------------|
| `--lang` | string | typescript | 目標：ts, js, python, java, go |
| `--framework` | string | vitest | 框架：vitest, jest, pytest, junit, go-test |
| `--output-dir` | string | ./generated | 輸出目錄 |
| `--dry-run` | boolean | false | 預覽不建立檔案 |

### 使用範例

```bash
# Generate BDD scenarios from specification
/derive-bdd specs/SPEC-001.md

# Generate TDD test skeleton with Python/pytest
/derive-tdd specs/SPEC-001.md --lang python --framework pytest

# Generate contract and schema definitions for verification
/derive-contracts specs/SPEC-001.md --output-dir ./contracts

# Generate integration test skeletons
/derive-it specs/SPEC-001.md --lang python --framework pytest

# Generate E2E test skeletons
/derive-e2e specs/SPEC-001.md --framework playwright

# Generate all outputs (BDD + TDD + IT + E2E + ATDD + Contracts)
/derive-all specs/SPEC-001.md --output-dir ./generated

# Preview without creating files
/derive-all specs/SPEC-001.md --dry-run
```

---

## Pipeline 整合

### 自動 TDD 轉換

當正向推演由自動化 Pipeline 觸發時（參見 [Pipeline 整合標準](pipeline-integration-standards.md)），以下規則適用於轉換至 TDD 循環：

#### Auto-TDD 進入規則

| 規則 | 說明 |
|------|-------------|
| **推演完整性** | 所有推演輸出（BDD、TDD、ATDD）必須在進入 TDD 前完成生成 |
| **RED 狀態初始化** | Pipeline 在生成測試骨架後將 TDD 狀態設為 RED |
| **測試骨架驗證** | 生成的測試檔案必須能編譯/解析無誤後才能進入 RED |
| **AC 計數驗證** | 進入轉換前驗證輸出測試數量與 AC 數量匹配 |

#### Pipeline Hooks

推演步驟可透過 Pipeline 事件自動觸發：

| Hook | 觸發條件 | 動作 |
|------|---------|--------|
| `on-spec-approved` | Spec 狀態變更為「已批准」 | 啟動推演 Pipeline |
| `on-derivation-complete` | 所有推演輸出已生成 | 轉換至 TDD RED 階段 |
| `on-tdd-green` | 所有推演測試通過 | 觸發審查階段 |

#### Auto-TDD 進入工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Spec Approved│───▶│  Derive All  │───▶│ Verify Count │───▶│  TDD RED     │
│ (hook)       │    │  BDD+TDD+ATDD│    │ AC = Tests   │    │  (auto-set)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Spec 批准**：Pipeline 偵測到 Spec 批准（透過 hook 或輪詢）
2. **完整推演**：Pipeline 以專案配置的語言/框架執行 `/derive-all`
3. **計數驗證**：Pipeline 驗證輸出數量與 AC 數量匹配（反幻覺）
4. **RED 狀態**：Pipeline 將 TDD 狀態設為 RED；測試骨架存在但斷言為 [TODO]

#### 與 Pipeline 階段的整合

正向推演對應 [Pipeline 整合標準](pipeline-integration-standards.md) 6 階段模型中的 **DERIVE** 階段：

| Pipeline 階段 | 正向推演角色 |
|---------------|------------------------|
| SPEC | 輸入：已批准的規格 |
| **DERIVE** | 執行：解析 AC → 生成 BDD/TDD/ATDD 輸出 |
| BUILD | 輸出：測試骨架進入 TDD RED→GREEN 循環 |

---

## 失敗處理與復原

正向推演定義了數個關卡（AC 解析、計數驗證、骨架驗證、人類審查）。本節定義當關卡**失敗**時的處理方式——即 失敗 → 回滾 → 重試/升級呈報 → 重新驗證 的路徑——確保失敗的推演絕不靜默產出部分或幻覺輸出。

### 失敗 → 復原矩陣

| 失敗情況 | 偵測階段 | 復原動作 | 重新驗證 |
|---------|-------------|-----------------|-----------|
| **解析錯誤**——AC 不在支援的格式中（GWT / 條列式） | DERIVE（解析 AC） | 中止該 AC 的生成；回報 `file:line` 與預期格式；不為其產出骨架。待 SPEC 修復後重新排隊。 | 修正後的 AC 解析成功 |
| **AC 計數不符**——生成的測試數量 ≠ AC 數量 | 計數驗證 | **[違反反幻覺規則]** 回滾整批並在嚴格 1:1 對應下重新生成。絕不可透過新增或刪除測試來「湊齊數量」——這會掩蓋幻覺。 | 計數檢查通過（測試數 = AC 數） |
| **骨架無法解析/編譯** | 骨架驗證 | 回滾有問題的檔案；使用正確的語言範本重新生成。若第二次仍失敗，將該 AC 標記為 `[BLOCKED]` 並呈報給人工處理。 | 檔案解析/編譯通過 |
| **人類審查退回**——審查者指出邏輯錯誤或未填寫的 `[TODO]` | 人類審查關卡 | 記錄退回原因；將該回饋作為額外限制，僅重新生成被退回的項目。絕不可自動批准。 | 審查者接受 |
| **缺少來源標註**——輸出缺少 `@SPEC-XXX` / `@AC-N` | 任何階段 | 阻止轉換至 TDD RED；補上來源標註後重新產出。 | 每個輸出皆帶有來源標註 |

### 復原規則

| 規則 | 說明 | 嚴重程度 |
|------|-------------|----------|
| **FD-FAIL-001** | 關卡失敗必須中斷流程——絕不可在有未解決失敗的情況下進入 TDD RED。 | 必要 |
| **FD-FAIL-002** | 計數不符屬於強制回滾，而非調節對帳；嚴禁透過新增或刪除測試來湊數（這會掩蓋幻覺）。 | 必要 |
| **FD-FAIL-003** | 自動重試有次數限制（最多 2 次，針對瞬時或範本錯誤）；重試耗盡時將 AC 標記為 `[BLOCKED]` 並呈報給人工處理。 | 必要 |
| **FD-FAIL-004** | 每個復原路徑皆以重新驗證失敗的關卡結束——在原始檢查通過之前，復原不算完成。 | 必要 |

---

## 應避免的反模式

### 生成反模式

| 反模式 | 影響 | 正確做法 |
|--------|------|----------|
| **添加額外場景** | 測試膨脹、誤導覆蓋率 | 嚴格 1:1 AC 對應 |
| **發明測試案例** | 虛假信心 | 只從明確的 AC 推演 |
| **跳過來源標註** | 失去可追溯性 | 永遠包含 @SPEC-XXX、@AC-N |
| **過度指定步驟** | 脆弱的測試 | 保持步驟在業務層級 |
| **缺少 TODO 標記** | 實作不完整 | 標記所有生成程式碼為 [TODO] |

### 流程反模式

| 反模式 | 影響 | 正確做法 |
|--------|------|----------|
| **從草稿 SPEC 推演** | 無效輸出 | 只使用已批准的規格 |
| **跳過人類審查** | 品質問題 | 永遠審查生成的輸出 |
| **將骨架視為完整** | 缺少斷言 | 填寫 [TODO] 區塊 |
| **忽略語言慣例** | 不一致的程式碼 | 使用適當的語言範本 |

---

## 最佳實踐

### 應該做的

- ✅ 只從已批准的規格推演
- ✅ 維持嚴格的 1:1 AC 到輸出對應
- ✅ 在所有輸出中包含來源標註
- ✅ 使用 [TODO] 標記需要實作的區塊
- ✅ 使用前審查生成的輸出
- ✅ 保持生成的步驟在業務/領域層級
- ✅ 使用適當的語言/框架範本

### 不應該做的

- ❌ 添加 AC 未定義的場景
- ❌ 從草稿或未批准的規格推演
- ❌ 跳過對生成輸出的人類審查
- ❌ 將生成的骨架視為完整測試
- ❌ 移除來源標註註解
- ❌ 在生成的程式碼中過度指定實作細節

---

## 工具整合

### Skill 參考

- [正向推演 Skill](../skills/spec-derivation/SKILL.md) - 詳細工作流程實作
- [規格驅動開發 Skill](../skills/spec-driven-dev/SKILL.md) - SDD 工作流程
- [BDD 助理 Skill](../skills/bdd-assistant/SKILL.md) - Gherkin 精煉
- [TDD 助理 Skill](../skills/tdd-assistant/SKILL.md) - 測試實作

---

## 相關規範

- [反向工程標準](reverse-engineering-standards.md) - 對稱的對應標準（程式碼 → 規格）
- [規格驅動開發](spec-driven-development.md) - 輸入規格格式
- [行為驅動開發](behavior-driven-development.md) - BDD 輸出格式
- [測試驅動開發](test-driven-development.md) - TDD 輸出使用方式
- [驗收測試驅動開發](acceptance-test-driven-development.md) - ATDD 輸出格式
- [反幻覺指引](anti-hallucination.md) - 生成合規性

---

## 參考資料

### 書籍

- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009) - 雙迴圈 TDD 模式基礎
- Gojko Adzic - "Specification by Example" (2011) - 從規格到測試推演的概念

### 線上資源

#### 合約測試

- [Microsoft: Consumer-Driven Contract Testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/cdc-testing/) - 關於 CDC 測試的工程實務手冊
- [BrowserStack: Contract Testing Guide](https://www.browserstack.com/guide/contract-testing) - 全面的合約測試概述
- [Specmatic: AI-powered API Contract Testing](https://specmatic.io/) - 現代合約優先開發工具

#### 驗證理論

- [Wikipedia: Formal Verification](https://en.wikipedia.org/wiki/Formal_verification) - 驗證的理論基礎
- [Wikipedia: Design by Contract](https://en.wikipedia.org/wiki/Design_by_contract) - Bertrand Meyer 的 DbC 概念 (1986)

#### SDD 與正向推演

- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) - SDD 方法論定義
- [Martin Fowler: SDD Tools (Kiro, spec-kit, Tessl)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) - AI 時代 SDD 工具探索
- [GitHub spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md) - GitHub 的 SDD 實作
- [InfoQ: Spec-Driven Development](https://www.infoq.com/articles/spec-driven-development/) - SDD 實務概述

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.3.0 | 2026-06-18 | 新增：失敗處理與復原章節 — failure→rollback→retry/escalate→re-verify 矩陣 + 復原規則 FD-FAIL-001..004（XSPEC-292 T7） |
| 1.2.0 | 2026-03-18 | 新增：Pipeline 整合章節 — auto-TDD 轉換、Pipeline hooks、auto-TDD 進入工作流程 |
| 1.1.0 | 2026-01-25 | 新增：合約輸出 (contract.json)、Schema 輸出 (schema.json)、用於驗證產物生成的 /derive-contracts 命令 |
| 1.0.0 | 2026-01-19 | 初始發布 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
