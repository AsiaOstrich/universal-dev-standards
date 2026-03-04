# Acceptance Criteria Writing Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

---

## Overview

Acceptance Criteria (AC) define the conditions that must be met for a user story to be considered complete. Well-written AC ensure shared understanding and enable automated testing.

---

## INVEST Criteria for User Stories

Before writing acceptance criteria, ensure the user story follows INVEST:

| Principle | Description | Questions to Ask |
|-----------|-------------|------------------|
| **I**ndependent | Can be developed without depending on other stories | "Does this require another story to be done first?" |
| **N**egotiable | Details can be discussed, not a contract | "Is the scope flexible?" |
| **V**aluable | Delivers value to the user or business | "Why does this matter?" |
| **E**stimable | Can be estimated by the team | "Do we understand what's needed?" |
| **S**mall | Small enough to fit in one sprint | "Can we complete this in < 1 week?" |
| **T**estable | Can be verified through testing | "How do we know it's done?" |

---

## Acceptance Criteria Format

### Given-When-Then (Recommended)

```markdown
### AC-1: [Criterion name]
**Given** [precondition / initial context]
**And** [additional precondition]
**When** [action / event]
**And** [additional action]
**Then** [expected outcome]
**And** [additional expected outcome]
**But** [exception to expected outcome]
```

### Example

```markdown
### AC-1: Successful login with valid credentials
**Given** I am on the login page
**And** I have a registered account
**When** I enter my email "user@example.com"
**And** I enter my password "correctpassword"
**And** I click the login button
**Then** I should be redirected to the dashboard
**And** I should see a welcome message with my name
```

---

## Complete User Story Template

```markdown
## User Story: [US-XXX] [Title]

**As a** [role/persona]
**I want** [feature/capability]
**So that** [benefit/value]

---

## Acceptance Criteria

### AC-1: [Happy path - main success scenario]
**Given** [precondition]
**When** [action]
**Then** [expected result]

### AC-2: [Alternative path]
**Given** [different precondition]
**When** [action]
**Then** [different expected result]

### AC-3: [Error handling]
**Given** [precondition]
**When** [invalid action]
**Then** [error handling / recovery]

### AC-4: [Edge case]
**Given** [edge condition]
**When** [action]
**Then** [appropriate behavior]

---

## Out of Scope
- [Feature explicitly not included]
- [Enhancement deferred to future]
- [Variation not covered]

---

## Technical Notes
- [Implementation constraint]
- [Dependency]
- [Performance requirement]
- [Security consideration]

---

## Open Questions
- [ ] [Question needing clarification]
- [ ] [Assumption to validate]

---

## Metadata
- **Priority**: [High/Medium/Low]
- **Estimate**: [Story points]
- **Sprint**: [Sprint number]
- **Related Spec**: [SPEC-XXX if applicable]
```

---

## Writing Good Acceptance Criteria

### DO's and DON'Ts

| DO | DON'T |
|----|-------|
| Write from user's perspective | Write from system's perspective |
| Use business language | Use technical jargon |
| Be specific and concrete | Be vague or abstract |
| Include measurable outcomes | Use subjective terms |
| Keep criteria independent | Create interdependencies |
| Cover happy path AND edge cases | Only cover happy path |

### Good vs Bad Examples

```markdown
# ❌ BAD: Vague and untestable
AC-1: User can easily reset password
AC-2: System sends email quickly
AC-3: Experience is user-friendly

# ✅ GOOD: Specific and testable
AC-1: Password reset request
Given I am on the login page
And I have a registered account with email "user@example.com"
When I click "Forgot Password"
And I enter my email "user@example.com"
Then I should see "Reset link sent to your email"
And I should receive an email within 5 minutes
And the email should contain a reset link valid for 24 hours

# ❌ BAD: Technical jargon
AC-1: POST /api/auth/reset returns 202
AC-2: Redis queue processes within SLA
AC-3: SendGrid webhook confirmed

# ✅ GOOD: Business language
AC-1: Reset email delivery
Given I have requested a password reset
When the system processes my request
Then I should receive an email within 5 minutes
And the email should come from "noreply@example.com"
```

---

## Categories of Acceptance Criteria

### 1. Happy Path

The main success scenario - what happens when everything works correctly.

```markdown
### AC-1: Successful checkout
Given I have items in my cart
And I have a valid payment method
When I complete the checkout process
Then my order should be confirmed
And I should receive a confirmation email
```

### 2. Error Handling

What happens when things go wrong.

```markdown
### AC-2: Payment declined
Given I have items in my cart
When I attempt checkout with an invalid card
Then I should see "Payment declined"
And my cart should still contain my items
And no order should be created
```

### 3. Edge Cases

Boundary conditions and unusual scenarios.

```markdown
### AC-3: Cart with maximum items
Given my cart has 100 items (maximum allowed)
When I try to add another item
Then I should see "Cart is full"
And the item should not be added
```

### 4. Authorization

Who can do what.

