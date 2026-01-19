# TDD Analysis Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/reverse-engineer/tdd-analysis.md)

This guide provides detailed workflows for analyzing test coverage against BDD scenarios and identifying gaps.

---

## Overview

TDD analysis maps BDD scenarios to existing unit tests, calculating coverage and identifying gaps. This ensures acceptance criteria are verified at the unit test level.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TDD Analysis Pipeline                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│  │  Feature  │──▶│   Parse   │──▶│   Scan    │──▶│   Match   │        │
│  │  Files    │   │ Scenarios │   │   Tests   │   │ Algorithm │        │
│  └───────────┘   └───────────┘   └───────────┘   └─────┬─────┘        │
│                                                        │               │
│                                                        ▼               │
│                       ┌───────────────────────────────────┐            │
│                       │      Calculate Confidence         │            │
│                       │   [Confirmed] [Inferred] [None]   │            │
│                       └─────────────────┬─────────────────┘            │
│                                         │                              │
│                                         ▼                              │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                        │
│  │   Action  │◀──│  Coverage │◀──│   Gap     │                        │
│  │   Items   │   │   Report  │   │ Analysis  │                        │
│  └───────────┘   └───────────┘   └───────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Scenario Parsing

### 1.1 Extract Scenarios from Feature Files

Parse Gherkin scenarios into analyzable structures:

```markdown
## Parsed Scenarios

### features/auth.feature

| ID | Scenario Name | Steps | Tags |
|----|---------------|-------|------|
| S1 | 成功登入 | 4 | @confirmed |
| S2 | 登入失敗-密碼錯誤 | 3 | @inferred |
| S3 | 帳號鎖定 | 4 | @edge-case |

### Extracted Keywords

| Scenario | Keywords | Domain |
|----------|----------|--------|
| S1: 成功登入 | login, success, credentials | auth |
| S2: 登入失敗 | login, failure, password, error | auth |
| S3: 帳號鎖定 | account, lock, attempts, security | auth |
```

### 1.2 Build Scenario Index

Create searchable index for matching:

```json
{
  "scenarios": [
    {
      "id": "auth.feature:S1",
      "name": "成功登入",
      "keywords": ["login", "success", "credentials", "user", "password"],
      "domain": "auth",
      "steps": [
        { "type": "Given", "text": "使用者在登入頁面" },
        { "type": "When", "text": "使用者輸入正確的 email 和密碼" },
        { "type": "Then", "text": "使用者應該看到首頁" }
      ],
      "tags": ["@confirmed"],
      "source": "features/auth.feature:12-18"
    }
  ]
}
```

---

## Phase 2: Test File Scanning

### 2.1 Detect Test Framework

Identify testing framework from project:

| Indicator | Framework | Language |
|-----------|-----------|----------|
| `jest.config.js` | Jest | JS/TS |
| `vitest.config.ts` | Vitest | JS/TS |
| `pytest.ini`, `pyproject.toml` | pytest | Python |
| `pom.xml` with JUnit | JUnit | Java |
| `*_test.go` | Go testing | Go |
| `Cargo.toml` with test | Rust testing | Rust |

### 2.2 Scan Test Files

Locate and parse test files:

```markdown
## Test File Discovery

### Detected Framework: Vitest

### Files Found
| Path | Tests | Domain (Inferred) |
|------|-------|-------------------|
| tests/auth.test.ts | 12 | auth |
| tests/cart.test.ts | 8 | cart |
| tests/checkout.test.ts | 15 | checkout |

### Test Structure Analysis

#### tests/auth.test.ts
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', () => {...});
    it('should throw error for invalid password', () => {...});
    it('should lock account after 5 attempts', () => {...});
  });
  describe('logout', () => {
    it('should invalidate session', () => {...});
  });
});
```

