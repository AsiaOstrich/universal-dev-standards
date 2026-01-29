# Behavior-Driven Development (BDD) Standards

**Version**: 1.1.0
**Last Updated**: 2026-01-25
**Applicability**: All projects adopting Behavior-Driven Development
**Scope**: universal

> **Language**: [English](../core/behavior-driven-development.md) | [繁體中文](../locales/zh-TW/core/behavior-driven-development.md)

---

## Purpose

This standard defines the principles, workflows, and best practices for Behavior-Driven Development (BDD), ensuring that software behavior is specified through collaboration between business and technical stakeholders using a shared language.

**Key Benefits**:
- Shared understanding between business, development, and testing teams
- Executable specifications that serve as living documentation
- Tests written in natural language that stakeholders can read and validate
- Reduced ambiguity in requirements through concrete examples
- Improved collaboration through Three Amigos sessions

---

## Methodology Classification

> **Classification**: Traditional Development Methodology (2006)

BDD is part of the **traditional test-driven development family** that evolved from TDD. It is distinct from the **AI-era SDD (Spec-Driven Development)** methodology.

### Historical Context

| Methodology | Era | Origin | Focus |
|-------------|-----|--------|-------|
| **TDD** | 1999 | Kent Beck, XP | Tests drive code design |
| **BDD** | 2006 | Dan North | Behavior drives tests |
| **ATDD** | 2003-2006 | GOOS, Gojko Adzic | Acceptance drives development |
| **SDD** | 2025+ | Thoughtworks, Martin Fowler | Specs drive generation (AI-era) |

### Double-Loop TDD (GOOS)

BDD and TDD form the **Double-Loop TDD** pattern described in "Growing Object-Oriented Software, Guided by Tests" (Freeman & Pryce, 2009):