```markdown
### AC-4: Admin-only access
Given I am logged in as a regular user
When I try to access the admin panel
Then I should see "Access denied"
And I should be redirected to the home page
```

### 5. Validation

Data and input validation.

```markdown
### AC-5: Email format validation
Given I am on the registration form
When I enter an invalid email format "not-an-email"
Then I should see "Please enter a valid email address"
And the form should not be submitted
```

### 6. Performance (if applicable)

Non-functional requirements.

```markdown
### AC-6: Search response time
Given I am on the search page
When I search for "laptop"
Then results should appear within 2 seconds
And at least 10 results should be shown
```

---

## Acceptance Criteria Checklist

Before finalizing AC, verify:

```
Clarity
□ Can a new team member understand it?
□ Is it free of technical jargon?
□ Is it specific enough to implement?

Testability
□ Can it be automated?
□ Are outcomes measurable?
□ Is there a clear pass/fail criteria?

Completeness
□ Happy path covered?
□ Error scenarios covered?
□ Edge cases considered?
□ Security implications addressed?

Independence
□ Can it be tested in isolation?
□ No dependency on other AC?
□ No assumptions about test order?

Business Value
□ Does it deliver user value?
□ Can PO explain why it matters?
□ Is it aligned with business goals?
```

---

## AC Anti-Patterns

| Anti-Pattern | Example | Problem | Fix |
|--------------|---------|---------|-----|
| **Vague** | "System should be fast" | Not measurable | "Response time < 2 seconds" |
| **Technical** | "API returns 200 OK" | Business can't validate | "User sees success message" |
| **Compound** | "User can create, edit, and delete" | Too many behaviors | Split into separate AC |
| **Missing Given** | "When I click submit, order is created" | No context | Add Given clause |
| **Missing Then** | "Given I'm logged in, When I click logout" | No verification | Add Then clause |
| **Dependent** | "Given AC-1 passed..." | Not independent | Self-contained setup |

---

## Examples by Feature Type

### User Authentication

```markdown
## User Story: User Login

**As a** registered user
**I want** to log in to my account
**So that** I can access my personalized content

### AC-1: Successful login
Given I am on the login page
And I have a registered account with email "user@example.com"
When I enter my email "user@example.com"
And I enter my correct password
And I click the login button
Then I should be redirected to my dashboard
And I should see "Welcome back, [username]"

### AC-2: Failed login with wrong password
Given I am on the login page
When I enter my email "user@example.com"
And I enter an incorrect password
And I click the login button
Then I should see "Invalid email or password"
And I should remain on the login page
And the password field should be cleared

### AC-3: Account lockout
Given I have failed login 3 times
When I attempt to login again
Then I should see "Account temporarily locked"
And I should be offered a password reset option
And I should not be able to login for 15 minutes
```

### E-commerce Checkout

```markdown
## User Story: Apply Discount Code

**As a** customer
**I want** to apply a discount code to my order
**So that** I can save money on my purchase

### AC-1: Valid percentage discount
Given I have items in my cart totaling $100
When I apply discount code "SAVE10"
Then my total should be reduced to $90
And I should see "10% discount applied"

### AC-2: Valid fixed amount discount
Given I have items in my cart totaling $100
When I apply discount code "FLAT5"
Then my total should be reduced to $95
And I should see "$5 discount applied"

### AC-3: Expired discount code
Given I have items in my cart
When I apply discount code "EXPIRED2023"
Then I should see "This code has expired"
And my total should remain unchanged

### AC-4: Minimum purchase requirement
Given my cart total is $30
When I apply discount code "MIN50" (requires $50 minimum)
Then I should see "Minimum purchase of $50 required"
And my total should remain unchanged

### AC-5: One code per order
Given I have already applied code "SAVE10"
When I try to apply another code "SAVE20"
Then I should see "Only one discount code per order"
And my original discount should remain
```

---

## Mapping AC to Tests

### From AC to Gherkin

```markdown
### AC-1: Successful password reset
**Given** I have a registered account
**When** I request a password reset
**And** I click the link in the email
**And** I enter a new valid password
**Then** my password should be changed
**And** I should be able to login with the new password
```

Becomes:

```gherkin
@AC-1
Scenario: Successful password reset
  Given I have a registered account with email "user@example.com"
  When I request a password reset for "user@example.com"
  And I click the reset link from the email
  And I enter new password "NewSecureP@ss123"
  And I confirm the new password
  Then I should see "Password successfully changed"
  And I should be able to login with "NewSecureP@ss123"
```

### From AC to FitNesse

```
!|Password Reset|
|email|action|result|
|user@example.com|request reset|link sent|
|user@example.com|click expired link|error: expired|
|user@example.com|click valid link|reset form shown|
|user@example.com|submit new password|password changed|
```

---

## Related Resources

- [ATDD Workflow Guide](./atdd-workflow.md)
- [ATDD Core Standard](../../core/acceptance-test-driven-development.md)
- [Gherkin Guide](../bdd-assistant/gherkin-guide.md)
- [Requirement Assistant](../requirement-assistant/SKILL.md)
