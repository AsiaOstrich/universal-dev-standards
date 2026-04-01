# Forward Derivation Standards | 正向推演標準

**Version**: 1.2.0
**Last Updated**: 2026-03-18
**Applicability**: All projects using Spec-Driven Development
**Scope**: uds-specific
**Industry Standards**: JSON Schema 2020-12
**References**: [specmatic.io](https://specmatic.io/)

> **Language**: [English](../core/forward-derivation-standards.md) | [繁體中文](../locales/zh-TW/core/forward-derivation-standards.md)

---

## Purpose

This standard defines the principles and workflows for Forward Derivation—automatically generating BDD scenarios, TDD test skeletons, and ATDD acceptance tests from approved SDD specifications. Forward Derivation complements [Reverse Engineering Standards](reverse-engineering-standards.md), creating a symmetrical derivation system.

**Key Benefits**:
- Consistent test structures aligned with specification
- Traceability from requirements to tests (@SPEC-XXX, @AC-N tags)
- Faster TDD bootstrap from approved specifications
- Reduced manual translation errors

---

## Forward Derivation Workflow

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

### Workflow Stages

| Stage | Description | Output | Certainty Level |
|-------|-------------|--------|-----------------|
| **Parse SPEC** | Read approved specification document | SPEC metadata, sections | [Source] |
| **Extract AC** | Parse Acceptance Criteria (GWT or bullet) | Structured AC list | [Derived] |
| **Generate BDD** | Transform AC to Gherkin scenarios | .feature files | [Generated] |
| **Generate TDD** | Create test skeletons from AC | Test files with TODOs | [Generated] |
| **Generate ATDD** | Create acceptance test tables | Markdown test tables | [Generated] |
| **Generate Contracts** | Extract pre/post conditions | contract.json, schema.json | [Generated] |
| **Human Review** | Verify generated outputs | Approved test structures | [Reviewed] |

---

## Core Principles

### 1. Spec-Bounded Generation

**Rule**: Only derive content that exists in the approved specification. Never add features, scenarios, or tests beyond what the AC explicitly defines.

**正向推演原則**：只推演規格中明確存在的內容。不添加 AC 未明確定義的功能、場景或測試。

**Correct**:
```markdown
# SPEC AC
- [ ] User can login with email and password

# Generated BDD (correct)
Scenario: User login with email and password
```

**Incorrect**:
```markdown
# Generated BDD (wrong - adding beyond spec)
Scenario: User login with email and password
Scenario: User login with social auth  # <-- NOT in AC
Scenario: User password recovery       # <-- NOT in AC
```

### 2. Anti-Hallucination Compliance

**Rule**: This standard strictly follows [Anti-Hallucination Standards](anti-hallucination.md):

- **1:1 Mapping**: Each AC produces exactly ONE scenario/test group
- **No Fabrication**: Never invent acceptance criteria or test cases
- **Source Attribution**: All generated items reference source SPEC and AC number

**Anti-Hallucination Check**:
```
Input: SPEC with N acceptance criteria
Output: Exactly N scenarios (BDD), N test groups (TDD), N acceptance tables (ATDD)

If output count ≠ input count → VIOLATION
```

### 3. Source Attribution

**Rule**: Every generated item MUST include traceability:

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

### 4. Certainty Labels

Use these labels to indicate derivation certainty:

| Tag | Definition | Example |
|-----|------------|---------|
| `[Source]` | Direct content from SPEC | Feature title, AC text |
| `[Derived]` | Transformed from SPEC content | GWT from bullet AC |
| `[Generated]` | AI-generated structure | Test skeleton, TODO comments |
| `[TODO]` | Requires human implementation | Test assertions, step definitions |

### 5. Test Level Configuration Awareness

**Rule**: Before deriving tests, `/derive` SHOULD check the project's `test_levels` configuration to determine which test levels to generate. This ensures derivation respects the team's testing strategy.

**Configuration Sources** (checked in order):
1. `.standards/.uds.manifest.json` → `options.test_levels`
2. `uds-manifest.json` → `stats` or root-level `test_levels`
3. If no configuration found → default to all levels (`unit-testing`, `integration-testing`, `system-testing`, `e2e-testing`)

**Behavior**:

| Configured test_levels | `/derive all` produces |
|----------------------|----------------------|
| `['unit-testing']` | BDD + TDD only |
| `['unit-testing', 'integration-testing']` | BDD + TDD + IT |
| `['unit-testing', 'integration-testing', 'e2e-testing']` | BDD + TDD + IT + E2E |
| `['unit-testing', 'integration-testing', 'system-testing', 'e2e-testing']` (default) | BDD + TDD + IT + E2E (all) |
| No manifest / no test_levels | All levels (same as default) |

**Mapping**:

| test_levels value | Derivation output |
|-------------------|------------------|
| `unit-testing` | `/derive-tdd` (always included) |
| `integration-testing` | `/derive-it` |
| `system-testing` | `/derive-it` (system = broader integration) |
| `e2e-testing` | `/derive-e2e` |

**Note**: BDD (.feature), ATDD (acceptance.md), and Contracts (contract.json) are always generated regardless of test_levels, as they are specification artifacts not test-level specific.

**AI Agent Instruction**: When executing `/derive all`, check for `test_levels` configuration first. If `e2e-testing` is not in the configured levels, skip E2E skeleton generation and inform the user: "Skipping E2E derivation — not in project test_levels configuration. Run `uds config --type test_levels` to add it."

---

## Input Format Requirements

### Supported AC Formats

#### Format 1: Given-When-Then (Preferred)

```markdown
### AC-1: User Login
**Given** a registered user with valid credentials
**When** the user submits login form with email and password
**Then** the user is redirected to dashboard
**And** a session token is created
```

#### Format 2: Bullet Points

```markdown
### AC-1: User Login
- User can login with email and password
- Login redirects to dashboard on success
- Login shows error for invalid credentials
```

#### Format 3: Checklist

```markdown
## Acceptance Criteria
- [ ] User can login with email and password
- [ ] Session is created on successful login
- [ ] Error message shown for invalid credentials
```

---

## Output Formats

### BDD Output (.feature)

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: forward-derivation v1.0.0
# Generated at: 2026-01-19T10:00:00Z

@SPEC-001
Feature: User Authentication
  As a user
  I want to login to the system
  So that I can access my dashboard

  @AC-1 @happy-path
  Scenario: User login with valid credentials
    # [Source] From SPEC-001 AC-1
    Given a registered user with valid credentials
    When the user submits login form with email and password
    Then the user is redirected to dashboard
    And a session token is created

  @AC-2 @error-handling
  Scenario: Login fails with invalid credentials
    # [Source] From SPEC-001 AC-2
    Given a user with invalid credentials
    When the user submits login form
    Then an error message is displayed
    And no session is created
```

### TDD Output (.test.ts)

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

### ATDD Output (acceptance.md)

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

### Contract Output (contract.json)

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

### Schema Output (schema.json)

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

## Bullet-to-GWT Transformation

When AC is written as bullet points, transform using this pattern:

### Transformation Rules

| Bullet Pattern | Maps To | Example |
|----------------|---------|---------|
| Condition/state | Given | "User is logged in" → Given user is logged in |
| User action | When | "User clicks button" → When user clicks button |
| System response | Then | "Message is displayed" → Then message is displayed |
| "can/should/must" | When + Then | "User can delete item" → When user deletes item Then item is removed |

### Example Transformation

**Input (Bullet)**:
```markdown
- [ ] User can add item to cart
- [ ] Cart displays item count
- [ ] Cart total updates automatically
```

**Output (GWT)**:
```gherkin
Scenario: Add item to cart
  Given user is on product page
  When user clicks "Add to Cart" button
  Then item is added to cart
  And cart displays updated item count
  And cart total updates automatically
```

---

## Integration with Development Methodologies

### Forward Derivation Pipeline

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

### With Integrated Flow Methodology

Forward Derivation fits between `spec-review` and `discovery` phases:

```yaml
spec-review → forward-derivation → discovery
```

1. **Spec Review (SDD)**: Specification approved
2. **Forward Derivation**: Auto-generate BDD scenarios, TDD skeletons
3. **Discovery (BDD)**: Review and refine generated scenarios with stakeholders
4. **TDD Red**: Start implementing tests using generated skeletons

---

## Test Level Decision Tree

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

## Integration Test Derivation

當 AC 涉及多個服務/元件互動或外部系統呼叫時，生成 Integration Test 骨架。

### Interface Templates | 介面範本

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

## E2E Test Derivation

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

| Gherkin Keyword | Maps To | E2E Phase |
|-----------------|---------|-----------|
| `Given` | Setup + Navigation | Environment preparation, page navigation, prerequisite state |
| `When` | Interaction | User actions (click, type, submit) |
| `Then` | Assertion | Verify expected outcomes (page state, UI elements, data) |
| `And` / `But` | Extends previous | Additional setup, interaction, or assertion |

**Mapping Example**:

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

## AC Level Summary Marking

When `/derive all` produces multi-level output, include an **AC Level Summary** at the end of the output to help developers understand why each AC was assigned to a specific test level:

```markdown
## AC Level Summary
| AC | Suggested Level | Rationale |
|----|----------------|-----------|
| AC-1 | E2E | Involves UI redirect and page navigation |
| AC-2 | Integration | API endpoint with database interaction |
| AC-3 | Unit | Pure calculation, no external dependencies |
| AC-4 | Integration | Calls external payment gateway API |
```

This summary is informational — developers may override the suggested level based on their judgment.

---

## Commands

### Command Reference

| Command | Input | Output | Purpose |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin scenarios |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → Test skeletons |
| `/derive-it` | SPEC-XXX.md or .feature | .it.test.* | AC → Integration test skeletons |
| `/derive-e2e` | SPEC-XXX.md or .feature | .e2e.test.* | AC → E2E test skeletons |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → Acceptance test tables |
| `/derive-contracts` | SPEC-XXX.md | contract.json, schema.json | AC → Contract and schema definitions |
| `/derive-all` | SPEC-XXX.md | All above | Full derivation pipeline (BDD + TDD + IT + E2E + ATDD + Contracts) |

### Command Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--lang` | string | typescript | Target: ts, js, python, java, go |
| `--framework` | string | vitest | Framework: vitest, jest, pytest, junit, go-test |
| `--output-dir` | string | ./generated | Output directory |
| `--dry-run` | boolean | false | Preview without file creation |

### Usage Examples

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

## Pipeline Integration

### Automated TDD Transition

When forward derivation is triggered by an automated pipeline (see [Pipeline Integration Standards](pipeline-integration-standards.md)), the following rules apply for transitioning into the TDD cycle:

#### Auto-TDD Entry Rules

| Rule | Description |
|------|-------------|
| **Derivation completeness** | All derivation outputs (BDD, TDD, ATDD) must be generated before entering TDD |
| **RED state initialization** | Pipeline sets TDD state to RED after generating test skeletons |
| **Test skeleton validation** | Generated test files must compile/parse without errors before entering RED |
| **AC count verification** | Verify output test count matches AC count before transitioning |

#### Pipeline Hooks

Derivation steps can be automatically triggered by pipeline events:

| Hook | Trigger | Action |
|------|---------|--------|
| `on-spec-approved` | Spec status changes to "approved" | Start derivation pipeline |
| `on-derivation-complete` | All derivation outputs generated | Transition to TDD RED phase |
| `on-tdd-green` | All derived tests pass | Trigger review stage |

#### Auto-TDD Entry Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Spec Approved│───▶│  Derive All  │───▶│ Verify Count │───▶│  TDD RED     │
│ (hook)       │    │  BDD+TDD+ATDD│    │ AC = Tests   │    │  (auto-set)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Spec Approval**: Pipeline detects spec approval (via hook or polling)
2. **Full Derivation**: Pipeline runs `/derive-all` with project-configured language/framework
3. **Count Verification**: Pipeline verifies output count matches AC count (anti-hallucination)
4. **RED State**: Pipeline sets TDD state to RED; test skeletons exist but assertions are [TODO]

#### Integration with Pipeline Stages

Forward derivation maps to the **DERIVE** stage in the [Pipeline Integration Standards](pipeline-integration-standards.md) 6-stage model:

| Pipeline Stage | Forward Derivation Role |
|---------------|------------------------|
| SPEC | Input: approved specification |
| **DERIVE** | Execute: parse AC → generate BDD/TDD/ATDD outputs |
| BUILD | Output: test skeletons feed into TDD RED→GREEN cycle |

---

## Anti-Patterns to Avoid

### Generation Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Adding Extra Scenarios** | Test bloat, misleading coverage | Strict 1:1 AC mapping |
| **Inventing Test Cases** | False confidence | Only derive from explicit AC |
| **Skipping Source Attribution** | Lost traceability | Always include @SPEC-XXX, @AC-N |
| **Over-Specifying Steps** | Brittle tests | Keep steps at business level |
| **Missing TODO Markers** | Incomplete implementation | Mark all generated code with [TODO] |

### Process Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Deriving from Draft SPEC** | Invalid outputs | Only use approved specifications |
| **Skipping Human Review** | Quality issues | Always review generated outputs |
| **Treating Skeletons as Complete** | Missing assertions | Fill in [TODO] sections |
| **Ignoring Language Conventions** | Inconsistent code | Use appropriate language templates |

---

## Best Practices

### Do's

- ✅ Only derive from approved specifications
- ✅ Maintain strict 1:1 AC to output mapping
- ✅ Include source attribution in all outputs
- ✅ Use [TODO] markers for sections requiring implementation
- ✅ Review generated outputs before use
- ✅ Keep generated steps at business/domain level
- ✅ Use appropriate language/framework templates

### Don'ts

- ❌ Add scenarios beyond what AC defines
- ❌ Derive from draft or unapproved specs
- ❌ Skip human review of generated outputs
- ❌ Treat generated skeletons as complete tests
- ❌ Remove source attribution comments
- ❌ Over-specify implementation details in generated code

---

## Tool Integration

### Skill References

- [Forward Derivation Skill](../skills/forward-derivation/SKILL.md) - Detailed workflow implementation
- [Spec-Driven Development Skill](../skills/spec-driven-dev/SKILL.md) - SDD workflow
- [BDD Assistant Skill](../skills/bdd-assistant/SKILL.md) - Gherkin refinement
- [TDD Assistant Skill](../skills/tdd-assistant/SKILL.md) - Test implementation

---

## Related Standards

- [Reverse Engineering Standards](reverse-engineering-standards.md) - Symmetrical counterpart (Code → Spec)
- [Spec-Driven Development](spec-driven-development.md) - Input specification format
- [Behavior-Driven Development](behavior-driven-development.md) - BDD output format
- [Test-Driven Development](test-driven-development.md) - TDD output usage
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD output format
- [Anti-Hallucination Guidelines](anti-hallucination.md) - Generation compliance

---

## References

### Books

- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009) - Double-Loop TDD pattern foundation
- Gojko Adzic - "Specification by Example" (2011) - Specification to test derivation concepts

