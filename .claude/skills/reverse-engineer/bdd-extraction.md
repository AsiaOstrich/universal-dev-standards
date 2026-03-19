# BDD Extraction Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/reverse-engineer/bdd-extraction.md)

This guide provides detailed workflows for extracting BDD (Behavior-Driven Development) scenarios from SDD specifications.

---

## Overview

BDD extraction transforms acceptance criteria from SDD specifications into executable Gherkin scenarios. This enables automated testing while maintaining traceability to requirements.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BDD Extraction Pipeline                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│  │   SPEC    │──▶│    AC     │──▶│  Format   │──▶│ Transform │        │
│  │   File    │   │  Section  │   │ Detection │   │ to Gherkin│        │
│  └───────────┘   └───────────┘   └───────────┘   └─────┬─────┘        │
│                                                        │               │
│                                                        ▼               │
│                       ┌───────────────────────────────────┐            │
│                       │     Apply Certainty Labels        │            │
│                       │  [Confirmed] [Inferred] [Assumed] │            │
│                       └─────────────────┬─────────────────┘            │
│                                         │                              │
│                                         ▼                              │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                        │
│  │  Human    │◀──│  Feature  │◀──│   Tag     │                        │
│  │  Review   │   │   File    │   │ Assignment│                        │
│  └───────────┘   └───────────┘   └───────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: SPEC File Parsing

### 1.1 Locate Acceptance Criteria

Search for AC sections in the SPEC file:

| Section Name | Priority | Common Patterns |
|--------------|----------|-----------------|
| **Acceptance Criteria** | 1st | `## Acceptance Criteria`, `## AC` |
| **Requirements** | 2nd | `## Requirements`, `## Functional Requirements` |
| **Test Cases** | 3rd | `## Test Cases`, `## Validation` |
| **User Stories** | 4th | `## User Stories` (extract AC from stories) |

### 1.2 Extract Context Information

Gather contextual data for feature file header:

```markdown
## Extracted Context

From SPEC-AUTH.md:
- **Feature Name**: User Authentication
- **Summary**: Secure login system with JWT tokens
- **User Stories**:
  - As a user, I want to log in securely
  - As an admin, I want to manage user sessions
- **Related Specs**: SPEC-SESSION, SPEC-TOKEN
```

### 1.3 Parse AC Content

Identify individual acceptance criteria:

```markdown
## Acceptance Criteria (from SPEC)

### Format A: Bullet List
- [ ] User can log in with email/password
- [ ] System shows error for invalid credentials
- [ ] Account locks after 5 failed attempts

### Format B: Given-When-Then
Given a registered user
When they enter valid credentials
Then they should be logged in successfully

### Format C: Mixed
- [ ] User can log in (Given-When-Then below)
  - Given: User on login page
  - When: Enter email and password
  - Then: Redirected to dashboard
```

---

## Phase 2: Format Detection

### 2.1 Detection Algorithm

Apply pattern matching to classify AC format:

```
Detection Rules:

1. Given-When-Then Format:
   - Contains keywords: "Given", "When", "Then"
   - May include "And", "But"
   - Label: [Confirmed] for direct conversion

2. Bullet Point Format:
   - Starts with `- [ ]` or `- `
   - No GWT keywords
   - Label: [Inferred] after transformation

3. Mixed Format:
   - Contains both patterns
   - Process each pattern type separately

4. Table Format:
   - Acceptance criteria in markdown tables
   - Extract "Expected Behavior" column
   - Label: [Inferred]
```

### 2.2 Format Classification Output

```markdown
## Format Analysis Report

File: specs/SPEC-AUTH.md
Lines analyzed: 42-78

| Line Range | Format Detected | Action |
|------------|-----------------|--------|
| 42-48 | Given-When-Then | Direct conversion [Confirmed] |
| 52-58 | Bullet Points | AI transformation [Inferred] |
| 62-68 | Table Format | Extract & transform [Inferred] |
| 72-78 | Mixed | Process separately |
```

---

## Phase 3: Transformation Rules

### 3.1 Bullet Point to Gherkin

Transform bullet points following these rules:

#### Rule 1: Action Verb Extraction

| Bullet Pattern | Extracted Action | When Clause |
|----------------|------------------|-------------|
| "User can..." | "can" → capability | "使用者執行..." |
| "System should..." | "should" → expectation | "系統應該..." |
| "Must..." | "must" → requirement | "必須..." |
| "Cannot..." | "cannot" → restriction | "不能..." |

#### Rule 2: Given Clause Inference

When preconditions are not explicit, infer based on context:

| Scenario Type | Inferred Given | Certainty |
|---------------|----------------|-----------|
| Authentication | "使用者在登入頁面" | `[Assumption]` |
| Cart Operations | "使用者有商品在購物車" | `[Assumption]` |
| Profile Update | "使用者已登入" | `[Assumption]` |
| Admin Actions | "管理員已登入" | `[Assumption]` |
| API Calls | "API 服務正在運行" | `[Assumption]` |

#### Rule 3: Then Clause Generation

