# ATDD Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

---

## ATDD Cycle Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ATDD Workflow                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│   │ 🤝 WORKSHOP  │───▶│ 🧪 DISTILL   │───▶│ 💻 DEVELOP   │                 │
│   └──────────────┘    └──────────────┘    └──────────────┘                 │
│          │                                       │                          │
│          │                                       ▼                          │
│          │                               ┌──────────────┐                   │
│          │                               │ 🎬 DEMO      │                   │
│          │                               └──────────────┘                   │
│          │                                       │                          │
│          │            ┌──────────────┐           │                          │
│          └───────────▶│ ✅ DONE      │◀──────────┘                          │
│                       └──────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Specification Workshop

### Purpose

Collaboratively define what "done" looks like with concrete acceptance criteria.

### Duration

30-60 minutes

### Participants

- Product Owner (Required)
- Developer(s) (Required)
- QA/Tester (Required)
- Stakeholders (Optional)

### Agenda

| Time | Activity | Lead |
|------|----------|------|
| 0-5 min | Story Presentation | PO |
| 5-15 min | Clarifying Questions | All |
| 15-35 min | AC Definition | All |
| 35-45 min | Out of Scope | All |
| 45-55 min | Technical Notes | Dev |
| 55-60 min | Wrap-up | All |

### Workshop Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              Specification Workshop Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. STORY PRESENTATION (5 min)                                  │
│     └─▶ PO explains user story, business value, context         │
│                                                                 │
│  2. CLARIFYING QUESTIONS (10 min)                               │
│     ├─▶ Business: "What's the value?", "Priority?"              │
│     ├─▶ Dev: "Impact?", "Dependencies?", "Performance?"         │
│     └─▶ QA: "What could go wrong?", "Edge cases?"               │
│                                                                 │
│  3. ACCEPTANCE CRITERIA DEFINITION (20 min)                     │
│     ├─▶ Define happy path AC                                    │
│     ├─▶ Define error/edge case AC                               │
│     └─▶ Use Given-When-Then format                              │
│                                                                 │
│  4. OUT OF SCOPE (10 min)                                       │
│     └─▶ Explicitly list what is NOT included                    │
│                                                                 │
│  5. TECHNICAL NOTES (5 min)                                     │
│     └─▶ Implementation hints, constraints, dependencies         │
│                                                                 │
│  6. WRAP-UP (5 min)                                             │
│     ├─▶ Review all AC                                           │
│     ├─▶ Confirm PO understanding                                │
│     └─▶ Schedule distillation session                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Questions by Role

| Role | Focus | Questions |
|------|-------|-----------|
| **Business** | What & Why | What's the business value? Who are the users? What problem does this solve? What's the priority? |
| **Development** | How | What systems are affected? Are there dependencies? Performance concerns? Existing data impact? |
| **Testing** | What if | What could go wrong? What are the edge cases? How do we verify success? Security concerns? |

### Output Template

```markdown
## User Story: [US-XXX] [Title]

**Workshop Date**: [Date]
**Participants**: [Names]

**As a** [role]
**I want** [feature]
**So that** [benefit]

## Acceptance Criteria

### AC-1: [Happy path description]
**Given** [precondition]
**When** [action]
**Then** [expected result]

### AC-2: [Error scenario]
**Given** [precondition]
**When** [invalid action]
**Then** [error handling]

### AC-3: [Edge case]
**Given** [edge condition]
**When** [action]
**Then** [appropriate result]

## Out of Scope
- [Feature 1 - deferred to future sprint]
- [Feature 2 - out of MVP]

## Technical Notes
- [Constraint 1]
- [Dependency information]
- [Performance requirement]

## Open Questions
- [ ] [Question 1 - assigned to: @person]
- [ ] [Question 2 - need PO clarification]
```

### Checklist

```
□ Product Owner present
□ Developer(s) present
□ QA/Tester present
□ User story explained with business value
□ All clarifying questions answered (or noted)
□ Acceptance criteria in Given-When-Then format
□ Happy path covered
□ Error scenarios covered
□ Edge cases covered
□ Out of scope explicitly documented
□ Technical notes added
□ All participants agree on scope
```

---

## Phase 2: Distillation

### Purpose

Convert acceptance criteria into executable, automatable tests.

### Duration

30-60 minutes

### Participants

- Developer(s) (Required)
- QA/Tester (Required)
- Product Owner (For sign-off)

### Steps

