# Acceptance Test-Driven Development (ATDD) Standards

**Version**: 1.1.0
**Last Updated**: 2026-01-25
**Applicability**: All projects adopting Acceptance Test-Driven Development

> **Language**: [English](../core/acceptance-test-driven-development.md) | [繁體中文](../locales/zh-TW/core/acceptance-test-driven-development.md)

---

## Purpose

This standard defines the principles, workflows, and best practices for Acceptance Test-Driven Development (ATDD), ensuring that acceptance criteria are collaboratively defined before development and that acceptance tests drive the implementation.

**Key Benefits**:
- Shared understanding of "done" before development starts
- Reduced rework through early requirement validation
- Executable acceptance criteria that verify business value
- Improved collaboration between business and technical teams
- Clear traceability from requirements to implementation

---

## Methodology Classification

> **Classification**: Traditional Development Methodology (2003-2006)

ATDD is part of the **traditional test-driven development family** that emphasizes collaborative acceptance. It is distinct from the **AI-era SDD (Spec-Driven Development)** methodology.

### Historical Context

| Methodology | Era | Origin | Focus |
|-------------|-----|--------|-------|
| **TDD** | 1999 | Kent Beck, XP | Tests drive code design |
| **BDD** | 2006 | Dan North | Behavior drives tests |
| **ATDD** | 2003-2006 | GOOS, Gojko Adzic | Acceptance drives development |
| **SDD** | 2025+ | Thoughtworks, Martin Fowler | Specs drive generation (AI-era) |

### ATDD's Role in Modern Development

ATDD is an **optional collaboration method** for defining acceptance criteria, not a required step in any development sequence. The "ATDD → BDD → TDD" sequence is a practical pattern but not a strict requirement.

