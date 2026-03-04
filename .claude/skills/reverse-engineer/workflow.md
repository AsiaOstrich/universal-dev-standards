# Reverse Engineering Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-19

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/reverse-engineer/workflow.md)

This guide provides detailed workflows for reverse engineering code into SDD specifications.

---

## Overview

Reverse engineering transforms existing implementations into structured specification documents. Unlike forward engineering (spec → code), reverse engineering extracts knowledge from code while acknowledging the inherent limitations of this approach.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Reverse Engineering Pipeline                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│  │   Code    │──▶│   Tests   │──▶│  Config   │──▶│   Docs    │        │
│  │  Analysis │   │  Analysis │   │  Analysis │   │  Analysis │        │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘        │
│        │               │               │               │               │
│        └───────────────┴───────────────┴───────────────┘               │
│                               │                                         │
│                               ▼                                         │
│                    ┌───────────────────┐                               │
│                    │   Draft Spec      │                               │
│                    │   with Labels     │                               │
│                    └─────────┬─────────┘                               │
│                              │                                         │
│                              ▼                                         │
│                    ┌───────────────────┐                               │
│                    │   Human Review    │                               │
│                    │   & Completion    │                               │
│                    └─────────┬─────────┘                               │
│                              │                                         │
│                              ▼                                         │
│                    ┌───────────────────┐                               │
│                    │  Final Spec       │                               │
│                    │  Document         │                               │
│                    └───────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Code Scanning

### 1.1 Identify Entry Points

Scan for application entry points:

| Entry Point Type | Common Patterns | Files to Check |
|------------------|-----------------|----------------|
| **API Routes** | Express routes, FastAPI endpoints | `routes/`, `controllers/`, `api/` |
| **Main Functions** | `main()`, `__main__`, `index.ts` | Root files, `src/index.*` |
| **Event Handlers** | Message queues, webhooks | `handlers/`, `events/`, `listeners/` |
| **CLI Commands** | Argument parsers, command definitions | `commands/`, `cli/`, `bin/` |
| **Scheduled Jobs** | Cron jobs, background tasks | `jobs/`, `tasks/`, `workers/` |

### 1.2 Map Module Structure

Create a dependency graph:

```
src/
├── controllers/        # Entry points
│   ├── UserController.ts  → depends on → UserService, UserDTO
│   └── AuthController.ts  → depends on → AuthService, TokenService
├── services/          # Business logic
│   ├── UserService.ts     → depends on → UserRepository
│   └── AuthService.ts     → depends on → UserService, TokenService
├── repositories/      # Data access
│   └── UserRepository.ts  → depends on → Database, User entity
└── models/            # Data structures
    └── User.ts            → no dependencies
```

### 1.3 Extract Type Definitions

Document all data structures:

```markdown
## Data Models

### User Entity
[Confirmed] User data model defined at src/models/User.ts:5-25
- [Source: Code] src/models/User.ts:5-25

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| email | string | Yes | Unique constraint |
| password | string | Yes | Hashed with BCrypt |
| createdAt | Date | Yes | Auto-generated |

[Inferred] Password appears to be hashed based on field name and validation
[Need Confirmation] What hashing algorithm is used?
```

### 1.4 Configuration Discovery

Identify configuration sources:

```markdown
## Configuration

### Environment Variables
[Confirmed] Found in src/config/env.ts:1-30
- [Source: Code] src/config/env.ts

| Variable | Default | Required | Purpose |
|----------|---------|----------|---------|
| DATABASE_URL | - | Yes | PostgreSQL connection |
| JWT_SECRET | - | Yes | Token signing |
| NODE_ENV | development | No | Environment mode |

### Application Settings
[Confirmed] Found in src/config/app.ts:1-20
- [Source: Code] src/config/app.ts

| Setting | Value | Notes |
|---------|-------|-------|
| sessionTimeout | 3600 | 1 hour in seconds |
| maxLoginAttempts | 5 | [Unknown] What happens after 5 attempts? |
```

---

## Phase 2: Test Analysis

### 2.1 Parse Test Structure

Extract test organization:

```markdown
## Test Coverage Analysis

### Test Files Scanned
- src/tests/unit/UserService.test.ts (15 tests)
- src/tests/unit/AuthService.test.ts (12 tests)
- src/tests/integration/api.test.ts (8 tests)
- src/tests/e2e/login.spec.ts (5 tests)

### Coverage by Module
| Module | Unit Tests | Integration | E2E |
|--------|------------|-------------|-----|
| UserService | 15 ✅ | 3 | 2 |
| AuthService | 12 ✅ | 5 | 3 |
| PaymentService | 0 ⚠️ | 0 | 0 |
```

### 2.2 Extract Acceptance Criteria

Transform test cases into criteria:

**From Unit Test**:
```typescript
// src/tests/unit/UserService.test.ts
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid email', async () => {...});
    it('should reject duplicate email', async () => {...});
    it('should hash password before saving', async () => {...});
  });
});
```

**To Acceptance Criteria**:
```markdown
## Acceptance Criteria

### User Creation
[Inferred] From tests at src/tests/unit/UserService.test.ts:5-20

**Happy Path**:
- [ ] Create user with valid email address
- [ ] Hash password before saving to database

**Error Handling**:
- [ ] Reject duplicate email with appropriate error

[Unknown] What constitutes a "valid" email? (validation rules not in test)
[Need Confirmation] What error message/code for duplicate email?
```

### 2.3 Identify Coverage Gaps

Note missing test coverage:

```markdown
## Test Coverage Gaps

### Critical Gaps (No Tests Found)
| Feature | Risk Level | Recommendation |
|---------|------------|----------------|
| PaymentService | 🔴 High | Add tests before changes |
| Error handling in AuthController | 🟡 Medium | Add edge case tests |

### Partial Coverage
| Feature | Covered | Missing |
|---------|---------|---------|
| User CRUD | Create, Read | Update, Delete |
| Authentication | Login | Logout, Refresh |

[Unknown] Are these intentional exclusions or oversights?
```

---

## Phase 3: Gap Identification

### 3.1 Categorize Unknowns

Create a structured list of gaps:

```markdown
## Information Gaps Requiring Human Input

### Category: Business Context
| Question | Impact | Who Can Answer |
|----------|--------|----------------|
| Why was OAuth implemented for this app? | Design understanding | Product Owner |
| What user problems does this feature solve? | Motivation section | Product Owner |
| What is the target user persona? | User Story | UX/Product |

### Category: Technical Decisions
| Question | Impact | Who Can Answer |
|----------|--------|----------------|
| Why BCrypt over Argon2 for passwords? | Security assessment | Original Developer |
| Why PostgreSQL over MongoDB? | Architecture understanding | Tech Lead |
| What drove the microservices decision? | Design rationale | Architect |

### Category: Risk Assessment
| Question | Impact | Who Can Answer |
|----------|--------|----------------|
| What are the failure modes for payment? | Risk documentation | Domain Expert |
| Data retention requirements? | Compliance | Legal/Compliance |
| Security threat model? | Security section | Security Team |
```

### 3.2 Mark Confidence Levels

Assign confidence to each extracted item:

| Confidence | Label | Evidence Required |
|------------|-------|-------------------|
| 100% | `[Confirmed]` | Direct code reference with line numbers |
| 70-99% | `[Inferred]` | Pattern-based deduction + reasoning |
| 30-69% | `[Assumption]` | Common practice, needs verification |
| 0-29% | `[Unknown]` | Cannot determine from code |

---

## Phase 4: Spec Generation

### 4.1 Use Template

Apply the [reverse-spec-template.md](../../templates/reverse-spec-template.md):

```markdown
# [SPEC-XXX] Feature Name (Reverse Engineered)

> ⚠️ This spec was reverse engineered from existing code
> Last analyzed: YYYY-MM-DD
> Source: path/to/analyzed/code

## Summary
[Confirmed] {Summary extracted from code analysis}
- [Source: Code] {primary_file}:{lines}

## Motivation
[Unknown] Requires human input
- Why was this feature built?
- What problem does it solve?
- Who requested this feature?

## Detailed Design
...
```

### 4.2 Section-by-Section Guide

| Section | Source | Confidence |
|---------|--------|------------|
| Summary | Code structure + entry points | [Confirmed] |
| Motivation | Cannot extract from code | [Unknown] |
| Detailed Design | Code + architecture analysis | [Confirmed/Inferred] |
| Acceptance Criteria | Test files | [Inferred] |
| Dependencies | package.json, imports | [Confirmed] |
| Risks | Cannot determine | [Unknown] |
| Out of Scope | Cannot determine | [Unknown] |

---

## Phase 5: Human Review

### 5.1 Review Checklist

```markdown
## Human Review Checklist

### Accuracy Verification
- [ ] All `[Confirmed]` items verified against actual code
- [ ] Source citations are correct (file:line)
- [ ] No fabricated APIs or configurations

### Inference Validation
- [ ] All `[Inferred]` items reviewed for accuracy
- [ ] Incorrect inferences corrected or removed
- [ ] Edge cases considered

### Gap Completion
- [ ] Motivation section filled in
- [ ] Risk assessment added
- [ ] User stories documented
- [ ] Trade-off decisions recorded

### Final Verification
- [ ] Spec reviewed by original developer (if available)
- [ ] Stakeholder sign-off obtained
- [ ] All `[Unknown]` labels resolved or acknowledged
```

### 5.2 Stakeholder Review Template

```markdown
## Review Request

**Spec**: [SPEC-XXX] Feature Name
**Generated**: YYYY-MM-DD
**Review Due**: YYYY-MM-DD

### Questions for Stakeholders

1. **For Product Owner**:
   - Is the documented behavior correct?
   - What was the original motivation?
   - Are there undocumented requirements?

2. **For Original Developer**:
   - Are the technical inferences accurate?
   - What trade-offs were made?
   - Are there known issues or tech debt?

3. **For Domain Expert**:
   - Are the business rules complete?
   - What risks should be documented?
   - What edge cases exist?
```

---

## Handling Legacy Code Challenges

### Challenge 1: No Tests

When tests don't exist:

1. Document the gap clearly
2. Infer behavior from code comments (if any)
3. Mark all acceptance criteria as `[Assumption]`
4. Recommend writing tests as next step

### Challenge 2: No Comments

When documentation is absent:

1. Use meaningful names as hints
2. Trace data flow for understanding
3. Mark understanding as `[Inferred]`
4. Prioritize human review

### Challenge 3: Spaghetti Code

When structure is unclear:

1. Focus on input/output boundaries
2. Document observable behavior
3. Mark internal logic as `[Unknown]`
4. Suggest refactoring before detailed spec

### Challenge 4: Multiple Implementations

When code has variants:

1. Document all variants found
2. Note which appears to be current
3. Mark as `[Need Confirmation]`
4. Ask which is canonical

---

## Quality Gates

Before finalizing a reverse-engineered spec:

| Gate | Requirement | Check |
|------|-------------|-------|
| **Source Attribution** | Every claim has file:line | ✅/❌ |
| **Certainty Labels** | Every statement is labeled | ✅/❌ |
| **No Fabrication** | No invented APIs/configs | ✅/❌ |
| **Gap Documentation** | All unknowns listed | ✅/❌ |
| **Human Review** | Stakeholder has reviewed | ✅/❌ |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release |
