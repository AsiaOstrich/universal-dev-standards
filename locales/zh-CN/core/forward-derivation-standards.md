---
source: ../../../core/forward-derivation-standards.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-16
source_hash: aaa890a7c159
status: current
---

# Forward Derivation Standards | 正向推演标准

**版本**: 1.3.0
**最后更新**: 2026-03-18
**适用范围**: 所有使用规格驱动开发的项目
**范围**: uds-specific
**行业标准**: JSON Schema 2020-12
**参考**: [specmatic.io](https://specmatic.io/)

> **语言**: [English](../../../core/forward-derivation-standards.md) | [繁體中文](../../zh-TW/core/forward-derivation-standards.md) | 简体中文

---

## 目的

本标准定义正向推演的原则和工作流程——从已批准的 SDD 规格自动生成 BDD 场景、TDD 测试骨架和 ATDD 验收测试。正向推演与[反向工程标准](reverse-engineering-standards.md)互补，形成对称的推演系统。

**主要优点**：
- 与规格对齐的一致测试结构
- 从需求到测试的可追溯性（@SPEC-XXX、@AC-N 标签）
- 从已批准规格更快启动 TDD
- 减少手动转换错误

---

## 正向推演工作流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       Forward Derivation Workflow                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ Parse SPEC  │───▶│Extract AC   │───▶│Generate BDD │───▶│Generate   │  │
│  │ 解析规格     │    │提取验收条件  │    │生成 BDD     │    │TDD/ATDD   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │ Human Review  │ │
│        │                  │                  │         │ 人类审查       │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [Source]           [Parsed]          [Generated]        [Reviewed]    │
│   SPEC-XXX.md        AC List           .feature/.test     Ready to use  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 工作流程阶段

| 阶段 | 描述 | 输出 | 确定性等级 |
|------|------|------|-----------|
| **解析 SPEC** | 读取已批准的规格文档 | SPEC 元数据、章节 | [Source] |
| **提取 AC** | 解析验收条件（GWT 或条列） | 结构化 AC 列表 | [Derived] |
| **生成 BDD** | 将 AC 转换为 Gherkin 场景 | .feature 文件 | [Generated] |
| **生成 TDD** | 从 AC 创建测试骨架 | 带 TODO 的测试文件 | [Generated] |
| **生成 ATDD** | 创建验收测试表格 | Markdown 测试表格 | [Generated] |
| **生成契约** | 提取前置/后置条件 | contract.json, schema.json | [Generated] |
| **人类审查** | 验证生成的输出 | 已批准的测试结构 | [Reviewed] |

---

## 核心原则

### 1. 规格限定生成

**规则**：只推演已批准规格中存在的内容。切勿添加 AC 未明确定义的功能、场景或测试。

**正向推演原则**：只推演规格中明确存在的内容。不添加 AC 未明确定义的功能、场景或测试。

**正确**：
```markdown
# SPEC AC
- [ ] User can login with email and password

# Generated BDD (correct)
Scenario: User login with email and password
```

**错误**：
```markdown
# Generated BDD (wrong - adding beyond spec)
Scenario: User login with email and password
Scenario: User login with social auth  # <-- NOT in AC
Scenario: User password recovery       # <-- NOT in AC
```

### 2. 反幻觉合规

**规则**：本标准严格遵循[反幻觉标准](anti-hallucination.md)：

- **1:1 映射**：每个 AC 产生恰好一个场景/测试组
- **禁止捏造**：切勿捏造验收条件或测试用例
- **来源标注**：所有生成项均引用来源 SPEC 和 AC 编号

**反幻觉检查**：
```
Input: SPEC with N acceptance criteria
Output: Exactly N scenarios (BDD), N test groups (TDD), N acceptance tables (ATDD)

If output count ≠ input count → VIOLATION
```

### 3. 来源标注

**规则**：每个生成项必须包含可追溯性：

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

### 4. 确定性标签

使用这些标签标示推演确定性：

| 标签 | 定义 | 示例 |
|------|------|------|
| `[Source]` | 直接来自 SPEC 的内容 | 功能标题、AC 文本 |
| `[Derived]` | 从 SPEC 内容转换 | 从条列 AC 转换的 GWT |
| `[Generated]` | AI 生成的结构 | 测试骨架、TODO 注释 |
| `[TODO]` | 需要人工实现 | 测试断言、步骤定义 |

### 5. 测试级别配置感知

**规则**：在推演测试之前，`/derive` 应当检查项目的 `test_levels` 配置，以确定要生成哪些测试级别。这确保推演遵循团队的测试策略。

**配置来源**（按顺序检查）：
1. `.standards/.uds.manifest.json` → `options.test_levels`
2. `uds-manifest.json` → `stats` 或根级别的 `test_levels`
3. 若未找到配置 → 默认包含所有级别（`unit-testing`、`integration-testing`、`system-testing`、`e2e-testing`）

**行为**：

| 已配置的 test_levels | `/derive all` 生成内容 |
|----------------------|----------------------|
| `['unit-testing']` | 仅 BDD + TDD |
| `['unit-testing', 'integration-testing']` | BDD + TDD + IT |
| `['unit-testing', 'integration-testing', 'e2e-testing']` | BDD + TDD + IT + E2E |
| `['unit-testing', 'integration-testing', 'system-testing', 'e2e-testing']`（默认） | BDD + TDD + IT + E2E（全部） |
| 无清单 / 无 test_levels | 所有级别（与默认相同） |

**映射**：

| test_levels 值 | 推演输出 |
|-------------------|------------------|
| `unit-testing` | `/derive-tdd`（始终包含） |
| `integration-testing` | `/derive-it` |
| `system-testing` | `/derive-it`（system = 更广泛的集成） |
| `e2e-testing` | `/derive-e2e` |

**注意**：BDD（.feature）、ATDD（acceptance.md）和契约（contract.json）始终都会生成，不受 test_levels 影响，因为它们属于规格产物，而非特定于某个测试级别。

**AI Agent 指令**：执行 `/derive all` 时，首先检查 `test_levels` 配置。如果 `e2e-testing` 不在已配置的级别中，则跳过 E2E 骨架生成并通知用户："Skipping E2E derivation — not in project test_levels configuration. Run `uds config --type test_levels` to add it."

---

## 输入格式要求

### 支持的 AC 格式

#### 格式 1：Given-When-Then（推荐）

```markdown
### AC-1: User Login
**Given** a registered user with valid credentials
**When** the user submits login form with email and password
**Then** the user is redirected to dashboard
**And** a session token is created
```

#### 格式 2：条列式

```markdown
### AC-1: User Login
- User can login with email and password
- Login redirects to dashboard on success
- Login shows error for invalid credentials
```

#### 格式 3：勾选清单

```markdown
## Acceptance Criteria
- [ ] User can login with email and password
- [ ] Session is created on successful login
- [ ] Error message shown for invalid credentials
```

---

## 输出格式

### BDD 输出 (.feature)

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

### TDD 输出 (.test.ts)

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

### ATDD 输出 (acceptance.md)

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

### 契约输出 (contract.json)

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

### Schema 输出 (schema.json)

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

## 条列式转 GWT 转换

当 AC 以条列点编写时，使用此模式转换：

### 转换规则

| 条列模式 | 对应到 | 范例 |
|----------|--------|------|
| 条件/状态 | Given | “用户已登录” → Given 用户已登录 |
| 用户动作 | When | “用户点击按钮” → When 用户点击按钮 |
| 系统响应 | Then | “显示消息” → Then 显示消息 |
| “可以/应该/必须” | When + Then | “用户可以删除项目” → When 用户删除项目 Then 项目已移除 |

### 转换示例

**输入（条列）**：
```markdown
- [ ] User can add item to cart
- [ ] Cart displays item count
- [ ] Cart total updates automatically
```

**输出（GWT）**：
```gherkin
Scenario: Add item to cart
  Given user is on product page
  When user clicks "Add to Cart" button
  Then item is added to cart
  And cart displays updated item count
  And cart total updates automatically
```

---

## 与开发方法论的整合

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

### 与整合流程方法论

正向推演位于 `spec-review` 和 `discovery` 阶段之间：

```yaml
spec-review → forward-derivation → discovery
```

1. **规格审查 (SDD)**：规格已批准
2. **正向推演**：自动生成 BDD 场景、TDD 骨架
3. **探索 (BDD)**：与利益相关者审查和完善生成的场景
4. **TDD 红灯**：使用生成的骨架开始实现测试

---

## 终端投影：用户指南

推演链不止于测试。**用户指南是同一条链的终端投影**——E2E/旅程测试以机器验证的那条工作流程，其供人阅读的视图。“用户读到的操作步骤”与“E2E 实际验证的行为”成为一个被维持的不变量。

- **单一真实来源**：SPEC 的验收条件（AC）。所有下游产物——BDD 场景、TDD/IT/E2E 骨架、ATDD 表格、契约，**以及用户指南**——都是同一条 AC 主干的投影。用户指南不是另一个要互相对照的来源；它是又一个投影。
- **仅限 user-facing AC**：唯有**终端用户可直接观察或操作**的 AC（UI 流程、CLI 命令、面向用户的 API 语义）才需要用户指南步骤。纯内部 AC（重构、内部模块契约、性能阈值、安全控制）无用户指南义务。**拿不准时一律视作 user-facing**——保守默认；必须明确标记才能排除。
- **共享编号（`T-NNN`）**：每个用户指南步骤都标记 `T-NNN`，且该 `T-NNN` 必须是某个真实旅程/E2E 测试的 id。用户指南与 E2E 测试套件是同一工作流程的两个投影，共享一把尺子。模棱两可或缺失的标记均被报告为**未覆盖**（宁可冗余不可遗漏）。
  - ✅ 用户指南步骤 `T-012 "Create a project"` ↔ 旅程规格中的 E2E 测试 `T-012`。
  - ❌ 用户指南自造 `UG-3` 却无对应测试 → 漂移，报告为未覆盖。
- **漂移示例**：用户指南写着“2-click checkout”，而 E2E 仍验证“3-step payment”——若没有共享编号，无人会察觉。共享 `T-NNN` 将这种漂移转化为被报告的覆盖缺口。

### 单一主干原则（非平行对照）

测试与文档来源是**同一条 AC 主干的多层投影**，不是互相对照的独立真实来源。TDD/IT/E2E 是同一主干的金字塔*层级*（参见测试层级决策树），而非彼此竞争的来源。对 N 个来源两两对照（N×N）会滋生漂移；将每个产物投影回单一 AC 主干（N×1）则能消除它。

> **规则**：每个测试或文档产物都必须回溯到某个 AC。另立**平行编号体系**——即脱离 AC 主干的第二套 `T-NNN` 风格系列——属于违规。尺子只有一把：AC 主干，且 `T-NNN` 由旅程/E2E 测试与用户指南共享。

---

## 测试层级决策树

根据 AC 的性质决定应生成哪种测试层级：

```
AC 涉及用户界面操作（点击、浏览、重定向、表单填写）？
├─ Yes → E2E Test
└─ No
   ├─ AC 涉及多个服务/组件交互（API 调用、DB 查询、Queue）？
   │  ├─ Yes → Integration Test
   │  └─ No → Unit Test（已由 /derive-tdd 覆盖）
   └─ AC 涉及外部系统调用（第三方 API、外部 DB）？
      └─ Yes → Integration Test
```

---

## 集成测试推演

当 AC 涉及多个服务/组件交互或外部系统调用时，生成 Integration Test 骨架。

### 接口模板

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

#### 数据库

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

#### 消息队列

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

#### 服务到服务

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

## E2E 测试推演

当 AC 涉及用户界面操作时，生成 E2E 测试骨架。

### Browser E2E Skeleton | 浏览器 E2E 骨架

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

### Gherkin Step Mapping | Gherkin 步骤映射

| Gherkin 关键字 | 映射到 | E2E 阶段 |
|-----------------|---------|-----------|
| `Given` | 设置 + 导航 | 环境准备、页面导航、前置条件状态 |
| `When` | 交互 | 用户操作（点击、输入、提交） |
| `Then` | 断言 | 验证预期结果（页面状态、UI 元素、数据） |
| `And` / `But` | 延续前项 | 额外设置、交互或断言 |

**映射示例**：

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

## AC 层级摘要标记

当 `/derive all` 产生多层级输出时，在输出末尾包含 **AC 层级摘要**（AC Level Summary），以帮助开发人员理解为何每个 AC 被分配到特定测试层级：

```markdown
## AC Level Summary
| AC | Suggested Level | Rationale |
|----|----------------|-----------|
| AC-1 | E2E | Involves UI redirect and page navigation |
| AC-2 | Integration | API endpoint with database interaction |
| AC-3 | Unit | Pure calculation, no external dependencies |
| AC-4 | Integration | Calls external payment gateway API |
```

此摘要仅供参考——开发人员可根据自身判断覆盖建议的层级。

---

## 命令

### 命令参考

| 命令 | 输入 | 输出 | 目的 |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 场景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 测试骨架 |
| `/derive-it` | SPEC-XXX.md 或 .feature | .it.test.* | AC → 集成测试骨架 |
| `/derive-e2e` | SPEC-XXX.md 或 .feature | .e2e.test.* | AC → E2E 测试骨架 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 验收测试表格 |
| `/derive-contracts` | SPEC-XXX.md | contract.json, schema.json | AC → 契约与 Schema 定义 |
| `/derive-all` | SPEC-XXX.md | 以上全部 | 完整推演管道（BDD + TDD + IT + E2E + ATDD + Contracts） |

### 命令参数

| 参数 | 类型 | 默认值 | 描述 |
|-----------|------|---------|-------------|
| `--lang` | string | typescript | 目标语言：ts, js, python, java, go |
| `--framework` | string | vitest | 框架：vitest, jest, pytest, junit, go-test |
| `--output-dir` | string | ./generated | 输出目录 |
| `--dry-run` | boolean | false | 预览而不创建文件 |

### 使用示例

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

### 自动 TDD 转换

当正向推演由自动化 Pipeline 触发时（参见 [Pipeline 整合标准](pipeline-integration-standards.md)），以下规则适用于转换至 TDD 循环：

#### Auto-TDD 进入规则

| 规则 | 说明 |
|------|-------------|
| **推演完整性** | 所有推演输出（BDD、TDD、ATDD）必须在进入 TDD 前完成生成 |
| **RED 状态初始化** | Pipeline 在生成测试骨架后将 TDD 状态设为 RED |
| **测试骨架验证** | 生成的测试文件必须能编译/解析无误后才能进入 RED |
| **AC 计数验证** | 进入转换前验证输出测试数量与 AC 数量匹配 |

#### Pipeline Hooks

推演步骤可通过 Pipeline 事件自动触发：

| Hook | 触发条件 | 动作 |
|------|---------|--------|
| `on-spec-approved` | Spec 状态变更为“已批准” | 启动推演 Pipeline |
| `on-derivation-complete` | 所有推演输出已生成 | 转换至 TDD RED 阶段 |
| `on-tdd-green` | 所有推演测试通过 | 触发审查阶段 |

#### Auto-TDD 进入工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Spec Approved│───▶│  Derive All  │───▶│ Verify Count │───▶│  TDD RED     │
│ (hook)       │    │  BDD+TDD+ATDD│    │ AC = Tests   │    │  (auto-set)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Spec 批准**：Pipeline 检测到 Spec 批准（通过 hook 或轮询）
2. **完整推演**：Pipeline 以项目配置的语言/框架执行 `/derive-all`
3. **计数验证**：Pipeline 验证输出数量与 AC 数量匹配（反幻觉）
4. **RED 状态**：Pipeline 将 TDD 状态设为 RED；测试骨架存在但断言为 [TODO]

#### 与 Pipeline 阶段的整合

正向推演对应 [Pipeline 整合标准](pipeline-integration-standards.md) 6 阶段模型中的 **DERIVE** 阶段：

| Pipeline 阶段 | 正向推演角色 |
|---------------|------------------------|
| SPEC | 输入：已批准的规格 |
| **DERIVE** | 执行：解析 AC → 生成 BDD/TDD/ATDD 输出 |
| BUILD | 输出：测试骨架进入 TDD RED→GREEN 循环 |

---

## 失败处理与恢复

正向推演定义了多个关卡（AC 解析、计数验证、骨架验证、人工审查）。本节定义当关卡**失败**时会发生什么——即“失败 → 回滚 → 重试/上报 → 重新验证”路径——以确保失败的推演绝不会静默发出部分或幻觉产物。

### 失败 → 恢复矩阵

| 失败情况 | 检测阶段 | 恢复操作 | 重新验证 |
|---------|-------------|-----------------|-----------|
| **解析错误** — AC 不符合支持的格式（GWT / 条列式） | DERIVE（解析 AC） | 中止该 AC 的生成；报告 `file:line` 及预期格式；不为其输出骨架。待 SPEC 修复后重新排队。 | 在修正后的 AC 上解析成功 |
| **AC 计数不匹配** — 生成的测试数量 ≠ AC 数量 | 计数验证 | **[违反反幻觉原则]** 回滚整批产物，并在严格 1:1 映射下重新生成。绝不要通过添加或删除测试来“凑齐数量”——这会掩盖幻觉。 | 计数检查通过（测试数 = AC 数） |
| **骨架无法解析/编译** | 骨架验证 | 回滚有问题的单个文件；使用正确的语言模板重新生成。若第二次仍失败，将该 AC 标记为 `[BLOCKED]` 并上报给人工处理。 | 文件解析/编译通过 |
| **人工审查拒绝** — 审查人员指出逻辑错误或未填写的 `[TODO]` | 人工审查关卡 | 记录拒绝原因；仅重新生成被拒绝的项目，并将该反馈作为附加约束。绝不自动批准。 | 审查人员接受 |
| **缺少来源标注** — 输出缺少 `@SPEC-XXX` / `@AC-N` | 任何阶段 | 阻止向 TDD RED 转换；补上来源标注后重新输出。 | 每个输出都带有来源标注 |

### 恢复规则

| 规则 | 说明 | 严重级别 |
|------|-------------|----------|
| **FD-FAIL-001** | 关卡失败必须中止流程推进——绝不要在存在未解决失败的情况下进入 TDD RED。 | 必要 |
| **FD-FAIL-002** | 计数不匹配属于硬回滚，而非对账调和；严禁通过添加或删除测试来凑数（这会掩盖幻觉）。 | 必要 |
| **FD-FAIL-003** | 自动化重试是有上限的（针对瞬态错误或模板错误最多 2 次）；重试耗尽时将 AC 标记为 `[BLOCKED]` 并上报给人工。 | 必要 |
| **FD-FAIL-004** | 每条恢复路径都以重新验证其失败的关卡告终——在最初的检查通过之前，恢复均未完成。 | 必要 |

---

## 应避免的反模式

### 生成反模式

| 反模式 | 影响 | 正确做法 |
|--------|------|----------|
| **添加额外场景** | 测试膨胀、误导覆盖率 | 严格 1:1 AC 对应 |
| **发明测试用例** | 虚假信心 | 只从明确的 AC 推演 |
| **跳过来源标注** | 失去可追溯性 | 永远包含 @SPEC-XXX、@AC-N |
| **过度指定步骤** | 脆弱的测试 | 保持步骤在业务层级 |
| **缺少 TODO 标记** | 实现不完整 | 标记所有生成代码为 [TODO] |

### 流程反模式

| 反模式 | 影响 | 正确做法 |
|--------|------|----------|
| **从草稿 SPEC 推演** | 无效输出 | 只使用已批准的规格 |
| **跳过人类审查** | 质量问题 | 永远审查生成的输出 |
| **将骨架视为完整** | 缺少断言 | 填写 [TODO] 区块 |
| **忽略语言惯例** | 不一致的代码 | 使用适当的语言模板 |

---

## 最佳实践

### 应该做的

- ✅ 只从已批准的规格推演
- ✅ 维持严格的 1:1 AC 到输出对应
- ✅ 在所有输出中包含来源标注
- ✅ 使用 [TODO] 标记需要实现的区块
- ✅ 使用前审查生成的输出
- ✅ 保持生成的步骤在业务/领域层级
- ✅ 使用适当的语言/框架模板

### 不应该做的

- ❌ 添加 AC 未定义的场景
- ❌ 从草稿或未批准的规格推演
- ❌ 跳过对生成输出的人类审查
- ❌ 将生成的骨架视为完整测试
- ❌ 移除来源标注注释
- ❌ 在生成的代码中过度指定实现细节

---

## 工具整合

### Skill 参考

- [Forward Derivation Skill](../skills/spec-derivation/SKILL.md) - 详细的工作流实现
- [Spec-Driven Development Skill](../skills/spec-driven-dev/SKILL.md) - SDD 工作流程
- [BDD Assistant Skill](../skills/bdd-assistant/SKILL.md) - Gherkin 精炼
- [TDD Assistant Skill](../skills/tdd-assistant/SKILL.md) - 测试实现

---

## 相关标准

- [反向工程标准](reverse-engineering-standards.md) - 对称对应（代码 → 规格）
- [规格驱动开发](spec-driven-development.md) - 输入规格格式
- [行为驱动开发](behavior-driven-development.md) - BDD 输出格式
- [测试驱动开发](test-driven-development.md) - TDD 输出使用
- [验收测试驱动开发](acceptance-test-driven-development.md) - ATDD 输出格式
- [反幻觉准则](anti-hallucination.md) - 生成合规性

---

## 参考文献

### 书籍

- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009) - Double-Loop TDD 模式基础
- Gojko Adzic - "Specification by Example" (2011) - 从规格到测试的推演概念