```
┌──────────────────────────────────────────────────────────────┐
│                 ATDD as Optional Collaboration                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Traditional View (Overly Prescriptive):                    │
│   ATDD → SDD → BDD → TDD  ← Not supported by literature      │
│                                                              │
│   Actual Practice:                                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Input Sources (Any of these):                       │   │
│   │  ├─ ATDD Workshop (formal collaboration)             │   │
│   │  ├─ Requirements interviews                          │   │
│   │  ├─ PRD documents                                    │   │
│   │  └─ Stakeholder emails/discussions                   │   │
│   └──────────────────┬──────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Acceptance Criteria (Given-When-Then)               │   │
│   └──────────────────┬──────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│   BDD → TDD (Double-Loop)                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Relationship to SDD

In SDD workflows, ATDD workshops are **optional inputs** for defining acceptance criteria:

| Input Method | When to Use |
|--------------|-------------|
| **ATDD Workshop** | Complex features requiring stakeholder alignment |
| **Requirements Interview** | Most common, direct conversation with stakeholders |
| **PRD Review** | Formal product requirements exist |
| **Direct Definition** | Clear requirements, minimal ambiguity |

SDD does not require ATDD workshops; the spec itself becomes the source of acceptance criteria.

### Three Amigos (Core Value of ATDD)

The most valuable aspect of ATDD is the **Three Amigos** collaboration pattern:

| Role | Contribution | Question |
|------|--------------|----------|
| **Customer/PO** | Business requirements, priority | "What problem are we solving?" |
| **Developer** | Technical feasibility, design | "How do we build it?" |
| **Tester** | Edge cases, verification | "What could go wrong?" |

> **Recommendation**: Adopt the Three Amigos pattern even if you don't use formal ATDD workshops.

**Reference**: [Spec-Driven Development Standards](spec-driven-development.md)

---

## Table of Contents

1. [ATDD Core Concepts](#atdd-core-concepts)
2. [ATDD Workflow](#atdd-workflow)
3. [Specification Workshop](#specification-workshop)
4. [Acceptance Criteria Writing Guide](#acceptance-criteria-writing-guide)
5. [Distillation Process](#distillation-process)
6. [Role Responsibilities](#role-responsibilities)
7. [ATDD vs BDD vs TDD](#atdd-vs-bdd-vs-tdd)
8. [Integration with SDD, BDD, and TDD](#integration-with-sdd-bdd-and-tdd)
9. [Anti-Patterns and Remediation](#anti-patterns-and-remediation)
10. [Tooling](#tooling)
11. [Metrics and Assessment](#metrics-and-assessment)
12. [Related Standards](#related-standards)
13. [References](#references)
14. [Version History](#version-history)
15. [License](#license)

---

## ATDD Core Concepts

### What is ATDD?

ATDD is a collaborative practice where the whole team (business, development, and testing) defines acceptance criteria in the form of acceptance tests before development begins. The acceptance tests then drive the development process.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ATDD Core Principles                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DEFINE DONE UPFRONT                                                     │
│     Acceptance criteria are defined before coding starts                    │
│                                                                             │
│  2. WHOLE TEAM COLLABORATION                                                │
│     Business, developers, and testers work together                         │
│                                                                             │
│  3. EXECUTABLE SPECIFICATIONS                                               │
│     Acceptance criteria become automated tests                              │
│                                                                             │
│  4. BUSINESS-FACING TESTS                                                   │
│     Tests verify business value, not technical details                      │
│                                                                             │
│  5. SINGLE SOURCE OF TRUTH                                                  │
│     Tests are the authoritative definition of requirements                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ATDD vs Traditional Requirements

| Aspect | Traditional | ATDD |
|--------|-------------|------|
| **Requirements** | Document-based, prose | Executable tests |
| **Validation** | Manual review | Automated execution |
| **Ambiguity** | Discovered during development | Resolved before development |
| **Definition of Done** | Vague | Clear, testable criteria |
| **Feedback Cycle** | End of sprint/release | Immediate (test execution) |

---

## ATDD Workflow

### The ATDD Cycle

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
│   🤝 SPECIFICATION WORKSHOP (30-60 min)                                     │
│   ├─ PO presents user story                                                │
│   ├─ Team asks clarifying questions                                        │
│   ├─ Define acceptance criteria together                                   │
│   └─ Identify edge cases and out-of-scope items                            │
│                                                                             │
│   🧪 DISTILLATION (30-60 min)                                               │
│   ├─ Convert AC to executable test format                                  │
│   ├─ Remove ambiguity                                                      │
│   ├─ Get PO sign-off on tests                                              │
│   └─ Verify tests are automatable                                          │
│                                                                             │
│   💻 DEVELOPMENT (Variable)                                                 │
│   ├─ Run acceptance tests (they should FAIL initially)                     │
│   ├─ Use BDD for feature-level behavior                                    │
│   ├─ Use TDD for unit-level implementation                                 │
│   └─ Iterate until all acceptance tests PASS                               │
│                                                                             │
│   🎬 DEMO (15-30 min)                                                       │
│   ├─ Show passing acceptance tests                                         │
│   ├─ Demonstrate working functionality                                     │
│   └─ Get formal PO acceptance                                              │
│                                                                             │
│   ✅ DONE                                                                   │
│   ├─ All acceptance tests pass                                             │
│   ├─ PO accepts the story                                                  │
│   └─ Code merged and deployed                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase Details

| Phase | Participants | Duration | Outputs |
|-------|-------------|----------|---------|
| **Workshop** | PO, Dev, QA | 30-60 min | User story + AC + Out of scope |
| **Distillation** | Dev, QA | 30-60 min | Executable acceptance tests |
| **Development** | Dev | Variable | Feature implementation |
| **Demo** | PO, Dev, QA | 15-30 min | PO sign-off |
| **Done** | Team | - | Merged code |

---

## Specification Workshop

### Purpose

The Specification Workshop is a collaborative session where the team defines what "done" looks like for a user story through concrete acceptance criteria.

### Workshop Format

```
┌─────────────────────────────────────────────────────────────────┐
│              Specification Workshop Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. STORY PRESENTATION (5 min)                                  │
│     │                                                           │
│     └─▶ PO explains the user story and business value           │
│                                                                 │
│  2. CLARIFYING QUESTIONS (10 min)                               │
│     │                                                           │
│     ├─▶ Dev: "What systems are affected?"                       │
│     ├─▶ QA: "What could go wrong?"                              │
│     └─▶ All: "What are the edge cases?"                         │
│                                                                 │
│  3. ACCEPTANCE CRITERIA DEFINITION (20 min)                     │
│     │                                                           │
│     ├─▶ Define happy path criteria                              │
│     ├─▶ Define error/edge case criteria                         │
│     └─▶ Write in Given-When-Then format                         │
│                                                                 │
│  4. OUT OF SCOPE DEFINITION (10 min)                            │
│     │                                                           │
│     └─▶ Explicitly list what is NOT included                    │
│                                                                 │
│  5. TECHNICAL NOTES (5 min)                                     │
│     │                                                           │
│     └─▶ Dev adds implementation hints, constraints              │
│                                                                 │
│  6. WRAP-UP (5 min)                                             │
│     │                                                           │
│     ├─▶ Review all AC                                           │
│     ├─▶ Confirm PO understanding                                │
│     └─▶ Schedule distillation session                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Workshop Questions