### Online Resources

#### Contract Testing

- [Microsoft: Consumer-Driven Contract Testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/cdc-testing/) - Engineering playbook on CDC testing
- [BrowserStack: Contract Testing Guide](https://www.browserstack.com/guide/contract-testing) - Comprehensive contract testing overview
- [Specmatic: AI-powered API Contract Testing](https://specmatic.io/) - Modern contract-first development tool

#### Verification Theory

- [Wikipedia: Formal Verification](https://en.wikipedia.org/wiki/Formal_verification) - Theoretical foundations of verification
- [Wikipedia: Design by Contract](https://en.wikipedia.org/wiki/Design_by_contract) - Bertrand Meyer's DbC concept (1986)

#### SDD & Forward Derivation

- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) - SDD methodology definition
- [Martin Fowler: SDD Tools (Kiro, spec-kit, Tessl)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) - AI-era SDD tooling exploration
- [GitHub spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md) - GitHub's SDD implementation
- [InfoQ: Spec-Driven Development](https://www.infoq.com/articles/spec-driven-development/) - SDD practices overview

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-18 | Added: Pipeline Integration section — auto-TDD transition, pipeline hooks, auto-TDD entry workflow |
| 1.1.0 | 2026-01-25 | Added: Contract output (contract.json), Schema output (schema.json), /derive-contracts command for verification artifact generation |
| 1.0.0 | 2026-01-19 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
