# TDD Workflow Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/tdd-assistant/tdd-workflow.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-07

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Complete TDD Workflow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐                                                          │
│  │ 1. Understand │  Read requirement/spec/user story                        │
│  │   Requirement │  Identify acceptance criteria                            │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │ 2. List Test  │  Brainstorm test cases                                   │
│  │    Cases      │  Happy path, edge cases, errors                          │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │ 3. Pick ONE   │  Start with simplest case                                │
│  │    Test       │  (usually happy path)                                    │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │  🔴 RED       │  Write failing test                                      │
│  │  (1-5 min)    │  Verify it fails for right reason                        │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │  🟢 GREEN     │  Write minimum code to pass                              │
│  │  (1-10 min)   │  "Fake it" is OK                                         │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │  🔵 REFACTOR  │  Clean up code                                           │
│  │  (5-15 min)   │  Keep tests green                                        │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌───────────────┐     ┌─────────────────┐                                  │
│  │ More tests?   │─Yes─▶│ Return to       │                                  │
│  │               │      │ Step 3          │                                  │
│  └───────┬───────┘      └─────────────────┘                                  │
│          │ No                                                               │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │    ✅ DONE    │  All acceptance criteria met                             │
│  └───────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Red Phase Deep Dive

### Goal

Write a test that:
- Describes expected behavior (not implementation)
- Fails for the **right** reason
- Has a clear, descriptive name

### Step-by-Step

1. **Choose what to test**
   - Start with the simplest scenario
   - Focus on ONE behavior

2. **Write test structure**
   ```typescript
   test('should [expected behavior] when [condition]', () => {
     // Arrange - Set up test data

     // Act - Execute the behavior

     // Assert - Verify the result
   });
   ```

3. **Fill in the test**
   - Arrange: Create test data and dependencies
   - Act: Call the method/function being tested
   - Assert: Verify the expected outcome

4. **Run the test**
   - It should FAIL
   - Verify the failure is for the right reason

### Common Mistakes

| Mistake | Example | Fix |
|---------|---------|-----|
| **Too many assertions** | Testing 5 things in one test | One behavior per test |
| **Vague test name** | `test('works')` | `test('should return sum of two numbers')` |
| **No assertion** | Missing `expect()` | Always assert expected outcome |
| **Testing implementation** | Checking private method calls | Test observable behavior |
| **Test already passes** | Test for existing behavior | Write for NEW behavior |

### Red Phase Checklist

```
□ Test name clearly describes the behavior
□ Test follows AAA pattern
□ Test has exactly ONE assertion (or related group)
□ Test FAILS when run
□ Failure message is clear
□ Failure is for the RIGHT reason (not syntax error)
```

---

## Green Phase Deep Dive

### Goal

Write the **minimum** code to make the test pass.

### Step-by-Step

1. **Analyze the failure**
   - What does the test expect?
   - What's the simplest way to provide it?

2. **Write minimum code**
   - Hardcoding is OK for first test
   - Don't anticipate future requirements

3. **Run the test**
   - It should PASS
   - All other tests should still pass

### The "Fake It" Strategy

For the first test, it's perfectly fine to fake the implementation:

```typescript
// Test: should return sum of 2 and 3
test('should return sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);
});

// First implementation (fake it!)
function add(a: number, b: number): number {
  return 5; // Just return the expected value
}
```

Then add more tests to force generalization:

```typescript
// Second test forces real implementation
test('should return sum of 1 and 1', () => {
  expect(add(1, 1)).toBe(2);
});

// Now we must generalize
function add(a: number, b: number): number {
  return a + b;
}
```

### Common Mistakes

| Mistake | Example | Fix |
|---------|---------|-----|
| **Over-engineering** | Adding features not needed yet | Only code for current test |
| **Optimizing early** | Performance tuning | Make it work first |
| **Adding error handling** | Try-catch for untested cases | Only handle tested errors |
| **Copying large code blocks** | From other projects | Write minimal code |

### Green Phase Checklist

```
□ Wrote MINIMUM code to pass
□ Didn't add features not required by test
□ Current test passes
□ All other tests still pass
□ No premature optimization
```

---

## Refactor Phase Deep Dive

### Goal

Improve code quality while keeping all tests green.

### Step-by-Step

1. **Identify code smells**
   - Duplication
   - Long methods
   - Poor names
   - Complex conditionals

2. **Choose ONE improvement**
   - Don't try to fix everything at once

3. **Make the change**
   - Small, incremental changes

4. **Run tests immediately**
   - If tests fail, revert immediately

5. **Repeat if needed**

### Common Refactorings