### Extracted Test Index
| Test ID | Test Name | Keywords | Path |
|---------|-----------|----------|------|
| T1 | should return token for valid credentials | token, valid, credentials | auth.test.ts:5 |
| T2 | should throw error for invalid password | error, invalid, password | auth.test.ts:12 |
| T3 | should lock account after 5 attempts | lock, account, attempts | auth.test.ts:20 |
```

---

## Phase 3: Matching Algorithm

### 3.1 Matching Strategies

Apply multiple strategies and combine scores:

#### Strategy 1: Name Similarity (Weight: 40%)

Compare scenario name with test name:

```
Scenario: 成功登入 (keywords: 成功, 登入)
Test: should return token for valid credentials

Translation mapping:
- 成功 → success, valid
- 登入 → login, credentials

Similarity calculation:
- "valid" matches "成功" translation → +20%
- "credentials" matches "登入" context → +15%
- Name similarity score: 35%
```

#### Strategy 2: Keyword Overlap (Weight: 30%)

Match extracted keywords:

```
Scenario Keywords: [login, success, credentials, user, password]
Test Keywords: [token, valid, credentials, return]

Overlap: [credentials]
Overlap score: 1/5 = 20%
Weighted: 20% × 0.30 = 6%
```

#### Strategy 3: Step-Assertion Mapping (Weight: 20%)

Match Then steps to test assertions:

```gherkin
Then 使用者應該看到首頁
```

```typescript
expect(response.redirect).toBe('/home');
expect(response.status).toBe(200);
```

Assertion analysis:
- "/home" suggests homepage → matches "首頁"
- Status 200 suggests success → matches scenario intent
- Step-assertion score: 70%
- Weighted: 70% × 0.20 = 14%

#### Strategy 4: File Proximity (Weight: 10%)

Test file in same domain:

```
Scenario domain: auth
Test file: tests/auth.test.ts

Domain match: ✅
Proximity score: 100%
Weighted: 100% × 0.10 = 10%
```

### 3.2 Confidence Calculation

Combine weighted scores:

```markdown
## Matching Result: S1 → T1

| Strategy | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Name Similarity | 35% | 0.40 | 14% |
| Keyword Overlap | 20% | 0.30 | 6% |
| Step-Assertion | 70% | 0.20 | 14% |
| File Proximity | 100% | 0.10 | 10% |
| **Total** | - | - | **44%** |

Confidence Level: [Inferred] (Medium)
```

### 3.3 Confidence Thresholds

| Total Score | Confidence Level | Label |
|-------------|------------------|-------|
| 85-100% | High | `[Confirmed]` |
| 60-84% | Medium-High | `[Inferred]` (High) |
| 40-59% | Medium | `[Inferred]` (Medium) |
| 20-39% | Low | `[Inferred]` (Low) |
| 0-19% | None | `[Unknown]` |

---

## Phase 4: Gap Analysis

### 4.1 Identify Missing Coverage

List scenarios without matching tests:

```markdown
## Coverage Gap Analysis

### ❌ No Test Coverage

| Scenario | Feature | Priority | Gap Reason |
|----------|---------|----------|------------|
| 帳號鎖定 | auth.feature:45 | 🔴 High | No matching test found |
| 購物車上限 | cart.feature:32 | 🟡 Medium | Partial match only |

### Gap Classification

| Type | Count | Examples |
|------|-------|----------|
| No tests at all | 2 | 帳號鎖定, 購物車上限 |
| Missing edge cases | 3 | 空購物車, 無效 email, 逾時 |
| Missing error handling | 4 | 登入錯誤, 付款失敗 |
```

### 4.2 Priority Assignment

Determine test priority based on:

```markdown
## Priority Calculation

| Factor | Weight | High | Medium | Low |
|--------|--------|------|--------|-----|
| Security impact | 30% | Auth, payment | User data | Display |
| User frequency | 25% | Core flow | Common | Rare |
| Business risk | 25% | Revenue | Retention | Minor |
| Complexity | 20% | High logic | Moderate | Simple |

### Priority Results

| Scenario | Security | Frequency | Risk | Complexity | Total | Priority |
|----------|----------|-----------|------|------------|-------|----------|
| 帳號鎖定 | 90% | 20% | 80% | 60% | 62.5% | 🔴 High |
| 購物車上限 | 30% | 60% | 40% | 40% | 42.5% | 🟡 Medium |
```

### 4.3 Test Suggestions

Generate actionable test suggestions:

```markdown
## Suggested Tests

