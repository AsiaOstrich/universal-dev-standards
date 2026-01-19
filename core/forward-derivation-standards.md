# Forward Derivation Standards | 正向推演標準

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Applicability**: All projects using Spec-Driven Development

> **Language**: [English](../core/forward-derivation-standards.md) | [繁體中文](../locales/zh-TW/core/forward-derivation-standards.md)

---

## Purpose

This standard defines the principles and workflows for Forward Derivation—automatically generating BDD scenarios, TDD test skeletons, and ATDD acceptance tests from approved SDD specifications. Forward Derivation complements [Reverse Engineering Standards](reverse-engineering-standards.md), creating a symmetrical derivation system.

**Key Benefits**:
- Consistent test structures aligned with specification
- Traceability from requirements to tests (@SPEC-XXX, @AC-N tags)
- Faster TDD bootstrap from approved specifications
- Reduced manual translation errors

---

## Forward Derivation Workflow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       Forward Derivation Workflow                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ Parse SPEC  │───▶│Extract AC   │───▶│Generate BDD │───▶│Generate   │  │
│  │ 解析規格     │    │提取驗收條件  │    │生成 BDD     │    │TDD/ATDD   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │ Human Review  │ │
│        │                  │                  │         │ 人類審查       │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [Source]           [Parsed]          [Generated]        [Reviewed]    │
│   SPEC-XXX.md        AC List           .feature/.test     Ready to use  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Workflow Stages

| Stage | Description | Output | Certainty Level |
|-------|-------------|--------|-----------------|
| **Parse SPEC** | Read approved specification document | SPEC metadata, sections | [Source] |
| **Extract AC** | Parse Acceptance Criteria (GWT or bullet) | Structured AC list | [Derived] |
| **Generate BDD** | Transform AC to Gherkin scenarios | .feature files | [Generated] |
| **Generate TDD** | Create test skeletons from AC | Test files with TODOs | [Generated] |
| **Generate ATDD** | Create acceptance test tables | Markdown test tables | [Generated] |
| **Human Review** | Verify generated outputs | Approved test structures | [Reviewed] |

---

## Core Principles

### 1. Spec-Bounded Generation

**Rule**: Only derive content that exists in the approved specification. Never add features, scenarios, or tests beyond what the AC explicitly defines.

**正向推演原則**：只推演規格中明確存在的內容。不添加 AC 未明確定義的功能、場景或測試。

**Correct**:
```markdown
# SPEC AC
- [ ] User can login with email and password

# Generated BDD (correct)
Scenario: User login with email and password
```

**Incorrect**:
```markdown
# Generated BDD (wrong - adding beyond spec)
Scenario: User login with email and password
Scenario: User login with social auth  # <-- NOT in AC
Scenario: User password recovery       # <-- NOT in AC
```

### 2. Anti-Hallucination Compliance

**Rule**: This standard strictly follows [Anti-Hallucination Standards](anti-hallucination.md):

- **1:1 Mapping**: Each AC produces exactly ONE scenario/test group
- **No Fabrication**: Never invent acceptance criteria or test cases
- **Source Attribution**: All generated items reference source SPEC and AC number

**Anti-Hallucination Check**:
```
Input: SPEC with N acceptance criteria
Output: Exactly N scenarios (BDD), N test groups (TDD), N acceptance tables (ATDD)

If output count ≠ input count → VIOLATION
```

### 3. Source Attribution

**Rule**: Every generated item MUST include traceability:

```gherkin
# BDD Example
# Generated from: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

```typescript
// TDD Example
/**
 * Generated from: specs/SPEC-001.md
 * AC: AC-1
 */