```
┌──────────────────────────────────────────────────────────────┐
│                    Double-Loop TDD (GOOS)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  BDD (Outer Loop) - Hours to Days                    │   │
│   │  ├─ User/Business perspective                        │   │
│   │  ├─ Given-When-Then scenarios                        │   │
│   │  └─ Feature-level acceptance                         │   │
│   │        ↓                                             │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  TDD (Inner Loop) - Minutes                  │   │   │
│   │   │  ├─ Code/Implementation perspective          │   │   │
│   │   │  └─ Red → Green → Refactor                   │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   Key: BDD → TDD (not ATDD → SDD → BDD → TDD)               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Relationship to SDD

SDD's Forward Derivation **generates** BDD scenarios from specifications:

```
SDD: Spec → /derive-bdd → .feature files → BDD Workflow
```

BDD can be used to **refine** the generated scenarios with stakeholders, but BDD is not part of the SDD methodology itself.

### Collaborative Acceptance (Formerly ATDD Focus)

BDD naturally incorporates collaborative acceptance practices:

- **Three Amigos**: Customer/PO + Developer + Tester
- **Specification Workshop**: (Optional) Define AC together before development
- **Given-When-Then**: Shared language for acceptance criteria

> **Note**: Formal ATDD workshops are optional. Teams may define AC through any input method (interviews, PRDs, emails) and still use BDD effectively.

**Reference**: [Spec-Driven Development Standards](spec-driven-development.md)

---

## Table of Contents

1. [BDD Core Concepts](#bdd-core-concepts)
2. [BDD Workflow](#bdd-workflow)
3. [Gherkin Syntax](#gherkin-syntax)
4. [Step Definition Guidelines](#step-definition-guidelines)
5. [Three Amigos Collaboration](#three-amigos-collaboration)
6. [Living Documentation](#living-documentation)
7. [BDD vs TDD vs ATDD](#bdd-vs-tdd-vs-atdd)
8. [Integration with SDD and TDD](#integration-with-sdd-and-tdd)
9. [Anti-Patterns and Remediation](#anti-patterns-and-remediation)
10. [Tooling by Language](#tooling-by-language)
11. [Metrics and Assessment](#metrics-and-assessment)
12. [Related Standards](#related-standards)
13. [References](#references)
14. [Version History](#version-history)
15. [License](#license)

---

## BDD Core Concepts

### What is BDD?

BDD is a collaborative approach to software development that bridges the communication gap between business and technical teams. It was created by Dan North in 2006 as an evolution of TDD.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BDD Core Principles                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. COLLABORATION                                                           │
│     Business + Development + Testing work together                          │
│                                                                             │
│  2. UBIQUITOUS LANGUAGE                                                     │
│     Everyone uses the same vocabulary (Domain-Driven Design concept)        │
│                                                                             │
│  3. OUTSIDE-IN DEVELOPMENT                                                  │
│     Start from behavior (what), then implement (how)                        │
│                                                                             │
│  4. EXECUTABLE SPECIFICATIONS                                               │
│     Scenarios are both documentation and tests                              │
│                                                                             │
│  5. LIVING DOCUMENTATION                                                    │
│     Specifications stay current because they're executable                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Discovery-Formulation-Automation (DFA) Workflow

BDD follows a three-phase iterative process:

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
│   🔍 DISCOVERY (30-60 minutes)                                              │
│   ├─ Collaborative exploration with stakeholders                           │
│   ├─ Understand the "why" behind features                                  │
│   ├─ Identify concrete examples and edge cases                             │
│   └─ Use Example Mapping technique                                         │
│                                                                             │
│   📝 FORMULATION (15-30 minutes)                                            │
│   ├─ Convert examples to Gherkin scenarios                                 │
│   ├─ Use declarative style (WHAT, not HOW)                                 │
│   ├─ Apply ubiquitous language                                             │
│   └─ Review scenarios with stakeholders                                    │
│                                                                             │
│   ⚙️ AUTOMATION (Variable)                                                  │
│   ├─ Write step definitions                                                │
│   ├─ Implement feature code using TDD                                      │
│   ├─ Run scenarios until all pass                                          │
│   └─ Refactor and maintain                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## BDD Workflow

### Phase 1: Discovery

**Purpose**: Collaboratively explore requirements and identify concrete examples.

#### Example Mapping Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                    Example Mapping                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🟡 [User Story]                                               │
│        │                                                        │
│        ├─ 🔵 Rule 1: "Users must be authenticated"              │
│        │      │                                                 │
│        │      ├─ 🟢 Example: Login with valid credentials       │
│        │      └─ 🟢 Example: Login with invalid credentials     │
│        │                                                        │
│        ├─ 🔵 Rule 2: "Locked accounts cannot login"             │
│        │      │                                                 │
│        │      ├─ 🟢 Example: Attempt login on locked account    │
│        │      └─ 🟢 Example: Account locked after 3 failures    │
│        │                                                        │
│        └─ 🔴 Question: What about password expiration?          │
│                                                                 │
│   Legend: 🟡 Yellow (Story) 🔵 Blue (Rule) 🟢 Green (Example)   │
│           🔴 Red (Question)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Discovery Session Checklist

| Step | Description | Time |
|------|-------------|------|
| 1. Present Story | PO explains the user story and value | 5 min |
| 2. Ask Questions | Team asks clarifying questions | 10 min |
| 3. Identify Rules | Extract business rules from discussion | 10 min |
| 4. Find Examples | Create concrete examples for each rule | 15 min |
| 5. Identify Gaps | Note unanswered questions for follow-up | 5 min |

### Phase 2: Formulation

**Purpose**: Convert examples into executable Gherkin scenarios.

#### Formulation Principles

| Principle | Good | Bad |
|-----------|------|-----|
| **Declarative** | Given I am logged in | Given I navigate to /login and type "user" in #email field |
| **Business Language** | When I place an order | When I click the submit button |
| **Single Behavior** | Then my order is confirmed | Then my order is confirmed and email is sent and inventory is updated |
| **No Conjunctions** | One action per When | When I add item and click checkout and enter address |

### Phase 3: Automation

**Purpose**: Implement step definitions and feature code.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BDD + TDD Integration                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BDD Scenario (Feature Level)                                  │
│        │                                                        │
│        │ Scenario: User places order                            │
│        │   Given items in cart                                  │
│        │   When checkout                                        │
│        │   Then order confirmed                                 │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │ Step Definition: "items in cart"         │                  │
│   │                                          │                  │
│   │   → TDD Cycle (Unit Level)               │                  │
│   │     🔴 Test Cart.addItem()               │                  │
│   │     🟢 Implement Cart.addItem()          │                  │
│   │     🔵 Refactor                          │                  │
│   │                                          │                  │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
│   BDD provides WHAT to build (behavior)                         │
│   TDD provides HOW to build it (implementation)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Gherkin Syntax

### Basic Structure

```gherkin
Feature: Short feature description
  As a [role]
  I want [feature]
  So that [benefit]

  Background:
    Given common preconditions for all scenarios

  Scenario: Scenario name describing behavior
    Given [initial context]
    And [additional context]
    When [action or event]
    And [additional action]
    Then [expected outcome]
    And [additional outcome]
    But [exception to outcome]

  Scenario Outline: Template with examples
    Given <initial_state>
    When <action>
    Then <expected_result>

    Examples:
      | initial_state | action | expected_result |
      | logged_in     | logout | logged_out      |
      | logged_out    | login  | logged_in       |