### 🔴 High Priority

#### 1. Account Lockout Test
**Scenario**: 帳號鎖定
**Suggested File**: tests/auth.test.ts
**Suggested Test**:
```typescript
describe('AuthService', () => {
  describe('account lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      // Arrange
      const user = await createTestUser();

      // Act - 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await authService.login(user.email, 'wrong-password');
      }

      // Assert
      const status = await authService.getAccountStatus(user.id);
      expect(status).toBe('locked');
    });

    it('should reset attempt count after successful login', async () => {
      // ...
    });
  });
});
```

**Covers**: S3 (帳號鎖定) from auth.feature:45
**Priority**: 🔴 High (Security critical)
```

---

## Phase 5: Coverage Report Generation

### 5.1 Report Structure

```markdown
# BDD → TDD Coverage Report

> Generated: 2026-01-19 14:30
> Feature Files: 3 analyzed
> Test Files: 5 scanned
> Matching Algorithm: v1.0

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Scenarios | 18 | - |
| Covered [Confirmed] | 10 (56%) | ✅ |
| Covered [Inferred] | 5 (28%) | ⚠️ |
| No Coverage | 3 (17%) | ❌ |
| **Effective Coverage** | **83%** | - |

### Trend (if historical data available)
| Date | Coverage |
|------|----------|
| 2026-01-12 | 75% |
| 2026-01-19 | 83% ↑ |

---

## 📈 Coverage by Feature

| Feature | Scenarios | Covered | Rate |
|---------|-----------|---------|------|
| auth.feature | 8 | 7 | 88% ✅ |
| cart.feature | 6 | 5 | 83% ✅ |
| checkout.feature | 4 | 3 | 75% ⚠️ |

---

## ✅ Covered Scenarios

### [Confirmed] Direct Matches (56%)

| BDD Scenario | Unit Test | Confidence | Source |
|--------------|-----------|------------|--------|
| 成功登入 | test_login_success | 92% | auth.test.ts:25 |
| 登入失敗-密碼錯誤 | test_login_invalid_pwd | 88% | auth.test.ts:45 |
| 新增商品到購物車 | test_add_to_cart | 95% | cart.test.ts:12 |

### [Inferred] Probable Matches (28%)

| BDD Scenario | Unit Test | Confidence | Needs Review |
|--------------|-----------|------------|--------------|
| 更新購物車數量 | test_update_quantity | 65% | ⚠️ Verify |
| 移除購物車商品 | test_remove_item | 58% | ⚠️ Verify |

> ⚠️ [Inferred] items should be reviewed by a developer

---

## ❌ Missing Coverage (17%)

### High Priority 🔴

| Scenario | Source | Suggested Test | Reason |
|----------|--------|----------------|--------|
| 帳號鎖定 | auth.feature:45 | test_account_lockout | Security critical |

### Medium Priority 🟡

| Scenario | Source | Suggested Test | Reason |
|----------|--------|----------------|--------|
| 購物車超過上限 | cart.feature:32 | test_cart_max_limit | Boundary condition |
| 結帳逾時處理 | checkout.feature:78 | test_checkout_timeout | Error handling |

---

## 📋 Recommended Actions

### Immediate (This Sprint)
1. [ ] Add `test_account_lockout` to auth.test.ts
   - Security-critical functionality
   - Estimated effort: 2 hours

### Next Sprint
2. [ ] Verify [Inferred] test mappings with domain experts
3. [ ] Add boundary tests for cart limits
4. [ ] Add timeout handling tests

### Backlog
5. [ ] Improve test naming for better auto-matching
6. [ ] Add integration tests for complex flows

---

## 🔗 Traceability Matrix