describe('AC-1: User login with valid credentials', () => {
```

### 4. Certainty Labels

Use these labels to indicate derivation certainty:

| Tag | Definition | Example |
|-----|------------|---------|
| `[Source]` | Direct content from SPEC | Feature title, AC text |
| `[Derived]` | Transformed from SPEC content | GWT from bullet AC |
| `[Generated]` | AI-generated structure | Test skeleton, TODO comments |
| `[TODO]` | Requires human implementation | Test assertions, step definitions |

---

## Input Format Requirements

### Supported AC Formats

#### Format 1: Given-When-Then (Preferred)

```markdown
### AC-1: User Login
**Given** a registered user with valid credentials
**When** the user submits login form with email and password
**Then** the user is redirected to dashboard
**And** a session token is created
```

#### Format 2: Bullet Points

```markdown
### AC-1: User Login
- User can login with email and password
- Login redirects to dashboard on success
- Login shows error for invalid credentials
```

#### Format 3: Checklist

```markdown
## Acceptance Criteria
- [ ] User can login with email and password
- [ ] Session is created on successful login
- [ ] Error message shown for invalid credentials
```

---

## Output Formats

### BDD Output (.feature)

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: forward-derivation v1.0.0
# Generated at: 2026-01-19T10:00:00Z

@SPEC-001
Feature: User Authentication
  As a user
  I want to login to the system
  So that I can access my dashboard

  @AC-1 @happy-path
  Scenario: User login with valid credentials
    # [Source] From SPEC-001 AC-1
    Given a registered user with valid credentials
    When the user submits login form with email and password
    Then the user is redirected to dashboard
    And a session token is created

  @AC-2 @error-handling
  Scenario: Login fails with invalid credentials
    # [Source] From SPEC-001 AC-2
    Given a user with invalid credentials
    When the user submits login form
    Then an error message is displayed
    And no session is created
```

### TDD Output (.test.ts)

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2
 *
 * [Generated] This file contains test skeletons.
 * [TODO] Implement test logic and assertions.
 */

describe('SPEC-001: User Authentication', () => {
  /**
   * AC-1: User login with valid credentials
   * [Source] specs/SPEC-001.md#AC-1
   */
  describe('AC-1: User login with valid credentials', () => {
    it('should redirect to dashboard on successful login', async () => {
      // Arrange
      // [TODO] Set up registered user with valid credentials

      // Act
      // [TODO] Submit login form with email and password

      // Assert
      // [TODO] Verify redirect to dashboard
      // [TODO] Verify session token is created
      expect(true).toBe(true); // Placeholder - replace with actual assertion
    });
  });

  /**
   * AC-2: Login fails with invalid credentials
   * [Source] specs/SPEC-001.md#AC-2
   */
  describe('AC-2: Login fails with invalid credentials', () => {
    it('should display error message for invalid credentials', async () => {
      // Arrange
      // [TODO] Set up user with invalid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify error message is displayed
      // [TODO] Verify no session is created
      expect(true).toBe(true); // Placeholder - replace with actual assertion
    });
  });
});
```

### ATDD Output (acceptance.md)

```markdown
# SPEC-001 Acceptance Tests

**Specification**: [SPEC-001](../specs/SPEC-001.md)
**Generated**: 2026-01-19
**Status**: Pending Review

---

## AT-001: User login with valid credentials

**Source**: AC-1 from SPEC-001

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to login page | Login form is displayed | [ ] |
| 2 | Enter valid email | Email field accepts input | [ ] |
| 3 | Enter valid password | Password field accepts input (masked) | [ ] |
| 4 | Click "Login" button | Form is submitted | [ ] |
| 5 | Verify redirect | User is on dashboard page | [ ] |
| 6 | Verify session | Session token exists in storage | [ ] |

**Prerequisites**: User account exists in system

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

## AT-002: Login fails with invalid credentials

**Source**: AC-2 from SPEC-001

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to login page | Login form is displayed | [ ] |
| 2 | Enter invalid email | Email field accepts input | [ ] |
| 3 | Enter invalid password | Password field accepts input | [ ] |
| 4 | Click "Login" button | Form is submitted | [ ] |
| 5 | Verify error | Error message is displayed | [ ] |
| 6 | Verify no session | No session token in storage | [ ] |

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________
```

---

## Bullet-to-GWT Transformation

When AC is written as bullet points, transform using this pattern:

### Transformation Rules

| Bullet Pattern | Maps To | Example |
|----------------|---------|---------|
| Condition/state | Given | "User is logged in" → Given user is logged in |
| User action | When | "User clicks button" → When user clicks button |
| System response | Then | "Message is displayed" → Then message is displayed |
| "can/should/must" | When + Then | "User can delete item" → When user deletes item Then item is removed |

### Example Transformation

**Input (Bullet)**:
```markdown
- [ ] User can add item to cart
- [ ] Cart displays item count
- [ ] Cart total updates automatically
```

**Output (GWT)**:
```gherkin
Scenario: Add item to cart
  Given user is on product page
  When user clicks "Add to Cart" button
  Then item is added to cart
  And cart displays updated item count
  And cart total updates automatically
```

---

## Integration with Development Methodologies

### Forward Derivation Pipeline

```
┌───────────────────────────────────────────────────────────────────────┐
│              Symmetrical Derivation System                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  REVERSE ENGINEERING                    FORWARD DERIVATION            │
│  (Code → Spec)                          (Spec → Tests)                │
│                                                                       │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ Existing Code │                      │ Approved SPEC │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ /reverse-spec │                      │  /derive-bdd  │            │
│  │ /reverse-bdd  │◀─────SPEC-XXX───────▶│  /derive-tdd  │            │
│  │ /reverse-tdd  │                      │  /derive-atdd │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ Draft SPEC    │                      │ .feature      │            │
│  │ [Confirmed]   │                      │ .test.ts      │            │
│  │ [Inferred]    │                      │ acceptance.md │            │
│  │ [Unknown]     │                      │ [Generated]   │            │
│  └───────────────┘                      └───────────────┘            │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### With Integrated Flow Methodology

Forward Derivation fits between `spec-review` and `discovery` phases:

```yaml
spec-review → forward-derivation → discovery
```

1. **Spec Review (SDD)**: Specification approved
2. **Forward Derivation**: Auto-generate BDD scenarios, TDD skeletons
3. **Discovery (BDD)**: Review and refine generated scenarios with stakeholders
4. **TDD Red**: Start implementing tests using generated skeletons

---

## Commands

### Command Reference

| Command | Input | Output | Purpose |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin scenarios |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → Test skeletons |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → Acceptance test tables |
| `/derive-all` | SPEC-XXX.md | All above | Full derivation pipeline |

### Command Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--lang` | string | typescript | Target: ts, js, python, java, go |
| `--framework` | string | vitest | Framework: vitest, jest, pytest, junit, go-test |
| `--output-dir` | string | ./generated | Output directory |
| `--dry-run` | boolean | false | Preview without file creation |

### Usage Examples

```bash
# Generate BDD scenarios from specification
/derive-bdd specs/SPEC-001.md

# Generate TDD test skeleton with Python/pytest
/derive-tdd specs/SPEC-001.md --lang python --framework pytest

# Generate all outputs
/derive-all specs/SPEC-001.md --output-dir ./generated

# Preview without creating files
/derive-all specs/SPEC-001.md --dry-run
```

---

## Anti-Patterns to Avoid

### Generation Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Adding Extra Scenarios** | Test bloat, misleading coverage | Strict 1:1 AC mapping |
| **Inventing Test Cases** | False confidence | Only derive from explicit AC |
| **Skipping Source Attribution** | Lost traceability | Always include @SPEC-XXX, @AC-N |
| **Over-Specifying Steps** | Brittle tests | Keep steps at business level |
| **Missing TODO Markers** | Incomplete implementation | Mark all generated code with [TODO] |

### Process Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Deriving from Draft SPEC** | Invalid outputs | Only use approved specifications |
| **Skipping Human Review** | Quality issues | Always review generated outputs |
| **Treating Skeletons as Complete** | Missing assertions | Fill in [TODO] sections |
| **Ignoring Language Conventions** | Inconsistent code | Use appropriate language templates |

---

## Best Practices

### Do's

- ✅ Only derive from approved specifications
- ✅ Maintain strict 1:1 AC to output mapping
- ✅ Include source attribution in all outputs
- ✅ Use [TODO] markers for sections requiring implementation
- ✅ Review generated outputs before use
- ✅ Keep generated steps at business/domain level
- ✅ Use appropriate language/framework templates

### Don'ts

- ❌ Add scenarios beyond what AC defines
- ❌ Derive from draft or unapproved specs
- ❌ Skip human review of generated outputs
- ❌ Treat generated skeletons as complete tests
- ❌ Remove source attribution comments
- ❌ Over-specify implementation details in generated code

---

## Tool Integration

### Skill References

- [Forward Derivation Skill](../skills/claude-code/forward-derivation/SKILL.md) - Detailed workflow implementation
- [Spec-Driven Development Skill](../skills/claude-code/spec-driven-dev/SKILL.md) - SDD workflow
- [BDD Assistant Skill](../skills/claude-code/bdd-assistant/SKILL.md) - Gherkin refinement
- [TDD Assistant Skill](../skills/claude-code/tdd-assistant/SKILL.md) - Test implementation

---

## Related Standards

- [Reverse Engineering Standards](reverse-engineering-standards.md) - Symmetrical counterpart (Code → Spec)
- [Spec-Driven Development](spec-driven-development.md) - Input specification format
- [Behavior-Driven Development](behavior-driven-development.md) - BDD output format
- [Test-Driven Development](test-driven-development.md) - TDD output usage
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD output format
- [Anti-Hallucination Guidelines](anti-hallucination.md) - Generation compliance

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