| Technique | When | Example |
|-----------|------|---------|
| **Extract Method** | Long method, repeated code | Pull 10 lines into `calculateTax()` |
| **Rename** | Unclear names | `x` → `totalAmount` |
| **Inline** | Unnecessary indirection | Remove wrapper function |
| **Extract Variable** | Complex expression | `const isEligible = age >= 18 && hasId` |
| **Replace Magic Number** | Hardcoded values | `7` → `DAYS_IN_WEEK` |

### Refactoring Safety Rules

```
1. Tests are GREEN before starting
2. Make ONE change at a time
3. Run tests after EVERY change
4. If tests FAIL → REVERT immediately
5. Never add new functionality while refactoring
```

### Common Mistakes

| Mistake | Example | Fix |
|---------|---------|-----|
| **Skipping this phase** | Moving to next test immediately | Always look for improvements |
| **Too many changes at once** | Refactoring 5 things | One change at a time |
| **Adding functionality** | "While I'm here..." | Only clean up existing code |
| **Not running tests** | Batch running at end | Run after every change |

### Refactor Phase Checklist

```
□ All tests GREEN before starting
□ Identified specific improvement
□ Made ONE small change
□ Tests still GREEN
□ Code is cleaner/simpler
□ No new functionality added
□ Repeated for other improvements
```

---

## BDD Workflow

### Gherkin Syntax

```gherkin
Feature: [Feature name]
  As a [role]
  I want [goal]
  So that [benefit]

  Background:
    Given [common setup for all scenarios]

  Scenario: [Scenario name]
    Given [initial context]
    And [more context]
    When [action]
    And [more actions]
    Then [expected outcome]
    And [more outcomes]

  Scenario Outline: [Parameterized scenario]
    Given [context with <parameter>]
    When [action]
    Then [outcome with <expected>]

    Examples:
      | parameter | expected |
      | value1    | result1  |
      | value2    | result2  |
```

### BDD Workflow Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                        BDD Workflow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Discovery Session                                           │
│     ├─ Developers, BA, QA, stakeholders together                │
│     ├─ Discuss user stories                                     │
│     └─ Identify acceptance criteria                             │
│                                                                 │
│  2. Formulation                                                 │
│     ├─ Write scenarios in Gherkin                               │
│     ├─ Each AC → one or more scenarios                          │
│     └─ Review with team                                         │
│                                                                 │
│  3. Automation                                                  │
│     ├─ Create step definitions                                  │
│     ├─ Each step → code that executes the step                  │
│     └─ Use TDD for step implementations                         │
│                                                                 │
│  4. Implementation                                              │
│     ├─ Run scenarios (they fail - RED)                          │
│     ├─ Implement feature code (GREEN)                           │
│     └─ Refactor                                                 │
│                                                                 │
│  5. Living Documentation                                        │
│     └─ Scenarios serve as always-up-to-date documentation       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step Definitions Example (JavaScript/Cucumber)

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I have a shopping cart with {int} items', async function (count) {
  this.cart = new ShoppingCart();
  for (let i = 0; i < count; i++) {
    this.cart.addItem({ name: `Item ${i}`, price: 10 });
  }
});

When('I apply discount code {string}', async function (code) {
  this.result = await this.cart.applyDiscount(code);
});

Then('the cart total should be {float}', function (expectedTotal) {
  expect(this.cart.getTotal()).toBeCloseTo(expectedTotal, 2);
});
```

### BDD Best Practices

| Practice | Description |
|----------|-------------|
| **Declarative over Imperative** | Say WHAT, not HOW |
| **Business Language** | Avoid technical jargon |
| **Independent Scenarios** | Each scenario is self-contained |
| **Minimal Steps** | 5-10 steps per scenario |
| **Reusable Steps** | Write generic step definitions |

```gherkin
# ❌ Imperative (too detailed)
Scenario: Login
  Given I navigate to "http://example.com/login"
  And I click on the username field
  And I type "john@example.com"
  And I click on the password field
  And I type "secret123"
  And I click the "Login" button
  Then I see "Welcome John"

# ✅ Declarative (behavior focused)
Scenario: Successful login
  Given I am on the login page
  When I login with valid credentials
  Then I should see my dashboard
```

---

## ATDD Workflow

### Acceptance Criteria Format

```markdown
## User Story

**As a** [role]
**I want** [feature]
**So that** [benefit]

## Acceptance Criteria

### AC-1: [Criterion name]
**Given** [precondition]
**When** [action]
**Then** [expected result]

### AC-2: [Criterion name]
**Given** [precondition]
**When** [action]
**Then** [expected result]

## Out of Scope
- [Things explicitly not included]