| Perspective | Questions to Ask |
|-------------|------------------|
| **Business** | What's the business value? Who are the users? What problem does it solve? |
| **Development** | What's the technical impact? Are there dependencies? Performance concerns? |
| **Testing** | What could go wrong? What are edge cases? How do we verify success? |
| **All** | What's explicitly out of scope? Are there any assumptions? |

---

## Acceptance Criteria Writing Guide

### INVEST Criteria for User Stories

Before writing acceptance criteria, ensure the user story follows INVEST:

| Principle | Description | Check |
|-----------|-------------|-------|
| **I**ndependent | Can be developed independently | No blocking dependencies |
| **N**egotiable | Details can be discussed | Not a contract |
| **V**aluable | Delivers business value | PO can explain the "why" |
| **E**stimable | Can be estimated | Team understands scope |
| **S**mall | Fits in one sprint | < 1 week of work |
| **T**estable | Can be verified | Clear acceptance criteria |

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
**And** [additional precondition]
**When** [action]
**Then** [expected result]
**And** [additional expected result]

## Out of Scope
- [Things explicitly not included]
- [Future enhancements]

## Technical Notes
- [Implementation hints]
- [Known constraints]
- [Dependencies]
```

### Acceptance Criteria Examples

#### Good Example

```markdown
## User Story: Password Reset

**As a** registered user
**I want** to reset my password via email
**So that** I can regain access to my account if I forget my password

## Acceptance Criteria

### AC-1: Request password reset
**Given** I am on the login page
**And** I have a registered account with email "user@example.com"
**When** I click "Forgot Password"
**And** I enter my email "user@example.com"
**Then** I should see a message "Reset link sent to your email"
**And** I should receive an email with a reset link within 5 minutes

### AC-2: Reset link expires
**Given** I have requested a password reset
**When** I click the reset link after 24 hours
**Then** I should see an error "This link has expired"
**And** I should be offered to request a new reset link

### AC-3: Successful password reset
**Given** I have a valid password reset link
**When** I enter a new password meeting the password policy
**And** I confirm the new password
**Then** my password should be updated
**And** I should be able to login with the new password
**And** the reset link should be invalidated

### AC-4: Invalid email handling
**Given** I am on the password reset page
**When** I enter an unregistered email
**Then** I should see the same message "Reset link sent to your email"
**But** no email should be sent (for security)

## Out of Scope
- Password reset via SMS
- Security questions
- Admin password reset capability

## Technical Notes
- Reset token should be cryptographically secure (UUID v4 or similar)
- Token should be single-use
- Consider rate limiting (max 3 requests per hour per email)
```

#### Anti-Pattern Examples

```markdown
# ❌ BAD: Vague criteria
AC-1: User can reset password
AC-2: System sends email
AC-3: Password is updated

# ❌ BAD: Technical jargon
AC-1: When POST /api/v1/password-reset with valid email,
      return 202 and create PasswordResetToken in database

# ❌ BAD: Not testable
AC-1: The password reset experience should be user-friendly
AC-2: The system should be secure
```

---

## Distillation Process

### Purpose

Convert the acceptance criteria from the workshop into executable, automatable tests.

### Distillation Steps

```
┌─────────────────────────────────────────────────────────────────┐
│              Distillation Process                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REVIEW ACCEPTANCE CRITERIA                                  │
│     ├─ For each AC, check:                                      │
│     │   □ Is it unambiguous?                                    │
│     │   □ Can it be automated?                                  │
│     │   □ Does it verify business value?                        │
│     └─ Refine any unclear criteria                              │
│                                                                 │
│  2. CHOOSE TEST FORMAT                                          │
│     │                                                           │
│     ├─ Gherkin (Given-When-Then) → Cucumber, SpecFlow           │
│     ├─ FitNesse tables → FitNesse, Slim                         │
│     ├─ Robot Framework → Keyword-driven                         │
│     └─ Custom code → xUnit with descriptive names               │
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
│     └─ All tests should fail initially (RED state)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Test Format Options