### 在线资源

#### 契约测试

- [Microsoft: Consumer-Driven Contract Testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/cdc-testing/) - 关于 CDC 测试的工程指南
- [BrowserStack: Contract Testing Guide](https://www.browserstack.com/guide/contract-testing) - 全面的契约测试概述
- [Specmatic: AI-powered API Contract Testing](https://specmatic.io/) - 现代契约优先开发工具

#### 验证理论

- [Wikipedia: Formal Verification](https://en.wikipedia.org/wiki/Formal_verification) - 验证的理论基础
- [Wikipedia: Design by Contract](https://en.wikipedia.org/wiki/Design_by_contract) - Bertrand Meyer 的 DbC 概念（1986）

#### SDD 与正向推演

- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) - SDD 方法论定义
- [Martin Fowler: SDD Tools (Kiro, spec-kit, Tessl)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) - AI 时代 SDD 工具探索
- [GitHub spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md) - GitHub 的 SDD 实现
- [InfoQ: Spec-Driven Development](https://www.infoq.com/articles/spec-driven-development/) - SDD 实践概述

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.3.0 | 2026-06-18 | 新增：故障处理与恢复章节 —— failure→rollback→retry/escalate→re-verify 矩阵 + 恢复规则 FD-FAIL-001..004 (XSPEC-292 T7) |
| 1.2.0 | 2026-03-18 | 新增：Pipeline 整合章节 —— 自动 TDD 转换、pipeline hooks、自动 TDD 进入工作流程 |
| 1.1.0 | 2026-01-25 | 新增：契约输出 (contract.json)、Schema 输出 (schema.json)、用于验证产物生成的 /derive-contracts 命令 |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 许可证

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