```
┌─────────────────────────────────────────────────────────────────┐
│              Distillation Process                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REVIEW ACCEPTANCE CRITERIA                                  │
│     For each AC:                                                │
│     □ Is it unambiguous?                                        │
│     □ Can it be automated?                                      │
│     □ Does it verify business value?                            │
│     → Refine any unclear criteria                               │
│                                                                 │
│  2. CHOOSE TEST FORMAT                                          │
│     │                                                           │
│     ├─ Gherkin → Cucumber, SpecFlow, Behave                     │
│     ├─ Wiki Tables → FitNesse, Slim                             │
│     ├─ Keywords → Robot Framework                               │
│     └─ Code → xUnit with descriptive names                      │
│                                                                 │
│  3. WRITE EXECUTABLE TESTS                                      │
│     │                                                           │
│     ├─ One test per acceptance criterion                        │
│     ├─ Include setup/teardown                                   │
│     └─ Ensure tests are independent                             │
│                                                                 │
│  4. PO SIGN-OFF                                                 │
│     │                                                           │
│     ├─ PO reviews test specifications                           │
│     ├─ Confirms tests represent requirements                    │
│     └─ Signs off before development starts                      │
│                                                                 │
│  5. RUN TESTS (SHOULD FAIL)                                     │
│     │                                                           │
│     └─ All tests fail initially (RED state)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Test Format Comparison

| Format | Tool Examples | Business Readable | Best For |
|--------|--------------|-------------------|----------|
| **Gherkin** | Cucumber, SpecFlow | ★★★★★ | Behavior scenarios |
| **Wiki Tables** | FitNesse | ★★★★☆ | Data-driven tests |
| **Keywords** | Robot Framework | ★★★★☆ | Complex workflows |
| **Code** | xUnit, pytest | ★★☆☆☆ | Technical teams |

### Gherkin Example

```gherkin
# File: features/password-reset.feature
# Story: US-123 - Password Reset

@US-123
Feature: Password Reset
  As a registered user
  I want to reset my password via email
  So that I can regain access if I forget my password

  @AC-1 @happy-path
  Scenario: Request password reset
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I click "Forgot Password"
    And I enter my email "user@example.com"
    Then I should see "Reset link sent to your email"
    And I should receive an email within 5 minutes

  @AC-2 @error-handling
  Scenario: Reset link expires after 24 hours
    Given I have requested a password reset
    When I click the reset link after 24 hours
    Then I should see "This link has expired"
    And I should be offered to request a new link

  @AC-3 @security
  Scenario: Unregistered email shows generic message
    Given I am on the password reset page
    When I enter an unregistered email
    Then I should see "Reset link sent to your email"
    But no email should actually be sent
```

### Checklist

```
□ All AC reviewed for clarity
□ Ambiguous criteria clarified
□ Test format chosen
□ Executable tests written for all AC
□ Tests are independent
□ PO reviewed and signed off
□ Tests run and fail (RED)
```

---

## Phase 3: Development

### Purpose

Implement the feature, driven by the acceptance tests.

### Duration

Variable (depends on complexity)

### Participants

- Developer(s) (Primary)
- QA/Tester (Support)

### Development Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ATDD Development Flow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Acceptance Tests (RED - All failing)                                      │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────────────────────────────────┐                               │
│   │ For each Acceptance Test:               │                               │
│   │                                         │                               │
│   │   1. Identify needed components         │                               │
│   │        │                                │                               │
│   │        ▼                                │                               │
│   │   ┌─────────────────────────────┐       │                               │
│   │   │ TDD Cycle (for each unit)   │       │                               │
│   │   │  🔴 Write failing unit test │       │                               │
│   │   │  🟢 Implement minimal code  │       │                               │
│   │   │  🔵 Refactor                │       │                               │
│   │   └─────────────┬───────────────┘       │                               │
│   │                 │                       │                               │
│   │                 ▼                       │                               │
│   │   Run Acceptance Test                   │                               │
│   │        │                                │                               │
│   │        ├─ Still failing? → More TDD     │                               │
│   │        │                                │                               │
│   │        └─ Passing? → Next AT            │                               │
│   │                                         │                               │
│   └─────────────────────────────────────────┘                               │
│        │                                                                    │
│        ▼                                                                    │
│   All Acceptance Tests (GREEN - All passing)                                │
│        │                                                                    │
│        ▼                                                                    │
│   Refactor (keeping tests green)                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ATDD + BDD + TDD Integration

```
Level              Focus                   Participants
─────              ─────                   ────────────
ATDD               Acceptance Criteria     PO + Dev + QA
  │                (What is done?)
  │
  ▼
BDD                Behavior Scenarios      Dev + QA + BA
  │                (How it behaves?)
  │
  ▼
TDD                Unit Implementation     Developers
                   (How it works?)