| Format | Tool | Best For | Business Readable |
|--------|------|----------|-------------------|
| **Gherkin** | Cucumber, Behave, SpecFlow | Behavior-focused scenarios | ★★★★★ |
| **Wiki Tables** | FitNesse | Data-driven tests | ★★★★☆ |
| **Keywords** | Robot Framework | Complex workflows | ★★★★☆ |
| **Code** | xUnit, pytest | Technical teams | ★★☆☆☆ |

---

## Role Responsibilities

### RACI Matrix for ATDD

| Activity | Product Owner | Developer | QA/Tester |
|----------|--------------|-----------|-----------|
| Define user story | **R/A** | C | C |
| Specification workshop | **R** | C | C |
| Define acceptance criteria | **A** | R | R |
| Write executable tests | C | R | **R/A** |
| Implement feature | C | **R/A** | C |
| Execute acceptance tests | I | R | **R/A** |
| Accept/reject feature | **R/A** | I | I |

**Legend**: R = Responsible, A = Accountable, C = Consulted, I = Informed

### Role-Specific Guidelines

#### Product Owner

| Responsibility | Description |
|----------------|-------------|
| **Story Ownership** | Ensure story has clear business value |
| **AC Validation** | Validate that AC capture requirements |
| **Sign-off** | Formally accept completed features |
| **Availability** | Be available for clarification questions |

#### Developer

| Responsibility | Description |
|----------------|-------------|
| **Technical Input** | Raise technical concerns early |
| **Test Implementation** | Help make tests automatable |
| **Feature Development** | Implement to pass acceptance tests |
| **Integration** | Ensure proper integration with existing systems |

#### QA/Tester

| Responsibility | Description |
|----------------|-------------|
| **Edge Cases** | Identify edge cases and error scenarios |
| **Test Authoring** | Lead executable test creation |
| **Test Automation** | Automate acceptance tests |
| **Quality Advocacy** | Ensure testability of requirements |

---

## ATDD vs BDD vs TDD

### Comparison Matrix

| Aspect | ATDD | BDD | TDD |
|--------|------|-----|-----|
| **Focus** | Acceptance criteria | Behavior specification | Code units |
| **Primary Artifact** | Acceptance tests | Feature files | Unit tests |
| **Language** | Business language | Gherkin (natural language) | Programming code |
| **When** | Before sprint starts | Before coding | During coding |
| **Participants** | Whole team + stakeholders | Three Amigos | Developers |
| **Test Level** | System/Acceptance | Feature/Integration | Unit/Component |
| **Main Question** | "What does done look like?" | "How should it behave?" | "Does it work correctly?" |

### How They Work Together

