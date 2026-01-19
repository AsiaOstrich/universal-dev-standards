# Integrated Development Flow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

---

## Overview

The Integrated Development Flow combines four development methodologies into a cohesive workflow:

```
ATDD → SDD → BDD → TDD → Verification
```

This approach ensures:
- **Business alignment** through ATDD specification workshops
- **Technical clarity** through SDD specifications
- **Behavior coverage** through BDD scenarios
- **Code quality** through TDD cycles
- **Formal acceptance** through demos

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Integrated Development Flow                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🤝 ATDD: SPECIFICATION WORKSHOP                                        │
│  ├─ PO presents user story                                              │
│  ├─ Team defines acceptance criteria (Given-When-Then)                  │
│  └─ Output: User Story + AC + Out of Scope                              │
│       │                                                                 │
│       ▼                                                                 │
│  📝 SDD: SPEC PROPOSAL                                                  │
│  ├─ Write technical specification                                       │
│  ├─ Link to acceptance criteria                                         │
│  └─ Output: SPEC-XXX document                                           │
│       │                                                                 │
│       ▼                                                                 │
│  🔍 SDD: SPEC REVIEW                                                    │
│  ├─ Technical review by stakeholders                                    │
│  └─ Output: Approved specification                                      │
│       │                                                                 │
│       ▼                                                                 │
│  🔎 BDD: DISCOVERY                                                      │
│  ├─ Three Amigos session                                                │
│  ├─ Example Mapping                                                     │
│  └─ Output: Identified scenarios                                        │
│       │                                                                 │
│       ▼                                                                 │
│  📄 BDD: FORMULATION                                                    │
│  ├─ Write Gherkin scenarios                                             │
│  ├─ PO reviews for correctness                                          │
│  └─ Output: Feature files (.feature)                                    │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────────────────────────────────────┐                            │
│  │         TDD: RED-GREEN-REFACTOR          │                           │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐ │                           │
│  │  │ 🔴 RED   │──▶│ 🟢 GREEN│──▶│ 🔵 REFAC│ │                           │
│  │  └─────────┘   └─────────┘   └────┬────┘ │                           │
│  │       ▲                           │      │                           │
│  │       └───────────────────────────┘      │                           │
│  │              (more tests needed)         │                           │
│  └───────────────────┬─────────────────────┘                            │
│                      │ (all BDD scenarios pass)                         │
│                      ▼                                                  │
│  🎬 DEMO & ACCEPTANCE                                                   │
│  ├─ Run acceptance tests live                                           │
│  ├─ Demonstrate functionality                                           │
│  └─ PO accepts or requests refinement                                   │
│       │                                                                 │
│       ▼                                                                 │
│  ✅ ARCHIVE & COMPLETE                                                  │
│  ├─ Archive spec with links                                             │
│  ├─ Close user story                                                    │
│  └─ Merge code to main                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Details

### Phase 1: Specification Workshop (ATDD) 🤝

**Purpose**: Define WHAT we're building with stakeholders.

**Participants**: Product Owner, Developer, QA

**Output**: User Story with Acceptance Criteria

```markdown
## User Story: User Login

**As a** registered user
**I want** to log into my account
**So that** I can access personalized content

## Acceptance Criteria

### AC-1: Successful login
**Given** I am on the login page
**And** I have a registered account
**When** I enter valid credentials
**Then** I should be redirected to dashboard

### AC-2: Failed login
**Given** I am on the login page
**When** I enter invalid credentials
**Then** I should see error message

## Out of Scope
- Social login (OAuth)
- Remember me functionality
```

---

### Phase 2-3: Spec Proposal & Review (SDD) 📝🔍

**Purpose**: Document HOW we'll build it technically.

**Output**: Approved SPEC-XXX document

```markdown
# SPEC-001: User Authentication

## Summary
Implement user login with email/password.

## References
- User Story: US-001
- Acceptance Criteria: AC-1, AC-2

## Detailed Design
- Use JWT tokens for session management
- Password hashing with bcrypt
- Rate limiting: 5 attempts per minute

## Dependencies
- Database: users table
- JWT library
```

---

### Phase 4-5: Discovery & Formulation (BDD) 🔎📄

**Purpose**: Convert requirements to executable scenarios.

**Output**: Gherkin feature files