```

### Keywords Reference

| Keyword | Purpose | Chinese |
|---------|---------|---------|
| `Feature` | Container for related scenarios | 功能 |
| `Background` | Common preconditions for all scenarios | 背景 |
| `Scenario` | Single test case | 場景 |
| `Scenario Outline` | Template with multiple examples | 場景大綱 |
| `Examples` | Data table for Scenario Outline | 範例 |
| `Given` | Set up initial context | 假設 |
| `When` | Trigger action or event | 當 |
| `Then` | Assert expected outcome | 那麼 |
| `And` | Continue previous keyword | 且 |
| `But` | Exception to previous keyword | 但是 |

### Complete Example

```gherkin
Feature: Shopping Cart Checkout
  As a customer
  I want to checkout my shopping cart
  So that I can purchase the items I've selected

  Background:
    Given I am a registered customer
    And I am logged in

  Scenario: Successful checkout with valid payment
    Given I have the following items in my cart:
      | item       | quantity | price |
      | Widget A   | 2        | 10.00 |
      | Widget B   | 1        | 25.00 |
    And my cart total is $45.00
    When I proceed to checkout
    And I enter valid payment information
    And I confirm my order
    Then my order should be created
    And I should receive an order confirmation email
    And my cart should be empty

  Scenario: Checkout fails with invalid payment
    Given I have items in my cart totaling $50.00
    When I proceed to checkout
    And I enter invalid payment information
    Then I should see an error message "Payment declined"
    And my cart should still contain my items

  Scenario Outline: Apply discount codes
    Given I have items in my cart totaling <cart_total>
    When I apply discount code "<code>"
    Then my new total should be <final_total>
    And I should see message "<message>"

    Examples:
      | cart_total | code    | final_total | message              |
      | $100.00    | SAVE10  | $90.00      | 10% discount applied |
      | $100.00    | SAVE20  | $80.00      | 20% discount applied |
      | $50.00     | MIN100  | $50.00      | Minimum $100 required|
```

### Tags for Organization

```gherkin
@checkout @critical @smoke
Feature: Shopping Cart Checkout

  @happy-path
  Scenario: Successful checkout with valid payment
    ...

  @error-handling @wip
  Scenario: Checkout fails with invalid payment
    ...
```

Common tag patterns:

| Tag | Purpose |
|-----|---------|
| `@wip` | Work in progress, not ready |
| `@smoke` | Quick sanity tests |
| `@critical` | High-priority features |
| `@slow` | Long-running tests |
| `@manual` | Requires manual verification |
| `@skip` | Temporarily disabled |

---

## Step Definition Guidelines

### Step Definition Structure

```typescript
// JavaScript/Cucumber.js example
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('I have the following items in my cart:', async function (dataTable) {
  const items = dataTable.hashes();
  for (const item of items) {
    await this.cart.addItem(item.item, item.quantity, item.price);
  }
});

When('I proceed to checkout', async function () {
  this.checkoutResult = await this.checkoutService.initiateCheckout(this.cart);
});

Then('my order should be created', async function () {
  expect(this.checkoutResult.order).to.not.be.null;
  expect(this.checkoutResult.order.status).to.equal('created');
});
```

### Step Definition Best Practices

| Practice | Good | Bad |
|----------|------|-----|
| **Reusable** | Generic steps that work across features | Tightly coupled to specific scenarios |
| **Atomic** | One action per step | Multiple actions combined |
| **Parameterized** | Use placeholders: `I have {int} items` | Hardcoded: `I have 5 items` |
| **Stateless** | Use World object for state | Use global variables |

### Step Definition Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **UI Details** | `I click the #submit-btn button` | `I submit the form` |
| **Technical Jargon** | `I POST to /api/orders` | `I place an order` |
| **Assertions in Given** | `Given my balance is $100 (assert balance)` | Keep Given for setup only |
| **Duplicate Steps** | Same logic in multiple step files | Extract to helper functions |