> **Important**: ATDD, BDD, and TDD are traditional methodologies (1999-2011). SDD (2025) is a separate AI-era methodology that can integrate with them but is not part of their sequence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Traditional Double-Loop TDD Pattern                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │  Optional Input: ATDD Workshop                               │          │
│   │  (or interviews, PRDs, stakeholder discussions)              │          │
│   └──────────────────────┬──────────────────────────────────────┘           │
│                          │                                                  │
│                          ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │  Acceptance Criteria (Given-When-Then)                       │          │
│   │  AC-1: Valid checkout creates order                          │          │
│   │  AC-2: Invalid payment shows error                           │          │
│   │  AC-3: Minimum order enforced                                │          │
│   └──────────────────────┬──────────────────────────────────────┘           │
│                          │                                                  │
│                          ▼                                                  │
│   ╔═════════════════════════════════════════════════════════════╗           │
│   ║  Double-Loop TDD (GOOS Pattern)                              ║          │
│   ╠═════════════════════════════════════════════════════════════╣           │
│   ║                                                              ║          │
│   ║  BDD (Outer Loop) - Feature/Behavior                         ║          │
│   ║  ┌────────────────────────────────────────────────────────┐ ║          │
│   ║  │  Feature: Shopping Cart Checkout                        │ ║          │
│   ║  │    Scenario: Successful checkout                        │ ║          │
│   ║  │      Given items in cart                                │ ║          │
│   ║  │      When I checkout with valid payment                 │ ║          │
│   ║  │      Then order is created                              │ ║          │
│   ║  └───────────────────────┬────────────────────────────────┘ ║          │
│   ║                          │                                   ║          │
│   ║                          ▼                                   ║          │
│   ║  TDD (Inner Loop) - Unit/Component                           ║          │
│   ║  ┌────────────────────────────────────────────────────────┐ ║          │
│   ║  │  test_calculate_order_total()                           │ ║          │
│   ║  │  test_validate_payment_info()                           │ ║          │
│   ║  │  test_create_order_record()                             │ ║          │
│   ║  └────────────────────────────────────────────────────────┘ ║          │
│   ║                                                              ║          │
│   ╚═════════════════════════════════════════════════════════════╝           │
│                                                                             │
│   Flow: (ATDD optional) → AC → BDD → TDD                                    │
│                                                                             │
│   Note: SDD (2025) is a separate methodology. See Integration section.      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Choosing the Right Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                    Decision Tree                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Does the feature need formal stakeholder acceptance?          │
│   │                                                             │
│   ├─ Yes → ATDD (define acceptance criteria with PO)            │
│   │        │                                                    │
│   │        └─▶ Does it have complex behavior?                   │
│   │            │                                                │
│   │            ├─ Yes → BDD (write Gherkin scenarios)           │
│   │            │        │                                       │
│   │            │        └─▶ TDD (implement step definitions)    │
│   │            │                                                │
│   │            └─ No → TDD (implement directly)                 │
│   │                                                             │
│   └─ No → Is it user-facing behavior?                           │
│           │                                                     │
│           ├─ Yes → BDD → TDD                                    │
│           │                                                     │
│           └─ No → TDD only (technical implementation)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration with SDD, BDD, and TDD

### Understanding the Two Approaches

There are two distinct development approaches:

| Approach | Era | Core Concept | Use Case |
|----------|-----|--------------|----------|
| **Traditional (ATDD + BDD + TDD)** | 1999-2011 | Tests drive design | Manual development, legacy systems |
| **AI-Era (SDD)** | 2025+ | Specs drive generation | AI-assisted development |

### Traditional ATDD + BDD + TDD Workflow

This workflow applies when using ATDD as the collaboration method:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Traditional ATDD + BDD + TDD Workflow                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════╗                                                      │
│  ║  ATDD Phase       ║  Optional Collaboration                              │
│  ║  (Stakeholders)   ║                                                      │
│  ╠═══════════════════╣                                                      │
│  ║ 1. Spec Workshop  ║  PO presents user story                              │
│  ║ 2. Distillation   ║  Define acceptance criteria                          │
│  ╚═════════╤═════════╝                                                      │
│            │ Output: User Story + AC + Out of Scope                         │
│            ▼                                                                │
│  ╔═══════════════════╗                                                      │
│  ║  BDD Phase        ║  Behavior Specification                              │
│  ║  (Three Amigos)   ║                                                      │
│  ╠═══════════════════╣                                                      │
│  ║ 3. Discovery      ║  Identify scenarios from AC                          │
│  ║ 4. Formulation    ║  Write Gherkin scenarios                             │
│  ╚═════════╤═════════╝                                                      │
│            │ Output: Feature files (Given-When-Then)                        │
│            ▼                                                                │
│  ╔═══════════════════╗                                                      │
│  ║  TDD Phase        ║  Implementation                                      │
│  ║  (Developers)     ║                                                      │
│  ╠═══════════════════╣                                                      │
│  ║ 5. RED            ║  Write failing tests                                 │
│  ║ 6. GREEN          ║  Minimal implementation                              │
│  ║ 7. REFACTOR       ║  Clean up code                                       │
│  ╚═════════╤═════════╝                                                      │
│            │ Repeat until all BDD scenarios pass                            │
│            ▼                                                                │
│  ╔═══════════════════╗                                                      │
│  ║  Acceptance       ║  Demo and Sign-off                                   │
│  ╠═══════════════════╣                                                      │
│  ║ 8. Demo           ║  Demo to stakeholders                                │
│  ║ 9. Sign-off       ║  PO accepts feature                                  │
│  ╚═══════════════════╝                                                      │
│                                                                             │
│   Flow: (ATDD optional) → BDD → TDD → Acceptance                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SDD + ATDD Integration (AI-Era)

