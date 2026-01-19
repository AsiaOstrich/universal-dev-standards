# Gherkin Quick Reference Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

---

## Overview

Gherkin is a Business Readable, Domain Specific Language for describing software behavior without detailing how that behavior is implemented.

---

## Keywords

### Feature

Container for related scenarios.

```gherkin
Feature: Shopping Cart
  As a customer
  I want to manage my shopping cart
  So that I can purchase products I want
```

### Scenario

Single test case describing a specific behavior.

```gherkin
Scenario: Add item to empty cart
  Given I have an empty cart
  When I add "Widget" to my cart
  Then my cart should contain 1 item
```

### Given

Set up initial context or state.

```gherkin
Given I am logged in as "admin@example.com"
Given I have 3 items in my cart
Given the following users exist:
  | email            | role  |
  | user@example.com | user  |
  | admin@example.com| admin |
```

### When

Trigger an action or event.

```gherkin
When I click the "Submit" button
When I search for "laptop"
When I add "Widget" to my cart
```

### Then

Assert expected outcomes.

```gherkin
Then I should see "Order confirmed"
Then my cart total should be $99.99
Then I should receive a confirmation email
```

### And / But

Continue the previous keyword.

```gherkin
Scenario: Login with valid credentials
  Given I am on the login page
  And I have a registered account
  When I enter my email
  And I enter my password
  And I click login
  Then I should see my dashboard
  And I should see a welcome message
  But I should not see the login form
```

### Background

Common setup for all scenarios in a feature.

```gherkin
Feature: User Profile
  Background:
    Given I am logged in
    And I am on my profile page

  Scenario: Update display name
    When I change my display name to "NewName"
    Then my display name should be "NewName"

  Scenario: Update email
    When I change my email to "new@example.com"
    Then my email should be "new@example.com"
```

### Scenario Outline

Template with multiple data sets.

```gherkin
Scenario Outline: Calculate discount
  Given my cart total is <cart_total>
  When I apply discount code "<code>"
  Then my total should be <final_total>

  Examples:
    | cart_total | code    | final_total |
    | $100       | SAVE10  | $90         |
    | $100       | SAVE20  | $80         |
    | $50        | SAVE10  | $45         |
```

---

## Data Tables

### Hash Table (Named Columns)

```gherkin
Given the following users exist:
  | name  | email            | role  |
  | John  | john@example.com | admin |
  | Jane  | jane@example.com | user  |
```

```typescript
// Step definition
Given('the following users exist:', async function (dataTable) {
  const users = dataTable.hashes();
  // users = [
  //   { name: 'John', email: 'john@example.com', role: 'admin' },
  //   { name: 'Jane', email: 'jane@example.com', role: 'user' }
  // ]
  for (const user of users) {
    await createUser(user);
  }
});
```

### Raw Table (No Headers)

```gherkin
Given I have the following items:
  | Widget A |
  | Widget B |
  | Widget C |
```

```typescript
// Step definition
Given('I have the following items:', async function (dataTable) {
  const items = dataTable.raw().flat();
  // items = ['Widget A', 'Widget B', 'Widget C']
});
```

### Row Arrays

```gherkin
Given these price tiers:
  | tier     | min | max  | discount |
  | Bronze   | 0   | 99   | 0%       |
  | Silver   | 100 | 499  | 5%       |
  | Gold     | 500 | 999  | 10%      |
```

```typescript
// Step definition
Given('these price tiers:', async function (dataTable) {
  const rows = dataTable.rows();
  // rows = [
  //   ['Bronze', '0', '99', '0%'],
  //   ['Silver', '100', '499', '5%'],
  //   ['Gold', '500', '999', '10%']
  // ]
});
```

---

## Doc Strings

For multi-line text content.

```gherkin
Scenario: Create article
  Given I am on the new article page
  When I enter the following content:
    """
    # Welcome

    This is the article body.

    - Point 1
    - Point 2
    """
  And I click publish
  Then the article should be created
```

---

## Tags

Organize and filter scenarios.

### Common Tags

```gherkin
@smoke @critical
Feature: User Authentication

  @happy-path
  Scenario: Successful login
    ...

  @error-handling
  Scenario: Failed login
    ...

  @wip
  Scenario: Two-factor authentication
    ...

  @slow @integration
  Scenario: SSO login
    ...
```

### Tag Categories

