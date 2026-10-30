# Integrated Development Flow Guide

**Version**: 2.0.0
**Last Updated**: 2026-01-25

---

## Overview

The Integrated Development Flow provides **two independent methodology systems** for different development contexts:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  Two Independent Methodology Systems                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  System A: SDD (AI-Era Methodology)                                        │
│  ─────────────────────────────────────                                     │
│  Best for: New projects, AI-assisted development, greenfield features     │
│                                                                            │
│  System B: Double-Loop TDD (Traditional)                                   │
│  ─────────────────────────────────────                                     │
│  Best for: Legacy systems, manual development, established codebases      │
│                                                                            │
│  Note: ATDD is an OPTIONAL input method for either system,                 │
│        NOT a sequential step in the workflow.                              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

This approach ensures:
- **Methodology choice** based on project context and team needs
- **Optional stakeholder collaboration** through ATDD workshops
- **Technical clarity** through SDD specifications (System A)
- **Behavior coverage** through BDD scenarios (System B outer loop)
- **Code quality** through TDD cycles (both systems)
- **Formal acceptance** through demos

---

## Methodology Selection Guide

Choose your development approach based on project context:

| Context | Recommended System | Rationale |
|---------|-------------------|-----------|
| **New project with AI assistance** | System A: SDD | AI-native workflow, spec-first approach |
| **Greenfield feature development** | System A: SDD | Clear requirements, forward derivation |
| **Legacy system modification** | System B: Double-Loop TDD | Tests protect existing behavior |
| **Complex business logic** | System B: Double-Loop TDD | BDD ensures shared understanding |
| **API-first development** | System A: SDD | Spec defines contract clearly |
| **Exploratory/prototype work** | Either (lightweight) | Skip formal phases as appropriate |

---

## System A: SDD Workflow (AI-Era Methodology)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     System A: SDD (Spec-Driven Development)              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📥 OPTIONAL INPUTS (choose one or more):                               │
│  ├─ ATDD Workshop (formal stakeholder collaboration)                    │
│  ├─ Requirements interview                                              │
│  ├─ PRD document                                                        │
│  └─ User story backlog                                                  │
│       │                                                                 │
│       ▼                                                                 │
│  📝 SDD: SPEC PROPOSAL (/sdd)                                           │
│  ├─ Write technical specification (SPEC.md)                             │
│  ├─ Define acceptance criteria                                          │
│  └─ Output: SPEC-XXX document (authoritative source)                    │
│       │                                                                 │
│       ▼                                                                 │
│  🔍 SDD: SPEC REVIEW                                                    │
│  ├─ Technical review by stakeholders                                    │
│  └─ Output: Approved specification                                      │
│       │                                                                 │
│       ▼                                                                 │
│  🔄 FORWARD DERIVATION (/derive-all)                                    │
│  ├─ AI generates test structure from spec                               │
│  ├─ Creates .feature files (Gherkin)                                    │
│  └─ Creates .test.ts scaffolds                                          │
│       │                                                                 │
│       ▼                                                                 │
│  ⚙️ IMPLEMENTATION                                                       │
│  ├─ AI-assisted code generation                                         │
│  ├─ Optional: Use Double-Loop TDD for complex logic                     │
│  └─ Fill in test implementations                                        │
│       │                                                                 │
│       ▼                                                                 │
│  ✅ VERIFICATION                                                        │
│  ├─ All tests pass                                                      │
│  ├─ Spec-code traceability verified                                     │
│  └─ Demo to stakeholders (optional)                                     │
│       │                                                                 │
│       ▼                                                                 │
│  📦 ARCHIVE & COMPLETE                                                  │
│  ├─ Archive spec with PR/commit links                                   │
│  └─ Merge code to main                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDD Phase Details

#### Phase 1: Optional Inputs 📥

**Purpose**: Gather requirements from various sources.

**Options** (not sequential):
- **ATDD Workshop**: Formal stakeholder collaboration session
- **Requirements Interview**: Direct conversation with PO
- **PRD Document**: Written product requirements
- **User Story Backlog**: Existing prioritized work items

---

#### Phase 2-3: Spec Proposal & Review (SDD) 📝🔍

**Purpose**: Create authoritative technical specification.

**Output**: Approved SPEC-XXX document

```markdown
# SPEC-001: User Authentication

## Summary
Implement user login with email/password.

## Acceptance Criteria
- AC-1: Users can login with valid credentials
- AC-2: Invalid credentials show error message

## Detailed Design
- Use JWT tokens for session management
- Password hashing with bcrypt
- Rate limiting: 5 attempts per minute

## Dependencies
- Database: users table
- JWT library
```

---

#### Phase 4: Forward Derivation 🔄