---

## Three Amigos Collaboration

### What are Three Amigos?

Three Amigos is a collaborative meeting between three perspectives:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Three Amigos                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│          👔 BUSINESS                                            │
│          (Product Owner / BA)                                   │
│          "What do we need?"                                     │
│          "Why is this valuable?"                                │
│               │                                                 │
│               │                                                 │
│    ┌──────────┴──────────┐                                      │
│    │                     │                                      │
│    ▼                     ▼                                      │
│ 💻 DEVELOPMENT       🔍 TESTING                                 │
│ (Developer)          (QA / Tester)                              │
│ "How do we build it?" "What could go wrong?"                    │
│ "What's the impact?"  "How do we verify it?"                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Three Amigos Session Format

| Phase | Duration | Activities |
|-------|----------|------------|
| **1. Story Review** | 10 min | PO presents story and acceptance criteria |
| **2. Discussion** | 20 min | Team asks questions, identifies gaps |
| **3. Example Generation** | 20 min | Create concrete examples together |
| **4. Wrap-up** | 10 min | Summarize, assign follow-ups |

### Sample Questions by Role

| Role | Sample Questions |
|------|------------------|
| **Business** | "What's the business value?", "Who are the users?", "What's the priority?" |
| **Development** | "What systems are affected?", "Are there performance concerns?", "What about existing data?" |
| **Testing** | "What could go wrong?", "What are the edge cases?", "How do we verify success?" |

---

## Living Documentation

### What is Living Documentation?

