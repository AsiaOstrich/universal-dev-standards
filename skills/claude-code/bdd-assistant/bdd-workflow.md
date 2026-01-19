# BDD Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

---

## Discovery-Formulation-Automation Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BDD Discovery-Formulation-Automation                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌───────────┐       ┌─────────────┐       ┌────────────┐              │
│      │ 🔍 DISCOVERY│─────▶│📝 FORMULATION│─────▶│⚙️ AUTOMATION│             │
│      └───────────┘       └─────────────┘       └────────────┘              │
│           ▲                                          │                      │
│           │                                          │                      │
│           └──────────────────────────────────────────┘                      │
│                     (New behaviors discovered)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Discovery

### Purpose

Collaboratively explore requirements and identify concrete examples.

### Duration

30-60 minutes

### Participants

- Product Owner / Business Analyst
- Developer(s)
- QA / Tester

### Activities

1. **Story Introduction** (5 min)
   - PO presents the user story
   - Explains business value and context

2. **Clarifying Questions** (10 min)
   - Team asks questions
   - Identify assumptions

3. **Example Mapping** (20 min)
   ```
   🟡 [User Story]
        │
        ├─ 🔵 Rule 1
        │      ├─ 🟢 Example 1.1
        │      └─ 🟢 Example 1.2
        │
        ├─ 🔵 Rule 2
        │      └─ 🟢 Example 2.1
        │
        └─ 🔴 Question: Need clarification
   ```

4. **Edge Case Identification** (10 min)
   - What could go wrong?
   - Boundary conditions
   - Error scenarios

5. **Wrap-up** (5 min)
   - Summarize examples
   - Note open questions
   - Schedule next steps

### Outputs

- List of concrete examples
- Business rules identified
- Questions to follow up
- Rough estimate feasibility

### Checklist

```
□ Stakeholders present (Business, Dev, QA)
□ User story discussed and understood
□ Concrete examples collected
□ Edge cases identified
□ All clarifying questions answered or noted
□ Agreement on scope
```

---

## Phase 2: Formulation

### Purpose

Convert examples from Discovery into executable Gherkin scenarios.

### Duration

15-30 minutes

### Participants

- Developer(s)
- QA / Tester
- (Optional) Product Owner for review

### Activities

1. **Example Review** (5 min)
   - Review examples from Discovery
   - Confirm understanding

2. **Scenario Writing** (15 min)
   - Convert each example to Gherkin
   - Use declarative style
   - Apply ubiquitous language

3. **Review & Refine** (10 min)
   - Team reviews scenarios
   - Check for declarative style
   - Ensure business readability

### Gherkin Style Guide

**DO:**
```gherkin
# Declarative - describes WHAT, not HOW
Scenario: Successful login with valid credentials
  Given I am a registered user
  When I login with valid credentials
  Then I should see my dashboard
```

**DON'T:**
```gherkin
# Imperative - describes HOW
Scenario: Login
  Given I navigate to "/login"
  And I click on "#email" field
  And I type "user@example.com"
  And I click on "#password" field
  And I type "password123"
  And I click the "#submit" button
  Then I should see text "Dashboard"
```

### Scenario Structure

```gherkin
Feature: [Feature name]
  As a [role]
  I want [feature]
  So that [benefit]

  Background:
    Given [common preconditions]

  Scenario: [Descriptive name]
    Given [initial context]
    And [additional context]
    When [action]
    Then [expected outcome]
    And [additional outcome]
```

### Outputs

- Feature file(s) with Gherkin scenarios
- Tag organization (@critical, @smoke, etc.)
- Ready for automation

### Checklist

```
□ Scenarios use correct Gherkin syntax
□ Scenarios are declarative (WHAT, not HOW)
□ Business language used (no technical jargon)
□ Each scenario is independent
□ Scenarios have 5-10 steps max
□ Scenarios reviewed by team
□ Feature file committed to repository
```

---

## Phase 3: Automation

### Purpose

Implement step definitions and feature code to make scenarios pass.

### Duration

Variable (depends on feature complexity)

### Participants

- Developer(s)
- QA / Tester (for complex step definitions)

### Activities

1. **Run Scenarios** (Initial RED)
   - All scenarios should fail
   - Confirms scenarios are executable
   - Identifies missing step definitions