**Purpose**: AI generates test structures from specification.

**Command**: `/derive-all`

**Output**:
- `.feature` files (Gherkin scenarios)
- `.test.ts` scaffolds (unit test structure)

---

#### Phase 5: Implementation ⚙️

**Purpose**: Implement code guided by spec and tests.

**Approach**:
- AI-assisted code generation from spec
- Fill in derived test implementations
- Optional: Use TDD cycles for complex logic

---

#### Phase 6: Verification ✅

**Purpose**: Ensure implementation matches specification.

**Checklist**:
- [ ] All derived tests pass
- [ ] Spec-code traceability verified
- [ ] No scope creep beyond spec

---

## System B: Double-Loop TDD Workflow (Traditional)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 System B: Double-Loop TDD (BDD + TDD)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📥 OPTIONAL INPUTS (choose one or more):                               │
│  ├─ ATDD Workshop (formal stakeholder collaboration)                    │
│  ├─ Requirements interview                                              │
│  ├─ PRD document                                                        │
│  └─ User story backlog                                                  │
│       │                                                                 │
│       ▼                                                                 │
│  📋 ACCEPTANCE CRITERIA                                                 │
│  ├─ Define Given-When-Then format                                       │
│  └─ Clarify scope and boundaries                                        │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  🔎 BDD OUTER LOOP (/bdd)                                        │   │
│  │  ├─ DISCOVERY: Three Amigos, Example Mapping                     │   │
│  │  ├─ FORMULATION: Write Gherkin scenarios (.feature)              │   │
│  │  └─ PO reviews for correctness                                   │   │
│  │       │                                                          │   │
│  │       ▼                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────┐     │   │
│  │  │  🔴🟢🔵 TDD INNER LOOP (/tdd)                            │    │   │
│  │  │  ┌─────────┐   ┌─────────┐   ┌─────────┐                │    │   │
│  │  │  │ 🔴 RED   │──▶│ 🟢 GREEN│──▶│ 🔵 REFAC│                │    │   │
│  │  │  └─────────┘   └─────────┘   └────┬────┘                │    │   │
│  │  │       ▲                           │                     │    │   │
│  │  │       └───────────────────────────┘                     │    │   │
│  │  │              (more unit tests needed)                   │    │   │
│  │  └──────────────────────────┬──────────────────────────────┘    │   │
│  │                             │ (step implemented)                │   │
│  │                             ▼                                   │   │
│  │                    Next BDD scenario step                       │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │ (all scenarios pass)                  │
│                                ▼                                       │
│  🎬 DEMO & ACCEPTANCE                                                  │
│  ├─ Run acceptance tests live                                          │
│  ├─ Demonstrate functionality                                          │
│  └─ PO accepts or requests refinement                                  │
│       │                                                                │
│       ▼                                                                │
│  ✅ COMPLETE                                                           │
│  ├─ Close user story                                                   │
│  └─ Merge code to main                                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Double-Loop TDD Phase Details

#### Phase 1: Optional Inputs 📥

**Purpose**: Gather requirements from various sources.

Same options as SDD - ATDD Workshop, interviews, PRD, or backlog items.

---

#### Phase 2: Acceptance Criteria 📋

**Purpose**: Define WHAT we're building with stakeholders.

**Output**: User Story with Acceptance Criteria in Given-When-Then format

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
```

---

#### Phase 3: BDD Outer Loop 🔎

**Purpose**: Discovery and Formulation of behavior scenarios.

**Command**: `/bdd`

**Steps**:
1. **Discovery**: Three Amigos session, Example Mapping
2. **Formulation**: Write Gherkin scenarios

**Output**: `.feature` files

```gherkin
Feature: User Authentication

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter email "user@example.com"
    And I enter password "correctpassword"
    And I click the login button
    Then I should be redirected to the dashboard