| Action Type | Then Pattern | Example |
|-------------|--------------|---------|
| Navigation | "應該看到 {page}" | "應該看到首頁" |
| Data | "應該顯示 {data}" | "應該顯示用戶資料" |
| Error | "應該看到錯誤訊息" | "應該看到 '密碼錯誤'" |
| State Change | "{entity} 狀態為 {state}" | "訂單狀態為已確認" |

### 3.2 Transformation Examples

**Example 1: Simple Capability**

```markdown
# Input (Bullet)
- [ ] User can log in with email and password

# Output (Gherkin)
Scenario: User can log in with email and password
  Given 使用者在登入頁面  # [Assumption] Precondition inferred
  When 使用者輸入 email 和 password
  Then 登入成功  # [Inferred] Success implied
  # [Source: specs/SPEC-AUTH.md:45]
```

**Example 2: Error Condition**

```markdown
# Input (Bullet)
- [ ] System shows error for invalid password

# Output (Gherkin)
Scenario: System shows error for invalid password
  Given 使用者在登入頁面  # [Assumption]
  And 使用者有已註冊的帳號  # [Assumption]
  When 使用者輸入錯誤的密碼
  Then 系統顯示錯誤訊息  # [Inferred]
  # [Source: specs/SPEC-AUTH.md:48]
```

**Example 3: Boundary Condition**

```markdown
# Input (Bullet)
- [ ] Account locks after 5 failed login attempts

# Output (Gherkin)
Scenario: Account locks after 5 failed login attempts
  Given 使用者有已註冊的帳號  # [Assumption]
  And 使用者已失敗登入 4 次  # [Inferred] Boundary setup
  When 使用者第 5 次輸入錯誤密碼
  Then 帳號應該被鎖定  # [Inferred]
  And 使用者應該看到帳號鎖定訊息  # [Assumption] UX expectation
  # [Source: specs/SPEC-AUTH.md:52]
```

---

## Phase 4: Feature File Generation

### 4.1 File Structure

```gherkin
# ============================================================
# Feature: [Name from SPEC Summary]
# Source: [SPEC file path]
# Generated: [YYYY-MM-DD HH:mm]
#
# Certainty Summary:
#   - [Confirmed]: N scenarios (direct from GWT AC)
#   - [Inferred]: M scenarios (transformed from bullets)
#   - [Assumption]: K steps (inferred preconditions)
#
# Review Status: PENDING
# ============================================================

Feature: 使用者認證
  As a user
  I want to log in with my credentials
  So that I can access my account

  Background:
    Given 系統已啟動  # [Confirmed] System requirement
    And 資料庫連線正常  # [Confirmed]

  # ─────────────────────────────────────────
  # Scenarios from GWT Format [Confirmed]
  # ─────────────────────────────────────────

  @confirmed @automated
  Scenario: 成功登入
    Given 使用者在登入頁面
    And 使用者有已註冊的帳號
    When 使用者輸入正確的 email 和密碼
    Then 使用者應該看到首頁
    # [Source: specs/SPEC-AUTH.md:42-46] [Confirmed]

  # ─────────────────────────────────────────
  # Scenarios Transformed from Bullets [Inferred]
  # ─────────────────────────────────────────

  @needs-review @inferred
  Scenario: 登入失敗 - 密碼錯誤
    Given 使用者在登入頁面  # [Assumption]
    When 使用者輸入錯誤的密碼
    Then 使用者應該看到錯誤訊息  # [Inferred]
    # [Source: specs/SPEC-AUTH.md:48] [Inferred]

  @needs-review @inferred @edge-case
  Scenario: 帳號鎖定 - 連續失敗 5 次
    Given 使用者已失敗登入 4 次  # [Inferred]
    When 使用者第 5 次輸入錯誤密碼
    Then 帳號應該被鎖定  # [Inferred]
    # [Source: specs/SPEC-AUTH.md:52] [Inferred]
```

### 4.2 Tag System

| Tag | Meaning | Usage |
|-----|---------|-------|
| `@confirmed` | AC was already GWT format | Safe to automate |
| `@inferred` | AC transformed from bullet | Needs review |
| `@assumption` | Contains assumed steps | Verify with stakeholder |
| `@needs-review` | Requires human validation | Don't automate yet |
| `@edge-case` | Boundary condition | Priority for testing |
| `@security` | Security-related | High priority |
| `@manual` | Cannot be automated | Keep for documentation |

### 4.3 Source Attribution

Every scenario MUST include source reference:

```gherkin
# Single source
# [Source: specs/SPEC-AUTH.md:45]

# Multiple sources
# [Source: specs/SPEC-AUTH.md:45, specs/SPEC-SESSION.md:12]

# Inferred from context
# [Source: specs/SPEC-AUTH.md:45] [Inferred from Summary section]
```

---

## Phase 5: Scenario Outline Generation

### 5.1 Identify Parameterizable Scenarios

Look for patterns that suggest parameterization:

```markdown
# Multiple similar ACs:
- [ ] User can log in with email
- [ ] User can log in with username
- [ ] User can log in with phone number

# Convert to Scenario Outline:
```

