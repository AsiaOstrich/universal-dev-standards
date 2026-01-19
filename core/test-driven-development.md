# Test-Driven Development (TDD) Standards

**Version**: 1.1.0
**Last Updated**: 2026-01-12
**Applicability**: All projects adopting Test-Driven Development

> **Language**: [English](../core/test-driven-development.md) | [繁體中文](../locales/zh-TW/core/test-driven-development.md)

---

## Purpose

This standard defines the principles, workflows, and best practices for Test-Driven Development (TDD), ensuring that tests drive the design and implementation of software features.

**Key Benefits**:
- Design emerges from tests, leading to more testable and modular code
- Immediate feedback on code correctness
- Tests serve as living documentation
- Reduced debugging time and defect rates
- Confidence in refactoring

---

## Table of Contents

1. [TDD Core Cycle](#tdd-core-cycle)
2. [TDD Principles](#tdd-principles)
3. [Applicability Guide](#applicability-guide)
4. [TDD vs BDD vs ATDD](#tdd-vs-bdd-vs-atdd)
5. [Integration with SDD](#integration-with-sdd)
6. [TDD Workflow](#tdd-workflow)
7. [Test Design Guidelines](#test-design-guidelines)
8. [Refactoring Strategies](#refactoring-strategies)
9. [Test Doubles in TDD](#test-doubles-in-tdd)
10. [Anti-Patterns and Remediation](#anti-patterns-and-remediation)
11. [Language/Framework Practices](#languageframework-practices)
12. [Metrics and Assessment](#metrics-and-assessment)
13. [Related Standards](#related-standards)
14. [References](#references)
15. [Version History](#version-history)
16. [License](#license)

---

## TDD Core Cycle

### The Red-Green-Refactor Loop

TDD follows a simple but powerful iterative cycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TDD Core Cycle                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌─────────┐         ┌─────────┐         ┌─────────┐                   │
│      │  🔴 RED  │────────▶│ 🟢 GREEN│────────▶│🔵 REFACTOR│                 │
│      └─────────┘         └─────────┘         └─────────┘                   │
│           ▲                                        │                        │
│           │                                        │                        │
│           └────────────────────────────────────────┘                        │
│                                                                             │
│   🔴 RED Phase (1-5 minutes)                                                │
│   ├─ Write a failing test that describes expected behavior                 │
│   ├─ Test should fail for the RIGHT reason                                 │
│   └─ Verify the test actually fails                                        │
│                                                                             │
│   🟢 GREEN Phase (1-10 minutes)                                             │
│   ├─ Write the MINIMUM code to make the test pass                          │
│   ├─ "Fake it till you make it" is acceptable                              │
│   └─ Don't over-engineer; just make it work                                │
│                                                                             │
│   🔵 REFACTOR Phase (5-15 minutes)                                          │
│   ├─ Improve code quality while keeping tests green                        │
│   ├─ Remove duplication (DRY)                                              │
│   ├─ Improve naming, structure, readability                                │
│   └─ Run tests after each refactoring step                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cycle Timing Guidelines

| Phase | Recommended Time | Warning Signs |
|-------|-----------------|---------------|
| 🔴 RED | 1-5 minutes | If >10 min, test scope is too large |
| 🟢 GREEN | 1-10 minutes | If >15 min, break down the problem |
| 🔵 REFACTOR | 5-15 minutes | If skipped, technical debt accumulates |

### The Mantra

> **Red → Green → Refactor → Repeat**

Each iteration should be small. If you find yourself spending too long in any phase, the test is probably too ambitious.

---

## TDD Principles

### FIRST Principles

High-quality tests follow the FIRST principles:

| Principle | Description | Practical Guidelines |
|-----------|-------------|---------------------|
| **F**ast | Tests should run quickly | Unit tests < 100ms each; total suite < 10s |
| **I**ndependent | Tests don't depend on each other | No shared state; each test sets up its own data |
| **R**epeatable | Same result every time | No randomness; no time dependencies; no external I/O |
| **S**elf-validating | Clear pass/fail result | No manual inspection; explicit assertions |
| **T**imely | Written before production code | This is the essence of TDD |

### Uncle Bob's Three Rules of TDD

Robert C. Martin (Uncle Bob) defines TDD with three strict rules:

1. **Rule 1 (Red Rule)**: You are not allowed to write any production code unless it is to make a failing unit test pass.

2. **Rule 2 (Test Rule)**: You are not allowed to write any more of a unit test than is sufficient to fail; and compilation failures are failures.

3. **Rule 3 (Green Rule)**: You are not allowed to write any more production code than is sufficient to pass the one failing unit test.

### Single Responsibility for Tests

Each test should verify ONE behavior:

```
✅ Good: test_calculate_total_with_discount_applies_percentage()
❌ Bad:  test_calculate_total_and_tax_and_discount_and_shipping()
```

### Tests as Documentation

Well-written tests serve as executable documentation:

```
✅ Good test names:
- should_return_empty_list_when_no_users_found
- should_throw_validation_error_when_email_is_invalid
- should_calculate_discount_when_order_exceeds_threshold

❌ Bad test names:
- test1
- testCalculate
- itWorks
```

---

## Applicability Guide

### TDD Applicability by Scenario

| Scenario | Rating | Notes |
|----------|--------|-------|
| **New feature development** | ⭐⭐⭐⭐⭐ | Best TDD use case; design emerges from tests |
| **Bug fixing** | ⭐⭐⭐⭐⭐ | Write failing test to reproduce bug first |
| **API design** | ⭐⭐⭐⭐⭐ | Tests serve as API usage documentation |
| **Core business logic** | ⭐⭐⭐⭐⭐ | High-value code must have test protection |
| **Algorithm implementation** | ⭐⭐⭐⭐ | Many edge cases; TDD helps think through them |
| **Refactoring existing code** | ⭐⭐⭐⭐ | Add tests first, then refactor safely |
| **UI components** | ⭐⭐⭐ | Partially applicable; combine with BDD |
| **Exploratory prototypes** | ⭐⭐ | TDD may slow down uncertain exploration |
| **One-off scripts** | ⭐ | Low cost-benefit ratio |
| **Third-party integrations** | ⭐⭐ | Hard to mock; use integration tests instead |

### TDD by Project Type

| Project Type | TDD | BDD | ATDD | Recommendation |
|--------------|-----|-----|------|----------------|
| **Startup MVP** | ⚠️ Optional | ✅ Recommended | ❌ | Rapid iteration priority |
| **Enterprise Application** | ✅ Recommended | ✅ Recommended | ✅ Recommended | Quality and maintainability critical |
| **Open Source Project** | ✅ Recommended | ⚠️ Optional | ❌ | Contributors need test documentation |
| **Legacy System Renovation** | ✅ Required | ⚠️ Optional | ❌ | Use Golden Master strategy (see below) |
| **Microservices** | ✅ Recommended | ✅ Recommended | ✅ Recommended | Contract testing important |
| **Data Pipelines** | ⚠️ Optional | ❌ | ❌ | Integration tests as primary |
| **Machine Learning** | 🔶 Varies | ❌ | ❌ | See ML testing boundaries below |

### Machine Learning (ML) Testing Boundaries

**Important**: ML projects require distinguishing between "model performance" and "data engineering":

| Aspect | TDD Applicability | Explanation |
|--------|-------------------|-------------|
| **Model Accuracy** | ❌ Not applicable | Non-deterministic results; hard to predefine expectations |
| **Feature Engineering** | ✅ Required | Avoid Garbage In, Garbage Out |
| **Data Cleaning** | ✅ Required | Data quality directly affects model performance |
| **Data Transformation** | ✅ Required | Ensure transformation logic is correct |
| **Pipeline Integration** | ⚠️ Optional | Integration tests as primary |

### Legacy System Strategy: Golden Master Testing

**Problem**: In legacy systems without tests, "adding tests" itself risks breaking existing logic.

**Golden Master Testing Workflow**:

```
┌─────────────────────────────────────────────────────────────────┐
│           Golden Master Testing Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  RECORD Phase (Don't modify code)                           │
│      ├─ Execute system with many inputs                         │
│      ├─ Record all outputs as "golden baseline"                 │
│      └─ Use automation tools or AI to generate test cases       │
│                                                                 │
│  2️⃣  VERIFY Phase                                                │
│      ├─ Create Snapshot/Approval tests                          │
│      └─ Ensure pre/post refactoring outputs match               │
│                                                                 │
│  3️⃣  REFACTOR Phase                                              │
│      ├─ Safely refactor under Golden Master protection          │
│      ├─ Run Golden Master tests after each modification         │
│      └─ Gradually convert Golden Masters to proper unit tests   │
│                                                                 │
│  4️⃣  EVOLVE Phase                                                │
│      └─ New features use standard TDD                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tool Support**:
- ApprovalTests (multi-language support)
- Jest Snapshot Testing
- Python: pytest-snapshot
- AI-assisted test input generation

### Decision Tree

```
Requirement Source?
├─ Technical (performance, refactoring) → TDD
├─ Business Requirement
│   ├─ Has clear acceptance criteria?
│   │   ├─ Yes → ATDD → BDD → TDD
│   │   └─ No → BDD → TDD
│   └─ Complex business flow?
│       ├─ Yes → BDD (scenario description) → TDD
│       └─ No → TDD
└─ Exploratory/Prototype → Skip TDD temporarily
```

---

## TDD vs BDD vs ATDD

### Comparison Overview

| Aspect | TDD | BDD | ATDD |
|--------|-----|-----|------|
| **Focus** | Code units | Behavior | Acceptance criteria |
| **Language** | Programming code | Natural language (Gherkin) | Business language |
| **Participants** | Developers | Developers + BA + QA | Entire team + stakeholders |
| **Test Level** | Unit/Integration | Feature/Scenario | System/Acceptance |
| **Tools** | xUnit frameworks | Cucumber, Behave, SpecFlow | FitNesse, Concordion |
| **When** | During coding | Before coding | Before development starts |

### Integration Pyramid

```
┌─────────────────────────────────────────────────────────────────┐
│              Complete Test-Driven Development Stack              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Requirements     ATDD - Acceptance Test-Driven Development    │
│   Layer           (Receive business acceptance criteria)        │
│                        ↓                                        │
│   Feature         BDD - Behavior-Driven Development             │
│   Layer           (Scenario → Step Definitions)                 │
│                        ↓                                        │
│   Development     TDD - Test-Driven Development                 │
│   Layer           (Unit Tests → Code)                           │
│                        ↓                                        │
│   Integration     Integration & System Tests                    │
│   Layer                                                         │
│                                                                 │
│   Key: ATDD → BDD → TDD → Integration Tests (top-down flow)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### BDD Gherkin Syntax Overview

```gherkin
Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access my personalized content

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter email "user@example.com"
    And I enter password "correctpassword"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message with my name

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter email "user@example.com"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

### ATDD Acceptance Criteria Format

```markdown
## Feature: Shopping Cart Checkout

### Acceptance Criteria:

**AC-1: Calculate Order Total**
- GIVEN items in cart with prices [$10, $20, $15]
- WHEN user proceeds to checkout
- THEN total should be $45

**AC-2: Apply Discount Code**
- GIVEN cart total is $100
- AND valid discount code "SAVE20" for 20% off
- WHEN user applies discount code
- THEN total should be $80

**AC-3: Validate Minimum Order**
- GIVEN cart total is below $25
- WHEN user attempts checkout
- THEN system should show "Minimum order is $25" error
```

### Choosing the Right Approach

| Use Case | Primary Approach | Supporting Approach |
|----------|-----------------|---------------------|
| Algorithm implementation | TDD | - |
| User authentication flow | BDD | TDD |
| Payment processing | ATDD | BDD + TDD |
| API endpoint | TDD | BDD for integration |
| UI component | BDD | TDD for logic |
| Business rule validation | ATDD | TDD |
| Performance optimization | TDD | - |
| External service integration | TDD | BDD for contract |

---

## Integration with SDD

### SDD + TDD Unified Workflow

Spec-Driven Development (SDD) and Test-Driven Development (TDD) are complementary:

- **SDD**: "Spec First, Code Second" - Define WHAT to build
- **TDD**: "Test First, Code Second" - Define HOW to verify

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SDD + TDD Integrated Workflow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  SDD: PROPOSAL Phase                                                    │
│      ├─ Write Spec: Define feature, acceptance criteria, edge cases         │
│      ├─ Include Acceptance Criteria (convert to ATDD scenarios)             │
│      └─ Get stakeholder approval                                            │
│         (Spec ID: SPEC-001)                                                 │
│                                                                             │
│  2️⃣  TDD: RED Phase                                                         │
│      ├─ Based on Spec's Acceptance Criteria, write tests                    │
│      ├─ Write failing tests describing expected behavior                    │
│      ├─ Tests implement Spec: One Criterion = Multiple Tests                │
│      └─ Reference SPEC-001 in test file comments                            │
│                                                                             │
│  3️⃣  TDD: GREEN + REFACTOR Phase                                            │
│      ├─ Iterative development, implementing one small feature at a time     │
│      ├─ Refactor after tests pass                                           │
│      └─ Keep all Spec acceptance criteria tests passing                     │
│                                                                             │
│  4️⃣  SDD: VERIFICATION Phase                                                │
│      ├─ Confirm implementation matches Spec                                 │
│      ├─ Acceptance test suite passes                                        │
│      └─ All Acceptance Criteria implemented ✓                               │
│                                                                             │
│  5️⃣  Commit PR and Write Commit Message                                     │
│      ├─ Commit: "feat(auth): implement login"                               │
│      ├─ Body: "Implements SPEC-001 with OAuth2"                             │
│      ├─ Refs: SPEC-001                                                      │
│      └─ Include test coverage report                                        │
│                                                                             │
│  6️⃣  SDD: ARCHIVE Phase                                                     │
│      └─ Archive Spec, link to PR/commits                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mapping Spec Acceptance Criteria to TDD Tests

| Spec Acceptance Criteria | TDD Tests |
|--------------------------|-----------|
| "User can login with valid credentials" | `test_login_with_valid_credentials_succeeds()` |
| "Invalid password shows error" | `test_login_with_invalid_password_shows_error()` |
| "Account locked after 3 failed attempts" | `test_account_locks_after_three_failed_attempts()` |
| "Locked account cannot login" | `test_locked_account_cannot_login()` |

### Referencing Spec in Tests

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * @see specs/SPEC-001-user-authentication.md
 */
describe('User Authentication (SPEC-001)', () => {
  // AC-1: User can login with valid credentials
  test('should login successfully with valid credentials', async () => {
    // ...
  });

  // AC-2: Invalid password shows error
  test('should show error message for invalid password', async () => {
    // ...
  });
});
```

---

## TDD Workflow

### Individual Level TDD

```
┌─────────────────────────────────────────────────────────────────┐
│              Individual TDD Session Workflow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Understand the requirement                                  │
│     ├─ Read the spec/user story                                 │
│     └─ Identify acceptance criteria                             │
│                                                                 │
│  2. List test cases (on paper or TODO comments)                 │
│     ├─ Happy path scenarios                                     │
│     ├─ Edge cases                                               │
│     ├─ Error scenarios                                          │
│     └─ Boundary conditions                                      │
│                                                                 │
│  3. Pick the simplest test case                                 │
│     └─ Start with the most basic happy path                     │
│                                                                 │
│  4. RED: Write the test                                         │
│     ├─ Write test with clear Arrange-Act-Assert                 │
│     ├─ Use descriptive test name                                │
│     └─ Run test, verify it fails                                │
│                                                                 │
│  5. GREEN: Make it pass                                         │
│     ├─ Write minimum code to pass                               │
│     ├─ "Fake it" is acceptable                                  │
│     └─ Run test, verify it passes                               │
│                                                                 │
│  6. REFACTOR: Clean up                                          │
│     ├─ Remove duplication                                       │
│     ├─ Improve names                                            │
│     ├─ Extract methods/functions                                │
│     └─ Run all tests after each change                          │
│                                                                 │
│  7. Repeat from step 3 until all tests complete                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Team Level TDD

#### Pair Programming with TDD

**Ping-Pong Pattern**:
1. Developer A writes a failing test
2. Developer B writes code to pass the test
3. Developer B writes the next failing test
4. Developer A writes code to pass the test
5. Either developer can refactor at any time
6. Repeat

**Driver-Navigator Pattern**:
1. Navigator thinks about design and test cases
2. Driver writes the test and code
3. Switch roles every 15-30 minutes

#### Mob Programming with TDD

- One driver (types), multiple navigators (guide)
- Rotate driver every 5-10 minutes
- Collectively decide on test cases and implementation
- Higher quality through diverse perspectives

### CI/CD Integration

```yaml
# Example GitHub Actions workflow for TDD
name: TDD CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Check coverage threshold
        run: npm run test:coverage -- --coverage-threshold=80

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
```

---

## Test Design Guidelines

### AAA Pattern (Arrange-Act-Assert)

```typescript
test('should calculate total with discount', () => {
  // Arrange - Set up test data and dependencies
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.setDiscountCode('SAVE20'); // 20% discount

  // Act - Execute the behavior being tested
  const total = cart.calculateTotal();

  // Assert - Verify the result
  expect(total).toBe(80);
});
```

### Given-When-Then Pattern (BDD Style)

```typescript
test('given a cart with items, when discount applied, then total is reduced', () => {
  // Given
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });

  // When
  cart.applyDiscount('SAVE20');
  const total = cart.calculateTotal();

  // Then
  expect(total).toBe(80);
});
```

### Test Naming Conventions

| Pattern | Example |
|---------|---------|
| `should_[behavior]_when_[condition]` | `should_return_error_when_email_invalid` |
| `[method]_[scenario]_[expected]` | `calculateTotal_withDiscount_returnsReducedPrice` |
| `test_[method]_[scenario]_[expected]` | `test_login_invalidPassword_throwsError` |
| `it_[does something]` | `it_calculates_total_correctly` |

### Test Data Best Practices

```typescript
// ✅ Good: Clear, meaningful test data
const validUser = {
  email: 'john.doe@example.com',
  password: 'SecureP@ss123',
  role: 'admin'
};

// ❌ Bad: Magic strings without context
const user = {
  email: 'a@b.c',
  password: '123',
  role: 'x'
};

// ✅ Good: Use test data builders
const user = UserBuilder.create()
  .withEmail('john.doe@example.com')
  .withRole('admin')
  .build();

// ✅ Good: Use constants for boundary values
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

test('should reject password exceeding max length', () => {
  const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
  expect(() => validatePassword(longPassword)).toThrow();
});
```

### Testing Edge Cases

Ensure tests cover all seven dimensions from [Test Completeness Dimensions](test-completeness-dimensions.md):

1. **Happy Path** - Normal expected behavior
2. **Boundary Conditions** - Min/max values, limits
3. **Error Handling** - Invalid input, exceptions
4. **Authorization** - Role-based access control
5. **State Changes** - Before/after verification
6. **Validation** - Format, business rules
7. **Integration** - Real query verification

---

## Refactoring Strategies

### When to Refactor

Refactor when you see code smells. Use the comprehensive catalog below to identify issues and their solutions.

### Code Smell Catalog

Based on Martin Fowler's "Refactoring" (2nd Edition), code smells are grouped into five categories:

#### 1. Bloaters

Code that has grown too large and becomes difficult to work with.

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Long Method** | Method >20 lines, doing too much | Extract Method, Replace Temp with Query, Introduce Parameter Object |
| **Large Class** | Class with too many responsibilities | Extract Class, Extract Subclass, Extract Interface |
| **Primitive Obsession** | Using primitives instead of small objects for simple tasks | Replace Primitive with Object, Replace Type Code with Class, Introduce Parameter Object |
| **Long Parameter List** | More than 3 parameters | Introduce Parameter Object, Preserve Whole Object, Replace Parameter with Method Call |
| **Data Clumps** | Same group of data appearing together in multiple places | Extract Class, Introduce Parameter Object, Preserve Whole Object |

#### 2. Object-Orientation Abusers

Incomplete or incorrect application of OO principles.

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Switch Statements** | Complex switch/if-else chains based on type | Replace Conditional with Polymorphism, Replace Type Code with Strategy, Replace Type Code with State |
| **Temporary Field** | Fields only set in certain circumstances | Extract Class, Introduce Null Object, Introduce Special Case |
| **Refused Bequest** | Subclass doesn't use inherited methods | Push Down Method, Push Down Field, Replace Inheritance with Delegation |
| **Alternative Classes with Different Interfaces** | Classes doing the same thing with different method signatures | Rename Method, Move Method, Extract Superclass |
| **Parallel Inheritance Hierarchies** | Creating subclass requires creating another in a different hierarchy | Move Method, Move Field |

#### 3. Change Preventers

Code that makes changes harder than necessary.

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Divergent Change** | One class changed for many different reasons | Extract Class, Split Phase |
| **Shotgun Surgery** | One change requires modifying many classes | Move Method, Move Field, Inline Function, Inline Class |
| **Parallel Inheritance Hierarchies** | (See above) | Move Method, Move Field |

#### 4. Dispensables

Unnecessary code that could be removed.

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Comments** | Excessive comments hiding bad code | Extract Method, Rename Method, Introduce Assertion |
| **Duplicate Code** | Same or similar code in multiple places | Extract Method, Pull Up Method, Extract Class, Slide Statements |
| **Dead Code** | Unused code (variables, methods, classes) | Remove Dead Code |
| **Lazy Class** | Class doing too little to justify its existence | Inline Class, Collapse Hierarchy |
| **Speculative Generality** | Unused abstraction "for future use" | Collapse Hierarchy, Inline Function, Inline Class, Remove Dead Code |
| **Data Class** | Class with only fields and getters/setters | Move Method, Encapsulate Field, Encapsulate Collection |

#### 5. Couplers

Code with excessive coupling between classes.

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Feature Envy** | Method uses another class's data more than its own | Move Method, Extract Method |
| **Inappropriate Intimacy** | Classes too tightly coupled, accessing each other's private parts | Move Method, Move Field, Hide Delegate, Replace Delegation with Inheritance |
| **Message Chains** | `a.getB().getC().getD().getValue()` | Hide Delegate, Extract Method, Move Method |
| **Middle Man** | Class just delegates to another | Remove Middle Man, Inline Function, Replace Superclass with Delegate |

### Code Smell Detection Checklist

Quick checklist to identify common smells:

```
Method/Function Level:
□ Method > 20 lines? → Extract Method
□ > 3 parameters? → Introduce Parameter Object
□ Deeply nested (> 3 levels)? → Extract Method, Replace Nested Conditional with Guard Clauses
□ Multiple return statements? → Consider refactoring

Class Level:
□ Class > 200 lines? → Extract Class
□ > 10 methods? → Consider splitting responsibilities
□ God class (does everything)? → Extract Class
□ Data class (only fields)? → Move behavior in

Code Patterns:
□ Switch on type? → Replace with Polymorphism
□ Copy-paste code? → Extract Method/Class
□ Unused code? → Delete it
□ Magic numbers? → Replace with Named Constant
```

### Safe Refactoring Checklist

```
Before refactoring:
□ All tests are passing (green)
□ Sufficient test coverage exists
□ You understand what the code does

During refactoring:
□ Make ONE small change at a time
□ Run tests after EVERY change
□ If tests fail, immediately revert
□ Don't add new functionality while refactoring

After refactoring:
□ All tests still pass
□ Code is cleaner/simpler
□ No new functionality was added
```

### Common Refactoring Techniques

| Technique | When to Use | Example |
|-----------|-------------|---------|
| **Extract Method** | Long method, repeated code | Extract 10 lines into `calculateDiscount()` |
| **Rename** | Unclear names | `calc()` → `calculateOrderTotal()` |
| **Inline** | Over-abstraction | Remove unnecessary wrapper function |
| **Extract Variable** | Complex expressions | `const isEligible = age >= 18 && hasLicense` |
| **Replace Conditional with Polymorphism** | Complex switch/if chains | Use strategy pattern |
| **Introduce Parameter Object** | Many parameters | `(x, y, width, height)` → `Rectangle rect` |

---

## Test Doubles in TDD

### Types of Test Doubles

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Dummy** | Fill parameter lists | Required parameter not used in test |
| **Stub** | Return predefined values | Simulate specific scenarios |
| **Spy** | Record interactions | Verify method was called |
| **Mock** | Verify interactions + return values | Test behavior and collaboration |
| **Fake** | Simplified working implementation | In-memory database |

### Test Double Usage by Test Level

| Level | Recommended Doubles |
|-------|---------------------|
| **Unit Test** | Mocks, Stubs for all external dependencies |
| **Integration Test** | Fakes for DB, Stubs for external APIs |
| **System Test** | Real components, Fakes only for external services |
| **E2E Test** | Real everything |

### Example: Using Mocks and Stubs

```typescript
// Stub example - predefined return value
const paymentGateway = {
  processPayment: jest.fn().mockResolvedValue({ success: true, transactionId: 'TXN123' })
};

// Mock example - verify interaction
const emailService = {
  sendConfirmation: jest.fn()
};

test('should send confirmation email after successful payment', async () => {
  const order = new OrderService(paymentGateway, emailService);

  await order.checkout({ amount: 100, email: 'user@example.com' });

  // Verify the mock was called with correct arguments
  expect(emailService.sendConfirmation).toHaveBeenCalledWith(
    'user@example.com',
    expect.objectContaining({ transactionId: 'TXN123' })
  );
});
```

### Avoiding Over-Mocking

```
❌ Over-mocking (testing implementation details):
- Mocking private methods
- Mocking every single dependency
- Verifying every internal method call

✅ Appropriate mocking:
- Mock external services (APIs, databases)
- Mock slow operations (file I/O, network)
- Mock non-deterministic operations (time, random)
```

---

## Anti-Patterns and Remediation

### Code-Level Anti-Patterns

| Anti-Pattern | Description | Impact | Remediation |
|--------------|-------------|--------|-------------|
| **Testing Implementation Details** | Testing private methods or internal state | Brittle tests, refactoring breaks tests | Test public behavior only |
| **Over-Mocking** | Mocking everything, losing reality | False confidence, bugs in production | Balance mocks with real components |
| **Test Interdependence** | Tests depend on execution order | Random failures, hard to isolate | Each test sets up its own state |
| **Magic Numbers/Strings** | Hardcoded values without meaning | Poor readability, maintenance nightmare | Use named constants, builders |
| **Missing Assertions** | Tests without proper assertions | False positives | Every test needs clear assertions |
| **Flaky Tests** | Sometimes pass, sometimes fail | Eroded trust in test suite | Eliminate time/order dependencies |
| **Large Arrange Section** | Complex setup for each test | Hard to understand, maintain | Extract setup to builders/fixtures |
| **Conditional Logic in Tests** | if/else in test code | Multiple tests in one | Split into separate tests |
| **Test Code Duplication** | Same setup in many tests | Maintenance burden | Extract shared setup |
| **Overly Specific Assertions** | Asserting every single field | Brittle tests | Assert only relevant fields |
| **Ignoring Test Failures** | Skipping or commenting out failing tests | Hidden bugs | Fix or remove failing tests |
| **Testing Third-Party Code** | Testing library/framework behavior | Wasted effort | Trust third-party, test your code |
| **One Giant Test** | Single test covering everything | Hard to diagnose failures | Split into focused tests |
| **No Test Names** | `test1`, `test2` | Impossible to understand | Use descriptive names |
| **Catching All Exceptions** | `catch (Exception e)` in tests | Hidden failures | Catch specific exceptions |

### Process-Level Anti-Patterns

| Anti-Pattern | Description | Impact | Remediation |
|--------------|-------------|--------|-------------|
| **Skipping Red Phase** | Writing code before test | Lose TDD design benefits | Discipline: always write failing test first |
| **Skipping Refactor Phase** | Never cleaning up | Technical debt accumulates | Schedule refactoring time |
| **Test After Development (TAD)** | Writing tests after code complete | Not TDD, miss design feedback | True TDD: test first |
| **Big Bang Test Writing** | Writing all tests at once | Overwhelmed, poor coverage | One test at a time |
| **100% Coverage Obsession** | Chasing coverage metrics | Meaningless tests | Focus on behavior coverage |
| **No Test Review** | Tests not reviewed in PR | Poor test quality | Include tests in code review |
| **Delayed Test Runs** | Running tests infrequently | Late feedback | Run tests constantly |
| **Ignoring Slow Tests** | Letting test suite become slow | Developers skip tests | Optimize or parallelize |
| **TDD Zealotry** | Forcing TDD everywhere | Team frustration | Apply TDD pragmatically |
| **No Test Maintenance** | Letting tests rot | False positives/negatives | Treat tests as production code |

### Diagnosis and Remediation Steps

```
┌─────────────────────────────────────────────────────────────────┐
│           Anti-Pattern Diagnosis Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Symptom: Tests frequently break when refactoring               │
│  ├─ Possible cause: Testing implementation details              │
│  └─ Remediation: Review tests, ensure testing behavior only     │
│                                                                 │
│  Symptom: Tests pass but bugs reach production                  │
│  ├─ Possible cause: Over-mocking, missing edge cases            │
│  └─ Remediation: Add integration tests, review coverage gaps    │
│                                                                 │
│  Symptom: Tests randomly fail                                   │
│  ├─ Possible cause: Test interdependence, timing issues         │
│  └─ Remediation: Isolate tests, mock time-dependent operations  │
│                                                                 │
│  Symptom: Test suite takes too long                             │
│  ├─ Possible cause: Too many integration tests, slow I/O        │
│  └─ Remediation: Increase unit test ratio, parallelize          │
│                                                                 │
│  Symptom: Team avoids writing tests                             │
│  ├─ Possible cause: Tests too complex, poor tooling             │
│  └─ Remediation: Simplify test setup, improve test utilities    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Language/Framework Practices

For detailed language-specific TDD examples, see the TDD Assistant skill:
- [Language Examples](../skills/claude-code/tdd-assistant/language-examples.md)

### Quick Reference by Language

| Language | Test Framework | Mock Library | BDD Tool |
|----------|---------------|--------------|----------|
| **JavaScript/TypeScript** | Jest, Vitest | jest.mock, vitest.mock | Cucumber.js |
| **Python** | pytest, unittest | unittest.mock, pytest-mock | Behave |
| **C#** | xUnit, NUnit, MSTest | Moq, NSubstitute | SpecFlow |
| **Java** | JUnit 5, TestNG | Mockito, EasyMock | Cucumber-JVM |
| **Go** | testing | testify/mock | godog |
| **Ruby** | RSpec, minitest | rspec-mocks | Cucumber |

### Framework Selection Guidelines

| Consideration | Recommendation |
|---------------|----------------|
| **New project** | Use framework with best IDE support |
| **Team experience** | Use what team knows best |
| **Existing codebase** | Match existing test framework |
| **BDD required** | Choose framework with BDD integration |
| **Speed critical** | Consider parallel execution support |

---

## Metrics and Assessment

### TDD Maturity Model

| Level | Name | Characteristics |
|-------|------|-----------------|
| **Level 0** | No TDD | Tests written after code, if at all |
| **Level 1** | Test-First | Tests written before code sometimes |
| **Level 2** | TDD Practitioner | Consistent Red-Green-Refactor cycle |
| **Level 3** | TDD Expert | Effective test doubles, clean tests |
| **Level 4** | TDD Master | TDD drives design, mentors others |

### Key Metrics

| Metric | Target | Warning Threshold |
|--------|--------|-------------------|
| **Code Coverage** | > 80% | < 60% |
| **Test-to-Code Ratio** | 1:1 to 2:1 | < 0.5:1 |
| **Test Execution Time** | < 30 seconds (unit) | > 2 minutes |
| **Flaky Test Rate** | 0% | > 1% |
| **Test Maintenance Cost** | < 15% of dev time | > 30% |
| **Defect Escape Rate** | Decreasing | Increasing |

### Assessment Checklist

```
Team TDD Assessment:

□ Tests written before production code
□ Red-Green-Refactor cycle followed
□ Test names clearly describe behavior
□ Tests are independent and repeatable
□ Test suite runs quickly (< 2 minutes)
□ No flaky tests
□ Adequate coverage (> 80%)
□ Tests reviewed in code reviews
□ Refactoring done regularly
□ CI/CD runs tests automatically
```

---

## Related Standards

- [Testing Standards](testing-standards.md) - Core testing standards (UT/IT/ST/E2E) (or use `/testing-guide` skill)
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 7 dimensions framework
- [Behavior-Driven Development](behavior-driven-development.md) - BDD workflow with Given-When-Then format
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD workflow with specification workshops
- [Spec-Driven Development](spec-driven-development.md) - SDD workflow
- [Code Check-in Standards](checkin-standards.md) - Check-in requirements
- [Code Review Checklist](code-review-checklist.md) - Review guidelines

---

## References

### Books

- Kent Beck - "Test Driven Development: By Example" (2002)
- Robert C. Martin - "Clean Code" Chapter 9: Unit Tests (2008)
- Michael Feathers - "Working Effectively with Legacy Code" (2004)
- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009)

### Standards

- [IEEE 29119 - Software Testing Standards](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0 - Chapter 5: Software Construction](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/)

### Online Resources

- [TDD by Example - Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Three Rules of TDD - Uncle Bob](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)
- [Approval Tests](https://approvaltests.com/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-12 | Added: Comprehensive Code Smell Catalog (22+ smells in 5 categories based on Martin Fowler's Refactoring 2nd Ed.), Code Smell Detection Checklist |
| 1.0.0 | 2026-01-07 | Initial TDD standard definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