| Tag | Purpose |
|-----|---------|
| `@smoke` | Quick sanity tests |
| `@critical` | High-priority features |
| `@wip` | Work in progress |
| `@slow` | Long-running tests |
| `@manual` | Requires manual verification |
| `@skip` | Temporarily disabled |
| `@integration` | Integration tests |
| `@api` | API-level tests |
| `@ui` | UI-level tests |

### Running with Tags

```bash
# Run only smoke tests
cucumber --tags @smoke

# Run critical but not slow tests
cucumber --tags "@critical and not @slow"

# Run smoke or critical tests
cucumber --tags "@smoke or @critical"
```

---

## Localization

Gherkin supports multiple languages.

### English (Default)

```gherkin
Feature: Shopping Cart
  Scenario: Add item
    Given I have an empty cart
    When I add an item
    Then my cart should have 1 item
```

### Traditional Chinese (zh-TW)

```gherkin
# language: zh-TW
功能: 購物車
  場景: 新增商品
    假設 我有一個空的購物車
    當 我新增一個商品
    那麼 我的購物車應該有 1 個商品
```

### Simplified Chinese (zh-CN)

```gherkin
# language: zh-CN
功能: 购物车
  场景: 添加商品
    假如 我有一个空的购物车
    当 我添加一个商品
    那么 我的购物车应该有 1 个商品
```

### Japanese (ja)

```gherkin
# language: ja
機能: ショッピングカート
  シナリオ: 商品を追加
    前提 カートが空である
    もし 商品を追加する
    ならば カートには 1 個の商品がある
```

---

## Best Practices

### DO

```gherkin
# ✅ Declarative - describes behavior
Scenario: Successful checkout
  Given I have items in my cart
  And I am logged in
  When I complete checkout with valid payment
  Then my order should be confirmed

# ✅ Business language
Scenario: Apply loyalty discount
  Given I am a gold member
  And my cart total is $100
  When I proceed to checkout
  Then I should receive a 15% discount

# ✅ Independent scenarios
# Each scenario sets up its own context
Scenario: New user registration
  Given I am a new visitor
  When I register with valid details
  Then I should have an account
```

### DON'T

```gherkin
# ❌ Imperative - too technical
Scenario: Login
  Given I navigate to "/login"
  And I type "user@example.com" into "#email"
  And I type "password" into "#password"
  And I click "#submit"
  Then I should see element ".dashboard"

# ❌ Technical jargon
Scenario: API authentication
  Given I POST to "/api/auth" with JSON payload
  Then the response code should be 200
  And the response should contain "token"

# ❌ Dependent scenarios
Scenario: Step 1 - Create user
  ...
Scenario: Step 2 - Login as user created above
  # This depends on Scenario 1 running first!
```

---

## Common Patterns

### Page Object Integration

```gherkin
# Scenario references pages, not elements
Scenario: Navigate to checkout
  Given I am on the cart page
  When I click proceed to checkout
  Then I should be on the checkout page
```

### Data-Driven Testing

```gherkin
Scenario Outline: Validate email format
  When I register with email "<email>"
  Then I should see "<message>"

  Examples:
    | email           | message         |
    | valid@test.com  | Success         |
    | invalid         | Invalid email   |
    | @test.com       | Invalid email   |
    |                 | Email required  |
```

### Hooks (Non-Gherkin)

```typescript
// In step definitions
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function () {
  // Setup once before all scenarios
  await database.connect();
});

Before(async function () {
  // Setup before each scenario
  await database.beginTransaction();
});

After(async function () {
  // Cleanup after each scenario
  await database.rollback();
});

AfterAll(async function () {
  // Cleanup once after all scenarios
  await database.disconnect();
});
```

---

## Tools by Language

| Language | Tool | Package |
|----------|------|---------|
| JavaScript | Cucumber.js | `@cucumber/cucumber` |
| TypeScript | Cucumber.js | `@cucumber/cucumber` |
| Python | Behave | `behave` |
| Python | pytest-bdd | `pytest-bdd` |
| Java | Cucumber-JVM | `io.cucumber:cucumber-java` |
| C# | SpecFlow | `SpecFlow` |
| Ruby | Cucumber | `cucumber` |
| Go | Godog | `github.com/cucumber/godog` |

---

## Related Resources

- [BDD Workflow Guide](./bdd-workflow.md)
- [BDD Core Standard](../../../core/behavior-driven-development.md)
- [Official Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