```gherkin
@inferred
Scenario Outline: 使用者可以用 <credential_type> 登入
  Given 使用者在登入頁面
  When 使用者輸入 <credential> 和密碼
  Then 登入成功

  Examples:
    | credential_type | credential |
    | email | user@example.com |
    | username | john_doe |
    | phone number | 0912345678 |
  # [Source: specs/SPEC-AUTH.md:45-47] [Inferred - combined similar ACs]
```

### 5.2 Example Table Extraction

When SPEC contains data examples:

```markdown
# From SPEC:
| Input | Expected Result |
|-------|-----------------|
| valid email | success |
| invalid email | error |
| empty email | validation error |
```

```gherkin
@inferred
Scenario Outline: 登入驗證 - <scenario>
  Given 使用者在登入頁面
  When 使用者輸入 <input>
  Then 應該看到 <result>

  Examples:
    | scenario | input | result |
    | valid email | user@example.com | 登入成功 |
    | invalid email | invalid | 錯誤訊息 |
    | empty email | | 驗證錯誤 |
  # [Source: specs/SPEC-AUTH.md:60-64] [Confirmed - from table]
```

---

## Phase 6: Quality Checks

### 6.1 Completeness Check

```markdown
## BDD Extraction Quality Report

### Coverage Analysis
| SPEC Section | ACs Found | Scenarios Generated | Coverage |
|--------------|-----------|---------------------|----------|
| Happy Path | 5 | 5 | 100% ✅ |
| Error Handling | 8 | 7 | 87% ⚠️ |
| Edge Cases | 3 | 2 | 67% ⚠️ |

### Missing Scenarios
| AC | Reason | Action |
|----|--------|--------|
| "System logs all attempts" | Non-functional requirement | Add as Background |
| "Session expires after 1hr" | Time-based behavior | Needs manual test |
```

### 6.2 Certainty Distribution

```markdown
### Certainty Summary
| Level | Count | Percentage |
|-------|-------|------------|
| [Confirmed] | 8 | 40% |
| [Inferred] | 10 | 50% |
| [Assumption] | 2 | 10% |

### Review Priority
1. 🔴 High: 2 scenarios with [Assumption] tags
2. 🟡 Medium: 10 scenarios with [Inferred] tags
3. 🟢 Low: 8 scenarios with [Confirmed] tags
```

---

## Handling Challenges

### Challenge 1: Ambiguous ACs

When acceptance criteria are unclear:

```markdown
# Ambiguous AC:
- [ ] User login should be secure

# Resolution:
Scenario: 使用者登入應該安全
  # [Unknown] What does "secure" mean?
  # Suggested interpretations:
  # - HTTPS connection required?
  # - Password not logged?
  # - Session token encrypted?

  # ACTION: Ask stakeholder to clarify
  Given [NEEDS CLARIFICATION: security requirements]
  When 使用者登入
  Then [NEEDS CLARIFICATION: security verification]
  # [Source: specs/SPEC-AUTH.md:45] [Unknown - needs clarification]
```

### Challenge 2: Implicit Requirements

When requirements are implied but not stated:

```markdown
# Explicit AC:
- [ ] User can reset password

# Implicit requirements discovered:
Scenario: 使用者可以重設密碼
  Given 使用者忘記密碼  # [Assumption] - trigger condition
  And 使用者有有效的 email  # [Assumption] - prerequisite
  When 使用者請求重設密碼
  Then 系統發送重設連結到 email  # [Assumption] - mechanism
  And 連結在 24 小時後失效  # [Assumption] - security
  # [Source: specs/SPEC-AUTH.md:55] [Inferred - multiple assumptions added]
```

### Challenge 3: Technical vs User Scenarios

Separate technical requirements:

```gherkin
# User-facing scenario
@user-story
Scenario: 使用者登入成功
  Given 使用者在登入頁面
  When 使用者輸入正確憑證
  Then 使用者看到首頁

# Technical scenario (same AC, different perspective)
@technical
Scenario: 登入時系統生成 JWT Token
  Given 使用者提交有效憑證
  When 系統驗證成功
  Then 系統生成 JWT Token
  And Token 包含使用者 ID
  And Token 設定 1 小時過期時間
  # [Source: specs/SPEC-AUTH.md:42] [Inferred - technical implementation]
```

---

## Integration Points

### With /reverse-spec

```
/reverse-spec → SPEC-XXX.md → /reverse-bdd → feature.feature
```

### With /bdd

After extraction, use `/bdd` for:
- Syntax validation
- Step definition generation
- Three Amigos review

### With /reverse-tdd

```
feature.feature → /reverse-tdd → coverage report
```

---

## Output Files

### Primary Output

```
features/
├── auth.feature           # From SPEC-AUTH.md
├── cart.feature           # From SPEC-CART.md
└── checkout.feature       # From SPEC-CHECKOUT.md
```

### Metadata Output

```
features/.meta/
├── extraction-report.md   # Summary of all extractions
├── review-checklist.md    # Items needing human review
└── certainty-matrix.md    # Certainty levels by scenario
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release |