2. **Write Step Definitions**
   - Implement each step
   - Make them reusable
   - Use parameterization

3. **Implement Feature Code** (using TDD)
   ```
   For each failing scenario:
   │
   ├─▶ Identify needed components
   │
   └─▶ TDD Cycle for each component:
        🔴 Write failing unit test
        🟢 Implement minimal code
        🔵 Refactor
        │
        └─▶ Run BDD scenario (still failing?)
             ├─ Yes → Continue TDD
             └─ No → Move to next scenario
   ```

4. **Refactor**
   - Clean up code
   - Remove duplication
   - Improve naming

### Step Definition Example

```typescript
// TypeScript/Cucumber.js example
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I am a registered user', async function () {
  this.user = await createTestUser();
});

When('I login with valid credentials', async function () {
  await this.loginPage.login(this.user.email, this.user.password);
});

Then('I should see my dashboard', async function () {
  expect(await this.dashboardPage.isVisible()).to.be.true;
});
```

### BDD + TDD Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    BDD + TDD Integration                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BDD Layer (Feature Level)                                     │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  Scenario: Checkout with discount                    │      │
│   │    Given items in cart totaling $100                 │      │
│   │    When I apply discount code "SAVE20"               │      │
│   │    Then my total should be $80                       │      │
│   └─────────────────────────────────────────────────────┘       │
│                          │                                      │
│                          ▼                                      │
│   TDD Layer (Unit Level)                                        │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  test_cart_calculates_total()                        │      │
│   │  test_discount_code_validates()                      │      │
│   │  test_discount_applies_percentage()                  │      │
│   │  test_invalid_code_rejected()                        │      │
│   └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Outputs

- Working step definitions
- Passing scenarios
- Unit tests for implementation
- Refactored, clean code

### Checklist

```
□ Step definitions created for all steps
□ Step definitions are reusable
□ Scenarios initially failed (RED)
□ TDD used for unit implementations
□ All scenarios now pass (GREEN)
□ Code refactored and clean
□ Living documentation generated
```

---

## Complete Workflow Example

### User Story

> As a customer, I want to apply a discount code to my cart, so that I can save money on my purchase.

### Discovery Session

**Example Mapping Result:**
```
🟡 User Story: Apply discount code

🔵 Rule 1: Valid codes apply discount
   🟢 Example: Code "SAVE10" gives 10% off
   🟢 Example: Code "FLAT5" gives $5 off

🔵 Rule 2: Invalid codes show error
   🟢 Example: Expired code shows "Code expired"
   🟢 Example: Non-existent code shows "Invalid code"

🔵 Rule 3: Some codes have minimum requirements
   🟢 Example: "MIN50" requires $50 minimum purchase

🔴 Question: Can codes be combined?
   → Answer: No, one code per order
```

### Formulation Result

```gherkin
Feature: Discount Code Application
  As a customer
  I want to apply a discount code to my cart
  So that I can save money on my purchase

  Background:
    Given I have items in my cart

  Scenario: Apply percentage discount code
    Given my cart total is $100
    When I apply discount code "SAVE10"
    Then my total should be $90
    And I should see "10% discount applied"

  Scenario: Apply flat amount discount code
    Given my cart total is $100
    When I apply discount code "FLAT5"
    Then my total should be $95
    And I should see "$5 discount applied"

  Scenario: Reject expired discount code
    When I apply discount code "EXPIRED2023"
    Then I should see error "This code has expired"
    And my total should remain unchanged

  Scenario: Reject code below minimum purchase
    Given my cart total is $30
    When I apply discount code "MIN50"
    Then I should see error "Minimum purchase of $50 required"
    And my total should remain unchanged
```

### Automation Result

```typescript
// Step definitions
Given('my cart total is ${int}', async function (total) {
  await this.cart.setTotal(total);
});

When('I apply discount code {string}', async function (code) {
  this.result = await this.cart.applyDiscount(code);
});

Then('my total should be ${int}', async function (expected) {
  expect(await this.cart.getTotal()).to.equal(expected);
});

Then('I should see error {string}', async function (message) {
  expect(this.result.error).to.equal(message);
});
```

---

## Related Resources

- [Gherkin Quick Reference](./gherkin-guide.md)
- [BDD Core Standard](../../../core/behavior-driven-development.md)
- [TDD Workflow](../tdd-assistant/tdd-workflow.md)