```

### Checklist

```
□ Acceptance tests fail initially (RED)
□ BDD scenarios written for features
□ TDD used for unit implementations
□ Incremental progress tracked
□ All acceptance tests pass (GREEN)
□ Code refactored and clean
□ Code reviewed
□ Ready for demo
```

---

## Phase 4: Demo

### Purpose

Demonstrate the completed feature to stakeholders and get formal acceptance.

### Duration

15-30 minutes

### Participants

- Product Owner (Required)
- Developer(s) (Required)
- QA/Tester (Required)
- Stakeholders (As needed)

### Demo Structure

| Time | Activity | Lead |
|------|----------|------|
| 0-1 min | Context | Dev |
| 1-3 min | Show Tests | QA |
| 3-13 min | Feature Demo | Dev |
| 13-20 min | Feedback & Q&A | PO |
| 20-25 min | Decision | PO |

### Demo Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Demo Structure                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CONTEXT (1 min)                                             │
│     ├─ Remind stakeholders of user story                        │
│     └─ Show acceptance criteria                                 │
│                                                                 │
│  2. SHOW TESTS (2 min)                                          │
│     ├─ Run acceptance tests live                                │
│     └─ Show all passing                                         │
│                                                                 │
│  3. FEATURE DEMO (5-10 min)                                     │
│     ├─ Walk through each acceptance criterion                   │
│     ├─ Show working functionality                               │
│     └─ Demonstrate edge cases if tested                         │
│                                                                 │
│  4. FEEDBACK & Q&A (5 min)                                      │
│     ├─ Gather feedback                                          │
│     ├─ Clarify any questions                                    │
│     └─ Note any new requirements                                │
│                                                                 │
│  5. DECISION (5 min)                                            │
│     │                                                           │
│     ├─ ✅ ACCEPTED                                              │
│     │     Story complete, ready to merge                        │
│     │                                                           │
│     ├─ 🔄 REFINEMENT NEEDED                                     │
│     │     Return to workshop with new learnings                 │
│     │                                                           │
│     └─ ❌ NOT ACCEPTED                                          │
│           Identify gaps, iterate                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Checklist

```
□ Demo environment prepared
□ Test data ready
□ All acceptance tests passing
□ Stakeholders notified and present
□ Demo completed successfully
□ PO decision recorded
□ Next steps documented
```

---

## Phase 5: Done

### Definition of Done

```
□ All acceptance tests pass
□ Product Owner accepted
□ Code reviewed and approved
□ Code merged to main branch
□ Documentation updated
□ Ready for release
```

### Post-Acceptance

1. **Merge code** to main branch
2. **Update documentation** if needed
3. **Close story** in tracking system
4. **Share learnings** with team
5. **Plan next story**

---

## Complete Example

### User Story

> **US-456**: As a customer, I want to receive order confirmation via email, so that I have a record of my purchase.

### Workshop Output

```markdown
## User Story: [US-456] Order Confirmation Email

**Workshop Date**: 2026-01-19
**Participants**: Alice (PO), Bob (Dev), Carol (QA)

**As a** customer
**I want** to receive order confirmation via email
**So that** I have a record of my purchase

## Acceptance Criteria

### AC-1: Email sent on successful order
**Given** I am a logged-in customer
**And** I have completed a purchase
**When** my payment is processed successfully
**Then** I should receive a confirmation email within 5 minutes
**And** the email should contain my order number

### AC-2: Email contains order details
**Given** I have received a confirmation email
**Then** it should contain:
- Order number
- List of items purchased
- Total amount paid
- Shipping address
- Estimated delivery date

### AC-3: Guest checkout email
**Given** I completed checkout as a guest
**When** my order is confirmed
**Then** I should receive confirmation at the email I provided
**And** the email should include a link to track my order

## Out of Scope
- SMS notification
- Push notification
- PDF attachment of receipt
- Multiple email templates for different countries

## Technical Notes
- Use existing email service (SendGrid)
- Queue emails for reliability
- Include unsubscribe link (legal requirement)
```

### Distilled Tests (Gherkin)

```gherkin
@US-456
Feature: Order Confirmation Email

  Background:
    Given the email service is configured

  @AC-1
  Scenario: Email sent on successful order
    Given I am logged in as "customer@example.com"
    And I have items in my cart
    When I complete checkout with valid payment
    Then I should receive an email at "customer@example.com"
    And the email should be received within 5 minutes
    And the email should contain my order number

  @AC-2
  Scenario: Email contains complete order details
    Given I have completed an order with:
      | item       | quantity | price |
      | Widget A   | 2        | $10   |
      | Widget B   | 1        | $25   |
    And my shipping address is "123 Main St, City, 12345"
    When I receive the confirmation email
    Then it should contain the order number
    And it should list all items and quantities
    And it should show total "$45"
    And it should show my shipping address
    And it should show estimated delivery date

  @AC-3
  Scenario: Guest checkout receives email
    Given I am not logged in
    And I complete checkout as guest with email "guest@example.com"
    When my order is confirmed
    Then I should receive confirmation at "guest@example.com"
    And the email should include a tracking link
```

---

## Related Resources

- [Acceptance Criteria Guide](./acceptance-criteria-guide.md)
- [ATDD Core Standard](../../../core/acceptance-test-driven-development.md)
- [BDD Workflow](../bdd-assistant/bdd-workflow.md)
- [TDD Workflow](../tdd-assistant/tdd-workflow.md)