Living Documentation refers to specifications that:
- Are always up-to-date (because they're executable tests)
- Can be read by non-technical stakeholders
- Serve as both tests and documentation

### Benefits

```
┌─────────────────────────────────────────────────────────────────┐
│                  Living Documentation Benefits                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Traditional Documentation:                                    │
│   ┌─────────┐  Write  ┌─────────┐  Stale  ┌─────────┐          │
│   │  Docs   │────────▶│  Code   │────────▶│  Drift  │          │
│   └─────────┘         └─────────┘         └─────────┘          │
│                                                                 │
│   Living Documentation:                                         │
│   ┌─────────┐  Execute  ┌─────────┐  Fail  ┌─────────┐         │
│   │  Specs  │──────────▶│  Code   │───────▶│  Fix    │         │
│   └─────────┘           └─────────┘        └─────────┘         │
│       ▲                      │                  │               │
│       │                      │                  │               │
│       └──────────────────────┴──────────────────┘               │
│               Always in sync                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Generating Documentation

Many BDD tools can generate HTML documentation from feature files:

| Tool | Command | Output |
|------|---------|--------|
| Cucumber | `cucumber --format html` | HTML report |
| SpecFlow | `livingdoc` | Living Doc |
| Behave | `behave --format html` | HTML output |

---

## BDD vs TDD vs ATDD

### Comparison Overview

| Aspect | TDD | BDD | ATDD |
|--------|-----|-----|------|
| **Focus** | Code units | Behavior | Acceptance criteria |
| **Language** | Programming code | Natural language (Gherkin) | Business language |
| **Participants** | Developers | Developers + BA + QA | Entire team + stakeholders |
| **Test Level** | Unit/Integration | Feature/Scenario | System/Acceptance |
| **Tools** | xUnit frameworks | Cucumber, Behave, SpecFlow | FitNesse, Concordion |
| **When** | During coding | Before coding | Before development starts |
| **Primary Output** | Unit tests | Feature files | Acceptance tests |

### When to Use Each

```
┌─────────────────────────────────────────────────────────────────┐
│                    Decision Tree                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Is there a business stakeholder who needs to validate?        │
│   │                                                             │
│   ├─ Yes → Does stakeholder need to read/sign-off on tests?     │
│   │        │                                                    │
│   │        ├─ Yes → ATDD → BDD → TDD                            │
│   │        │        (Full collaboration cycle)                  │
│   │        │                                                    │
│   │        └─ No → BDD → TDD                                    │
│   │                (Behavior specs drive development)           │
│   │                                                             │
│   └─ No → Is it a technical implementation detail?              │
│           │                                                     │
│           ├─ Yes → TDD only                                     │
│           │        (Unit-level test-first)                      │
│           │                                                     │
│           └─ No → Consider BDD for documentation                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Pyramid

```
┌─────────────────────────────────────────────────────────────────┐
│              Complete Test-Driven Development Stack              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Requirements     ATDD - Acceptance Test-Driven Development    │
│   Layer           (Business acceptance criteria + PO sign-off)  │
│                        ↓                                        │
│   Feature         BDD - Behavior-Driven Development             │
│   Layer           (Gherkin scenarios → Step Definitions)        │
│                        ↓                                        │
│   Development     TDD - Test-Driven Development                 │
│   Layer           (Unit Tests → Implementation Code)            │
│                        ↓                                        │
│   Integration     Integration & System Tests                    │
│   Layer                                                         │
│                                                                 │
│   Key: ATDD → BDD → TDD → Integration Tests (top-down flow)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration with SDD and TDD

### BDD + SDD Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SDD + BDD Integrated Workflow                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  SDD: PROPOSAL Phase                                                    │
│      ├─ Write Spec: Define feature, acceptance criteria                     │
│      └─ Get stakeholder approval (Spec ID: SPEC-001)                        │
│                                                                             │
│  2️⃣  BDD: DISCOVERY Phase                                                   │
│      ├─ Three Amigos session based on approved spec                         │
│      ├─ Example Mapping for each acceptance criterion                       │
│      └─ Identify gaps and additional examples                               │
│                                                                             │
│  3️⃣  BDD: FORMULATION Phase                                                 │
│      ├─ Convert examples to Gherkin scenarios                               │
│      └─ Reference SPEC-001 in feature file                                  │
│                                                                             │
│  4️⃣  BDD + TDD: AUTOMATION Phase                                            │
│      ├─ Write step definitions (scenarios fail = RED)                       │
│      ├─ Use TDD for unit-level implementation                               │
│      └─ Iterate until all scenarios pass (GREEN)                            │
│                                                                             │
│  5️⃣  SDD: VERIFICATION Phase                                                │
│      ├─ All BDD scenarios pass                                              │
│      └─ Spec acceptance criteria verified                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Referencing Spec in Feature Files

```gherkin
# Spec: SPEC-001 - User Authentication
# @see specs/SPEC-001-user-authentication.md

@SPEC-001
Feature: User Authentication
  Implements SPEC-001 user authentication requirements.

  @AC-1
  Scenario: Successful login with valid credentials
    # Acceptance Criterion 1 from SPEC-001
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in

  @AC-2
  Scenario: Failed login with invalid password
    # Acceptance Criterion 2 from SPEC-001
    ...
```

---

## Anti-Patterns and Remediation

### Scenario-Level Anti-Patterns

| Anti-Pattern | Example | Problem | Solution |
|--------------|---------|---------|----------|
| **Imperative Style** | `Given I click the login button` | UI details in scenarios | Use declarative: `Given I am logged in` |
| **Long Scenarios** | 20+ steps in one scenario | Hard to understand | Split into focused scenarios |
| **Scenario Coupling** | Scenario 2 depends on Scenario 1 | Tests not independent | Each scenario self-contained |
| **No Business Value** | `Scenario: Click button test` | Testing UI, not behavior | Focus on user outcomes |
| **Technical Jargon** | `When I POST to /api/v1/users` | Business can't understand | Use business language |

### Process-Level Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **No Discovery** | Jumping straight to writing scenarios | Always have Discovery session |
| **Developer-Only BDD** | Missing business/QA perspective | Include Three Amigos |
| **Automation-First** | Writing step definitions before scenarios | Formulation before Automation |
| **100% Coverage Obsession** | Writing scenarios for everything | Focus on high-value behaviors |
| **Scenario Explosion** | Too many similar scenarios | Use Scenario Outlines |

### Diagnosis and Remediation

```
┌─────────────────────────────────────────────────────────────────┐
│           BDD Anti-Pattern Diagnosis                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Symptom: Scenarios break on UI changes                         │
│  ├─ Likely cause: Imperative style, UI details                  │
│  └─ Fix: Rewrite using declarative, behavior-focused language   │
│                                                                 │
│  Symptom: Business stakeholders don't read scenarios            │
│  ├─ Likely cause: Technical jargon, poor structure              │
│  └─ Fix: Three Amigos review, use ubiquitous language           │
│                                                                 │
│  Symptom: Scenarios pass but features don't work                │
│  ├─ Likely cause: Missing important scenarios, gaps             │
│  └─ Fix: Better Discovery sessions, Example Mapping             │
│                                                                 │
│  Symptom: Feature files are unmanageable                        │
│  ├─ Likely cause: Too many scenarios, poor organization         │
│  └─ Fix: Use tags, split features, prune obsolete scenarios     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tooling by Language

### BDD Tools by Language

| Language | Primary Tool | Alternative Tools |
|----------|--------------|-------------------|
| **JavaScript/TypeScript** | Cucumber.js | Jest-Cucumber, Playwright BDD |
| **Python** | Behave | pytest-bdd, Lettuce |
| **Java** | Cucumber-JVM | JBehave, Serenity BDD |
| **C#** | SpecFlow | xBehave.net, LightBDD |
| **Ruby** | Cucumber | RSpec (BDD-style) |
| **Go** | Godog | GoBDD |
| **PHP** | Behat | Codeception BDD |

### Tool Selection Guidelines

| Consideration | Recommendation |
|---------------|----------------|
| **Team Experience** | Use tools the team already knows |
| **IDE Support** | Choose tools with good IDE integration |
| **CI/CD Integration** | Ensure tool produces standard reports |
| **Living Documentation** | Consider tools with doc generation |

---

## Metrics and Assessment

### BDD Maturity Model

| Level | Name | Characteristics |
|-------|------|-----------------|
| **Level 0** | No BDD | No behavior specifications |
| **Level 1** | Tool-Focused | Using Cucumber but no collaboration |
| **Level 2** | Collaborative | Three Amigos sessions, shared language |
| **Level 3** | Discovery-Driven | Example Mapping, proactive exploration |
| **Level 4** | Living Documentation | Specs drive development, stakeholders engaged |

### Key Metrics

| Metric | Target | Warning |
|--------|--------|---------|
| **Scenario Coverage** | Key behaviors covered | Major features without scenarios |
| **Scenario Execution Time** | < 30 min for full suite | > 1 hour |
| **Flaky Scenario Rate** | 0% | > 2% |
| **Stakeholder Participation** | 100% of Discovery sessions | < 50% |
| **Scenario to Unit Test Ratio** | 1:10 to 1:20 | > 1:5 (too many scenarios) |

### Assessment Checklist

```
Team BDD Assessment:

□ Discovery sessions held for new features
□ Three Amigos participate in story refinement
□ Scenarios written in declarative style
□ Business language used (ubiquitous language)
□ Feature files reviewed by stakeholders
□ Step definitions are reusable
□ Scenarios are independent
□ Living documentation generated
□ Scenarios run in CI/CD
□ No flaky scenarios
```

---

## Related Standards

- [Test-Driven Development](test-driven-development.md) - TDD workflow and integration
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD standards
- [Spec-Driven Development](spec-driven-development.md) - SDD workflow
- [Testing Standards](testing-standards.md) - Core testing standards
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 8 dimensions framework
- [Code Check-in Standards](checkin-standards.md) - Check-in requirements

---

## References

### Books

- Dan North - "Introducing BDD" (2006, Blog Post)
- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009) - Defines the Double-Loop TDD pattern (BDD outer loop + TDD inner loop)
- Gojko Adzic - "Specification by Example" (2011)
- Gojko Adzic - "Bridging the Communication Gap" (2009)
- Seb Rose & Matt Wynne - "The Cucumber Book" (2017)
- John Ferguson Smart - "BDD in Action" (2014)

### Online Resources

- [Introducing BDD - Dan North (Original Article)](https://dannorth.net/introducing-bdd/) - The original article that introduced BDD in 2006
- [Cucumber Documentation](https://cucumber.io/docs)
- [BDD 101 - Automation Panda](https://automationpanda.com/bdd/)
- [Example Mapping - Cucumber Blog](https://cucumber.io/blog/bdd/example-mapping-introduction/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Three Amigos - Agile Alliance](https://www.agilealliance.org/glossary/three-amigos/)
- [Wikipedia: Behavior-driven development](https://en.wikipedia.org/wiki/Behavior-driven_development)

### Standards

- [IEEE 29119 - Software Testing Standards](https://www.iso.org/standard/81291.html)
- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-25 | Added: Methodology Classification section (Traditional Development Methodology designation, Double-Loop TDD explanation, relationship to SDD) |
| 1.0.0 | 2026-01-19 | Initial BDD standard definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