| SPEC → BDD → TDD |
|------------------|
| SPEC-AUTH.md:42 → auth.feature:12 (成功登入) → auth.test.ts:25 ✅ |
| SPEC-AUTH.md:48 → auth.feature:24 (登入失敗) → auth.test.ts:45 ✅ |
| SPEC-AUTH.md:52 → auth.feature:45 (帳號鎖定) → ❌ Missing |
```

### 5.2 Machine-Readable Output

```json
{
  "reportMeta": {
    "generated": "2026-01-19T14:30:00Z",
    "version": "1.0",
    "featureFiles": 3,
    "testFiles": 5
  },
  "summary": {
    "totalScenarios": 18,
    "coveredConfirmed": 10,
    "coveredInferred": 5,
    "noCoverage": 3,
    "effectiveCoverage": 0.83
  },
  "mappings": [
    {
      "scenario": {
        "id": "auth.feature:S1",
        "name": "成功登入",
        "source": "features/auth.feature:12"
      },
      "test": {
        "id": "auth.test.ts:T1",
        "name": "test_login_success",
        "source": "tests/auth.test.ts:25"
      },
      "confidence": 0.92,
      "level": "confirmed"
    }
  ],
  "gaps": [
    {
      "scenario": {
        "id": "auth.feature:S3",
        "name": "帳號鎖定",
        "source": "features/auth.feature:45"
      },
      "priority": "high",
      "reason": "security_critical",
      "suggestion": {
        "testName": "test_account_lockout",
        "file": "tests/auth.test.ts"
      }
    }
  ]
}
```

---

## Phase 6: Action Item Generation

### 6.1 Sprint-Ready Tasks

Generate actionable tasks:

```markdown
## Sprint Tasks Generated

### Task 1: Add Account Lockout Test
- **Type**: Unit Test
- **File**: tests/auth.test.ts
- **Covers**: S3 (帳號鎖定)
- **Priority**: 🔴 High
- **Estimate**: 2 hours
- **Acceptance Criteria**:
  - [ ] Test locks account after 5 failed attempts
  - [ ] Test resets count after successful login
  - [ ] Test lockout duration (if applicable)

### Task 2: Verify Cart Update Test
- **Type**: Review
- **Action**: Confirm test_update_quantity covers BDD scenario
- **Priority**: 🟡 Medium
- **Estimate**: 30 minutes
```

### 6.2 Integration with Issue Trackers

```markdown
## GitHub Issues (Draft)

### Issue 1
**Title**: Add unit test for account lockout functionality
**Labels**: test, security, high-priority
**Body**:
BDD Scenario `帳號鎖定` (auth.feature:45) lacks unit test coverage.

**Acceptance Criteria**:
- [ ] Add test_account_lockout to auth.test.ts
- [ ] Cover 5 failed attempts → lock
- [ ] Cover lockout reset on success

**Reference**: SPEC-AUTH.md:52, BDD coverage report 2026-01-19
```

---

## Handling Challenges

### Challenge 1: Different Test Naming Conventions

```markdown
# Problem
Scenario: 使用者可以登入
Test: it('verifies authentication flow')

# Solution
1. Extract semantic keywords from both
2. Use translation mapping for multi-language
3. Reduce confidence but still match
4. Flag for human review
```

### Challenge 2: Table-Driven Tests

```typescript
test.each([
  ['valid', true],
  ['invalid', false],
])('login with %s credentials', (type, expected) => {...});
```

```markdown
# Analysis
Single test covers multiple scenarios:
- 成功登入 → table row 'valid'
- 登入失敗 → table row 'invalid'

Mark both scenarios as [Inferred] with shared test reference
```

### Challenge 3: Integration vs Unit Tests

```markdown
# Classification
| Test Type | Coverage Type | Weight |
|-----------|---------------|--------|
| Unit Test | Direct | 100% |
| Integration | Partial | 50% |
| E2E | Indirect | 25% |

# Report separately but combine for overall coverage
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: BDD Coverage Check

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run BDD Coverage Analysis
        run: |
          uds reverse-tdd features/ --output coverage.json

      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(jq '.summary.effectiveCoverage' coverage.json)
          if (( $(echo "$COVERAGE < 0.80" | bc -l) )); then
            echo "Coverage $COVERAGE below 80% threshold"
            exit 1
          fi

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const coverage = require('./coverage.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## BDD Coverage Report\n\nCoverage: ${(coverage.summary.effectiveCoverage * 100).toFixed(1)}%`
            });
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release |