```

---

#### Phase 4: TDD Inner Loop 🔴🟢🔵

**Purpose**: Implement code driven by unit tests.

**Command**: `/tdd`

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

4. Return to BDD outer loop for next scenario step

---

#### Phase 5: Demo & Acceptance 🎬

**Purpose**: Get formal acceptance from Product Owner.

**Structure**:
1. **Context** (1 min): Remind story and AC
2. **Tests** (2 min): Run tests live
3. **Feature** (5-10 min): Walk through each AC
4. **Feedback** (5 min): Q&A

**Outcomes**:
- ✅ Accepted → Proceed to Complete
- 🔄 Refinement needed → Return to appropriate phase

---

## ATDD: Optional Collaborative Input Method

> **Important**: ATDD is NOT a methodology in itself within this framework.
> It is an **optional input method** that can feed into either SDD or Double-Loop TDD.

### When to Use ATDD Workshop

| Situation | Use ATDD Workshop? |
|-----------|-------------------|
| Multiple stakeholders with differing views | ✅ Yes |
| Complex business rules | ✅ Yes |
| New domain for the team | ✅ Yes |
| Solo developer with clear requirements | ❌ No |
| Technical refactoring | ❌ No |
| Bug fixes | ❌ No |

### ATDD Workshop Structure

**Participants**: Product Owner, Developer, QA (Three Amigos)

**Output**: User Story + Acceptance Criteria + Out of Scope

**Flow**:
1. PO presents user story context
2. Team asks clarifying questions
3. Define Given-When-Then acceptance criteria
4. Document out-of-scope items
5. Feed output into chosen methodology (SDD or Double-Loop TDD)

---

## When to Use Each System

| Scenario | System A: SDD | System B: Double-Loop TDD |
|----------|--------------|---------------------------|
| **Enterprise features** | ✅ With full traceability | ✅ With shared understanding |
| **Complex business logic** | ⚠️ Possible | ✅ BDD excels here |
| **Cross-team collaboration** | ✅ Clear handoffs | ✅ Three Amigos |
| **Small bug fixes** | ❌ Overkill | ⚠️ Use TDD only (inner loop) |
| **Exploratory prototypes** | ❌ Too rigid | ❌ Too rigid |
| **AI-assisted development** | ✅ Native workflow | ⚠️ Less optimal |

---

## Artifacts Produced

### System A: SDD Artifacts

| Phase | Artifact | Format |
|-------|----------|--------|
| Spec Proposal | SPEC-XXX | Markdown |
| Forward Derivation | Feature Files | Gherkin (.feature) |
| Forward Derivation | Test Scaffolds | TypeScript (.test.ts) |
| Archive | Archived Spec | Markdown with links |

### System B: Double-Loop TDD Artifacts

| Phase | Artifact | Format |
|-------|----------|--------|
| Acceptance Criteria | User Story | Markdown |
| BDD Discovery | Example Map | Notes/Cards |
| BDD Formulation | Feature Files | Gherkin (.feature) |
| TDD | Unit Tests | Code |

---

## Commands

| Command | System | Description |
|---------|--------|-------------|
| `/sdd` | A: SDD | Start SDD spec proposal |
| `/derive-all` | A: SDD | Generate tests from spec |
| `/bdd` | B: Double-Loop TDD | Start BDD outer loop |
| `/tdd` | B: Double-Loop TDD | Start TDD inner loop |
| `/atdd` | Both (input) | Start ATDD workshop |
| `/methodology` | Both | Show current methodology status |

---

## Cross-Command Handoff Guidance / 跨指令銜接指引

When one command completes, AI assistants should suggest the logical next step based on the user's workflow context.

### `/discover` → Next Steps

After outputting a discovery report, append:

> **建議下一步 / Suggested Next Steps:**
> Based on the assessment results:
> - **New feature** → `/sdd` to create a specification
> - **Legacy code** → `/reverse spec` to extract existing behavior into a spec
> - **Refactoring** → `/refactor decide` to choose a refactoring strategy
> - **Quick fix** → `/tdd` to write a targeted test and fix

### `/reverse spec` → SDD Review

After generating a reverse-engineered SPEC, append:

> **已產生 SPEC 文件。建議下一步：**
> - 執行 `/sdd` 審查並核准此規格 (review and approve this spec)
> - 執行 `/derive` 從規格推導測試 (requires spec approval first)
> - 手動審查規格中的 `[Inferred]` 和 `[Unknown]` 標記

### `/release` → Post-Release

After completing a release, append:

> **發布完成。後續步驟：**
> - Verify npm publication: `npm view <package> dist-tags`
> - Monitor CI/CD pipeline for deployment status
> - Announce release to stakeholders if applicable

### `/derive` → Implementation

After generating derived tests, append:

> **測試骨架已產生。建議下一步：**
> - 執行 `/bdd-review` 審查產生的 .feature 檔案
> - 開始實作，使用 `/tdd` 循環填入測試實作
> - 確認所有 `[TODO]` 標記已替換為實際程式碼

---

## Related Standards

- [Spec-Driven Development](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/spec-driven-development.md)
- [Behavior-Driven Development](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/behavior-driven-development.md)
- [Test-Driven Development](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/test-driven-development.md)
- [Acceptance Test-Driven Development](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/acceptance-test-driven-development.md)
- [Forward Derivation Standards](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/forward-derivation-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-02-12 | Add cross-command handoff guidance section |
| 2.0.0 | 2026-01-25 | Major refactor: Two independent systems, ATDD as optional input |
| 1.0.0 | 2026-01-19 | Initial release |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