```gherkin
Feature: User Authentication

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter email "user@example.com"
    And I enter password "correctpassword"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see welcome message "Hello, User"

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter email "user@example.com"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see error "Invalid credentials"
    And I should remain on the login page
```

---

### Phase 6-8: Red-Green-Refactor (TDD) 🔴🟢🔵

**Purpose**: Implement code driven by tests.

**Cycle**:

1. **RED**: Write failing test
   ```typescript
   test('should hash password with bcrypt', async () => {
     const hash = await hashPassword('password123');
     expect(hash).not.toBe('password123');
     expect(hash.startsWith('$2b$')).toBe(true);
   });
   ```

2. **GREEN**: Write minimum code to pass
   ```typescript
   async function hashPassword(password: string): Promise<string> {
     return bcrypt.hash(password, 10);
   }
   ```

3. **REFACTOR**: Improve code quality
   ```typescript
   const SALT_ROUNDS = 10;

   async function hashPassword(password: string): Promise<string> {
     return bcrypt.hash(password, SALT_ROUNDS);
   }
   ```

4. Repeat until all BDD scenarios pass

---

### Phase 9: Demo & Acceptance 🎬

**Purpose**: Get formal acceptance from Product Owner.

**Structure**:
1. **Context** (1 min): Remind story and AC
2. **Tests** (2 min): Run tests live
3. **Feature** (5-10 min): Walk through each AC
4. **Feedback** (5 min): Q&A

**Outcomes**:
- ✅ Accepted → Proceed to Archive
- 🔄 Refinement needed → Return to Workshop

---

### Phase 10: Archive & Complete ✅

**Purpose**: Close out the feature properly.

**Checklist**:
- [ ] Archive spec with PR/commit links
- [ ] Close user story
- [ ] Merge code to main branch
- [ ] Update documentation if needed

---

## When to Use Integrated Flow

| Scenario | Recommendation |
|----------|----------------|
| **Enterprise features** | ✅ Recommended - Full traceability |
| **Complex business logic** | ✅ Recommended - Shared understanding |
| **Cross-team collaboration** | ✅ Recommended - Clear handoffs |
| **Small bug fixes** | ❌ Overkill - Use TDD only |
| **Exploratory prototypes** | ❌ Too rigid - Skip formal phases |
| **Simple CRUD operations** | ⚠️ Optional - Consider lighter flow |

---

## Phase Transition Rules

| From | To | Entry Condition |
|------|-----|-----------------|
| (Start) | Specification Workshop | New feature request |
| Specification Workshop | Spec Proposal | AC defined, PO present |
| Spec Proposal | Spec Review | Spec submitted |
| Spec Review | Discovery | Spec approved |
| Discovery | Formulation | Scenarios identified |
| Formulation | TDD Red | Gherkin written, PO reviewed |
| TDD Red | TDD Green | Test fails |
| TDD Green | TDD Refactor | Test passes |
| TDD Refactor | TDD Red | More tests needed |
| TDD Refactor | Demo | All BDD scenarios pass |
| Demo | Archive | PO accepts |
| Demo | Specification Workshop | Refinement needed |

---

## Artifacts Produced

| Phase | Artifact | Format |
|-------|----------|--------|
| Specification Workshop | User Story | Markdown |
| Spec Proposal | SPEC-XXX | Markdown |
| Discovery | Example Map | Notes/Cards |
| Formulation | Feature Files | Gherkin (.feature) |
| TDD | Unit Tests | Code |
| Archive | Archived Spec | Markdown with links |

---

## Commands

| Command | Description |
|---------|-------------|
| `/integrated-flow` | Start integrated workflow |
| `/flow-status` | Show current phase |
| `/flow-skip [phase]` | Skip to specific phase (advanced) |

---

## Related Standards

- [Acceptance Test-Driven Development](../../../core/acceptance-test-driven-development.md)
- [Spec-Driven Development](../../../core/spec-driven-development.md)
- [Behavior-Driven Development](../../../core/behavior-driven-development.md)
- [Test-Driven Development](../../../core/test-driven-development.md)
- [ATDD Assistant](../atdd-assistant/SKILL.md)
- [BDD Assistant](../bdd-assistant/SKILL.md)
- [TDD Assistant](../tdd-assistant/SKILL.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