When using SDD as the primary methodology, ATDD can be an optional input:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SDD Workflow (with optional ATDD)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────┐             │
│   │  Input Sources (choose any):                              │             │
│   │  ├─ ATDD Workshop (formal collaboration)                  │             │
│   │  ├─ Requirements interviews                               │             │
│   │  ├─ PRD documents                                         │             │
│   │  └─ Stakeholder discussions                               │             │
│   └───────────────────────┬──────────────────────────────────┘             │
│                           │                                                 │
│                           ▼                                                 │
│   ╔═══════════════════════════════════════════════════════════╗            │
│   ║  SDD Workflow                                              ║            │
│   ╠═══════════════════════════════════════════════════════════╣            │
│   ║ 1. Proposal     → SPEC-XXX.md (with AC)                    ║            │
│   ║ 2. Review       → Stakeholder approval                     ║            │
│   ║ 3. Derivation   → /derive-all generates tests              ║            │
│   ║ 4. Implementation (TDD optional)                           ║            │
│   ║ 5. Verification → All tests pass                           ║            │
│   ║ 6. Archive      → Close spec                               ║            │
│   ╚═══════════════════════════════════════════════════════════╝            │
│                                                                             │
│   Key: SDD is independent; ATDD is an optional input method                 │
│   Reference: spec-driven-development.md                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase Transition Rules (Traditional ATDD + BDD + TDD)

| From | To | Entry Criteria | Required Artifacts |
|------|-----|---------------|-------------------|
| (Start) | ATDD Workshop | New feature request | User story title |
| ATDD Workshop | BDD | AC defined, PO sign-off | User Story + AC + Out of Scope |
| BDD | TDD | Scenarios formulated | Feature files (Given-When-Then) |
| TDD | Acceptance | All scenarios pass | Passing test suite |
| Acceptance | Done | PO accepts | Demo complete, code merged |

> **Note**: For SDD workflow phase transitions, see [Spec-Driven Development](spec-driven-development.md).

---

## Anti-Patterns and Remediation

### Common Anti-Patterns

| Anti-Pattern | Symptom | Impact | Solution |
|--------------|---------|--------|----------|
| **No Workshop** | AC written by one person | Gaps in requirements | Mandate whole-team workshops |
| **Vague AC** | "System should be user-friendly" | Untestable criteria | Use Given-When-Then format |
| **Technical AC** | "Database should be normalized" | Business can't validate | Write in business language |
| **AC After Dev** | Tests written after coding | Lose ATDD benefits | Enforce distillation before dev |
| **PO Absent** | PO not in workshop | Wrong assumptions | Require PO attendance |
| **No Sign-off** | Skip formal acceptance | Unclear completion | Mandate demo + sign-off |
| **Scope Creep** | New AC during dev | Schedule overrun | Strict out-of-scope discipline |

### Diagnosis and Remediation