## Technical Notes
- [Implementation hints, constraints]
```

### ATDD Workflow Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                        ATDD Workflow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Specification Workshop                                      │
│     ├─ Product Owner presents user story                        │
│     ├─ Team asks clarifying questions                           │
│     ├─ Define acceptance criteria together                      │
│     └─ Write examples for each AC                               │
│                                                                 │
│  2. Distillation                                                │
│     ├─ Convert examples to executable tests                     │
│     ├─ Remove ambiguity                                         │
│     └─ Get sign-off from Product Owner                          │
│                                                                 │
│  3. Development                                                 │
│     ├─ Acceptance tests are RED                                 │
│     ├─ Use BDD for feature-level tests                          │
│     ├─ Use TDD for unit-level tests                             │
│     └─ Acceptance tests turn GREEN                              │
│                                                                 │
│  4. Demo                                                        │
│     ├─ Show passing acceptance tests                            │
│     ├─ Product Owner validates                                  │
│     └─ Accept or refine criteria                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mapping AC to Tests

| Acceptance Criteria | Test Level | Tool |
|---------------------|------------|------|
| User-facing behavior | Acceptance | FitNesse, Cucumber |
| Feature behavior | BDD | Cucumber, SpecFlow |
| Unit logic | TDD | Jest, xUnit |
| API contract | Integration | Supertest, REST Assured |

---

## Team Collaboration Patterns

### Pair Programming with TDD

#### Ping-Pong Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Ping-Pong TDD                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Developer A                    Developer B                    │
│   ───────────                    ───────────                    │
│   1. Writes failing test ─────────────────────▶                 │
│                          ◀───────────────────── 2. Makes it pass│
│                          ◀───────────────────── 3. Writes test  │
│   4. Makes it pass ───────────────────────────▶                 │
│   5. Writes test ─────────────────────────────▶                 │
│                          ◀───────────────────── 6. Makes it pass│
│                                                                 │
│   Either can refactor at any time                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Both engaged constantly
- Knowledge sharing
- Catches mistakes early

#### Driver-Navigator Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Driver-Navigator TDD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Driver (Keyboard)              Navigator (Thinking)           │
│   ─────────────────              ───────────────────            │
│   - Types code                   - Thinks about design          │
│   - Focuses on syntax            - Considers test cases         │
│   - Implements ideas             - Reviews for mistakes         │
│   - Asks questions               - Suggests directions          │
│                                                                 │
│   Switch roles every 15-30 minutes                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Clear roles
- Navigator can think strategically
- Continuous review

### Mob Programming with TDD

```
┌─────────────────────────────────────────────────────────────────┐
│                    Mob Programming TDD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Team (3-6 people)                                             │
│   ─────────────────                                             │
│   - One Driver (types)                                          │
│   - Multiple Navigators (guide)                                 │
│   - Rotate Driver every 5-10 minutes                            │
│                                                                 │
│   TDD Process:                                                  │
│   1. Team discusses next test                                   │
│   2. Driver writes test (navigators guide)                      │
│   3. Team verifies test fails                                   │
│   4. Team discusses implementation                              │
│   5. Driver implements (navigators guide)                       │
│   6. Rotate driver                                              │
│   7. Next person refactors or writes next test                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Whole team alignment
- Collective ownership
- Real-time knowledge transfer

---

## CI/CD Integration

### Pipeline Structure

```yaml
stages:
  - test:unit      # Fast (< 2 min)
  - test:integration  # Medium (< 10 min)
  - test:e2e       # Slow (< 30 min)
  - coverage-check
  - deploy
```

### Quality Gates

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| Unit test pass rate | 100% | Block merge |
| Integration test pass rate | 100% | Block merge |
| Code coverage | 80% | Warn / Block |
| New code coverage | 90% | Warn |
| Test execution time | < baseline | Warn |

### Example CI Configuration

```yaml
# GitHub Actions
name: TDD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:integration

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:e2e
```

### Test Reporting

```yaml
# Add test reporting
- name: Test Report
  uses: dorny/test-reporter@v1
  if: success() || failure()
  with:
    name: Test Results
    path: reports/junit.xml
    reporter: jest-junit
```

---

## Quick Decision Guide

### Which Test to Write?

```
What are you implementing?
│
├─ New feature
│   └─ Start with acceptance criteria → BDD → TDD
│
├─ Bug fix
│   └─ Write failing test that reproduces bug → TDD
│
├─ Refactoring
│   └─ Ensure existing tests cover behavior → Refactor
│
├─ Performance improvement
│   └─ Write performance test → Implement → Verify
│
└─ New API endpoint
    └─ TDD for logic + Integration test for HTTP
```

### Test Granularity

```
How specific should this test be?
│
├─ Testing public API → One test per behavior
├─ Testing internal logic → Group related assertions
└─ Testing edge cases → One test per edge case
```

---

## Related Documents

- [SKILL.md](./SKILL.md) - TDD Assistant overview
- [Language Examples](./language-examples.md) - Language-specific TDD
- [TDD Core Standard](../../core/test-driven-development.md) - Full TDD standard