```
┌─────────────────────────────────────────────────────────────────┐
│           ATDD Anti-Pattern Diagnosis                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Symptom: Features marked "done" but PO rejects                 │
│  ├─ Likely cause: AC not validated with PO                      │
│  └─ Fix: Mandatory PO sign-off on AC before development         │
│                                                                 │
│  Symptom: Long development with no clear progress               │
│  ├─ Likely cause: AC too large or vague                         │
│  └─ Fix: Break into smaller, more specific criteria             │
│                                                                 │
│  Symptom: Acceptance tests always pass first time               │
│  ├─ Likely cause: Tests written after implementation            │
│  └─ Fix: Ensure tests fail initially (distillation before dev)  │
│                                                                 │
│  Symptom: Endless scope discussions during development          │
│  ├─ Likely cause: No clear "out of scope" definition            │
│  └─ Fix: Explicitly document out-of-scope items in workshop     │
│                                                                 │
│  Symptom: AC can't be automated                                 │
│  ├─ Likely cause: QA/Dev not involved in AC definition          │
│  └─ Fix: Include technical perspective in specification workshop│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tooling

### ATDD Tools by Purpose

| Purpose | Tools |
|---------|-------|
| **Acceptance Test Execution** | FitNesse, Concordion, Robot Framework |
| **BDD Integration** | Cucumber, SpecFlow, Behave |
| **Test Management** | Azure DevOps, Jira + Xray, TestRail |
| **Living Documentation** | Pickles, LivingDoc, Serenity BDD |

### Tool Selection Guidelines

| Consideration | Recommendation |
|---------------|----------------|
| **Business Readability** | FitNesse (wiki tables) or Cucumber (Gherkin) |
| **Technical Team** | Code-based xUnit with descriptive names |
| **Mixed Team** | Cucumber for balance of readability and automation |
| **Enterprise** | Tools with good reporting (Serenity, Azure DevOps) |

---

## Metrics and Assessment

### ATDD Maturity Model

| Level | Name | Characteristics |
|-------|------|-----------------|
| **Level 0** | No ATDD | Acceptance criteria written by one person after development |
| **Level 1** | Workshop-Initiated | Workshops held but AC not always executable |
| **Level 2** | Executable AC | All AC converted to automated tests |
| **Level 3** | PO-Driven | PO actively participates, signs off on all tests |
| **Level 4** | Full Integration | ATDD integrated with BDD/TDD, living documentation |

### Key Metrics

| Metric | Target | Warning |
|--------|--------|---------|
| **Workshop Attendance** | 100% (PO, Dev, QA) | < 100% |
| **PO Sign-off Rate** | 100% before dev starts | Any development without sign-off |
| **AC to Test Conversion** | 100% | < 90% |
| **First-Time Acceptance** | > 80% | < 60% |
| **Acceptance Test Execution Time** | < 30 min | > 1 hour |

### Assessment Checklist

```
Team ATDD Assessment:

□ Specification workshops held for all stories
□ PO, Developer, and QA all attend workshops
□ Acceptance criteria in Given-When-Then format
□ Out-of-scope explicitly documented
□ PO signs off on AC before development
□ AC converted to executable tests
□ Acceptance tests fail initially (before implementation)
□ Demo held for every completed story
□ PO formally accepts or rejects at demo
□ Living documentation generated
```

---

## Related Standards

- [Behavior-Driven Development](behavior-driven-development.md) - BDD standards
- [Test-Driven Development](test-driven-development.md) - TDD workflow
- [Spec-Driven Development](spec-driven-development.md) - SDD workflow
- [Testing Standards](testing-standards.md) - Core testing standards
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 8 dimensions framework
- [Code Check-in Standards](checkin-standards.md) - Check-in requirements

---

## References

### Books

- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009) - Foundational ATDD/BDD patterns
- Elisabeth Hendrickson - "Explore It!: Reduce Risk and Increase Confidence with Exploratory Testing" (2013)
- Gojko Adzic - "Specification by Example" (2011)
- Gojko Adzic - "Bridging the Communication Gap" (2009)
- Lisa Crispin & Janet Gregory - "Agile Testing" (2008)
- Ken Pugh - "Lean-Agile Acceptance Test-Driven Development" (2011)

### Online Resources

- [ATDD Overview - Agile Alliance](https://www.agilealliance.org/glossary/atdd/)
- [Specification by Example - Gojko Adzic](https://gojko.net/books/specification-by-example/)
- [Specification by Example: 10 Years Later - Gojko Adzic](https://gojko.net/2020/03/17/sbe-10-years.html) - Retrospective on SbE practices
- [AccelQ: ATDD Complete Guide](https://www.accelq.com/blog/acceptance-test-driven-development/) - Comprehensive ATDD overview
- [FitNesse Documentation](http://fitnesse.org/)
- [Robot Framework](https://robotframework.org/)

### Standards

- [IEEE 29119 - Software Testing Standards](https://www.iso.org/standard/81291.html)
- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-25 | Added: Methodology Classification section (Traditional Development Methodology designation, ATDD as optional collaboration, relationship to SDD) |
| 1.0.0 | 2026-01-19 | Initial ATDD standard definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
